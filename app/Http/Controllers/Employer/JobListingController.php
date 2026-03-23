<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\JobCollaborator;
use App\Models\JobListing;
use App\Models\JobApplication;
use App\Models\Interview;
use App\Models\User;
use App\Mail\ApplicationRejected;
use App\Mail\InterviewScheduled;
use App\Notifications\ApplicationRejectedNotification;
use App\Notifications\InterviewScheduledNotification;
use App\Notifications\NewApplicationNotification;
use App\Notifications\AdminNewJobPostedNotification;
use App\Notifications\CollaborationInviteNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class JobListingController extends Controller
{
    /**
     * List all jobs for the authenticated employer.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load('employerProfile');

        // Helper closure to format a job
        $formatJob = function (JobListing $job, bool $isOwner) use ($user) {
            // Get any active report (pending, resolved, or dismissed) - not just pending
            $pendingReport = $job->reports()
                ->whereIn('status', ['pending', 'resolved', 'dismissed'])
                ->latest('created_at')
                ->first();

            return [
                'id'                 => $job->id,
                'title'              => $job->title,
                'location'           => $job->location,
                'company'            => $job->company_name ?? $user->employerProfile?->company_name ?? "{$user->first_name} {$user->last_name}",
                'status'             => $job->status,
                'applications_count' => $job->applications_count,
                'posted_date'        => $job->created_at->toISOString(),
                'description'        => $job->description,
                'responsibilities'   => $this->splitList($job->responsibilities),
                'qualifications'     => $this->splitList($job->qualifications),
                'requirements'       => $this->splitList($job->requirements),
                'screener_questions' => $this->splitList($job->screener_questions),
                'project_timeline'   => $job->project_timeline,
                'onboarding_process' => $job->onboarding_process,
                'logo_path'          => $this->resolveLogoUrl($job->logo_path),
                'employment_type'    => $job->employment_type,
                'salary_min'         => $job->salary_min,
                'salary_max'         => $job->salary_max,
                'salary_currency'    => $job->salary_currency,
                'skills_required'    => $job->skills_required ?? [],
                'experience_level'   => $job->experience_level,
                'is_remote'          => $job->is_remote,
                'deadline'           => $job->deadline?->toDateString(),
                'industry'           => $job->industry,
                'application_limit'  => $job->application_limit,
                'work_arrangement'   => $job->work_arrangement,
                'is_owner'           => $isOwner,
                'report_id'          => $pendingReport?->id,
                'report_status'      => $pendingReport?->status,
                'appeal_status'      => $pendingReport?->appeal_status,
                'report_reason'      => $pendingReport?->reason,
                'reported_at'        => $pendingReport?->created_at?->toISOString(),
                'report_count'       => $job->reports()->count(),
            ];
        };

        // Jobs owned by this employer
        $ownedJobs = JobListing::where('employer_id', $user->id)
            ->withCount('applications')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($job) => $formatJob($job, true));

        // Jobs where this employer is an accepted collaborator
        $collaboratedJobIds = JobCollaborator::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->pluck('job_listing_id');

        $collaboratedJobs = JobListing::whereIn('id', $collaboratedJobIds)
            ->withCount('applications')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($job) => $formatJob($job, false));

        // Pending invitation count
        $pendingInvitationsCount = JobCollaborator::where('user_id', $user->id)
            ->where('status', 'pending')
            ->whereHas('jobListing')
            ->whereHas('inviter')
            ->count();

        return Inertia::render('Employer/ManageJobs', [
            'user'                     => $user,
            'profile'                  => $user->employerProfile,
            'jobs'                     => $ownedJobs->concat($collaboratedJobs)->values(),
            'isVerified'               => $user->employerProfile?->is_verified ?? false,
            'pendingInvitationsCount'  => $pendingInvitationsCount,
        ]);
    }

    /**
     * Show the create job form page.
     */
    public function create(Request $request): Response
    {
        $user        = $request->user()->load('employerProfile');
        $companyName = $user->employerProfile?->company_name ?? "{$user->first_name} {$user->last_name}";

        return Inertia::render('Employer/CreateJob', [
            'user'        => $user,
            'profile'     => $user->employerProfile,
            'companyName' => $companyName,
        ]);
    }

    /**
     * Create a lightweight draft job so collaborators can be invited before final submit.
     */
    public function createDraft(Request $request): JsonResponse
    {
        $user = $request->user()->load('employerProfile');

        $job = JobListing::create($this->persistableJobAttributes([
            'employer_id'        => $user->id,
            'title'              => 'Untitled Job',
            'company_name'       => $user->employerProfile?->company_name ?? "{$user->first_name} {$user->last_name}",
            'location'           => 'To be updated',
            'description'        => 'Draft job listing. Complete details before publishing.',
            'employment_type'    => 'Full-time',
            'salary_currency'    => 'USD',
            'is_remote'          => false,
            'status'             => 'draft',
        ]));

        return response()->json([
            'id' => $job->id,
        ]);
    }

    /**
     * Store a new job listing.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title'               => 'required|string|max:255',
            'company'             => 'nullable|string|max:255',
            'location'            => 'required|string|max:255',
            'description'         => 'required|string|min:10',
            'responsibilities'    => 'nullable|array',
            'responsibilities.*'  => 'string|max:500',
            'qualifications'      => 'nullable|array',
            'qualifications.*'    => 'string|max:500',
            'requirements'        => 'nullable|array',
            'requirements.*'      => 'string|max:500',
            'screener_questions'  => 'nullable|array',
            'screener_questions.*'=> 'string|max:500',
            'project_timeline'    => 'nullable|string|max:10000',
            'onboarding_process'  => 'nullable|string|max:10000',
            'logo'                => 'nullable|image|max:5120',
            'employment_type'     => 'required|string',
            'salary_min'          => 'nullable|numeric|min:0',
            'salary_max'          => 'nullable|numeric|min:0|gte:salary_min',
            'salary_currency'     => 'nullable|string|size:3',
            'skills_required'     => 'nullable|array',
            'skills_required.*'   => 'string|max:100',
            'experience_level'    => 'nullable|string',
            'industry'            => 'nullable|string',
            'is_remote'           => 'boolean',
            'deadline'            => 'nullable|date',
            'status'              => 'nullable|in:active,inactive,draft',
            'application_limit'   => 'nullable|integer|min:1',
            'work_arrangement'    => 'nullable|string|max:100',
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $storedPath = $request->file('logo')->store("job-logos/{$request->user()->id}", 'public');
            $logoPath   = '/storage/' . $storedPath;
        }

        $job = JobListing::create($this->persistableJobAttributes([
            'employer_id'        => $request->user()->id,
            'title'              => $request->title,
            'company_name'       => $request->input('company'),
            'location'           => $request->location,
            'description'        => $request->description,
            'responsibilities'   => $this->normalizeJsonList($request->input('responsibilities')),
            'qualifications'     => $this->normalizeJsonList($request->input('qualifications')),
            'requirements'       => $this->normalizeJsonList($request->input('requirements')),
            'screener_questions' => $this->normalizeJsonList($request->input('screener_questions')),
            'project_timeline'   => $request->input('project_timeline'),
            'onboarding_process' => $request->input('onboarding_process'),
            'logo_path'          => $logoPath,
            'employment_type'    => $request->employment_type,
            'salary_min'         => $request->salary_min,
            'salary_max'         => $request->salary_max,
            'salary_currency'    => $request->salary_currency ?? 'USD',
            'skills_required'    => $request->skills_required ?? [],
            'experience_level'   => $request->experience_level,
            'industry'           => $request->industry,
            'is_remote'          => $request->boolean('is_remote'),
            'deadline'           => $request->deadline,
            'status'             => $request->status ?? 'active',
            'application_limit'  => $request->application_limit,
            'work_arrangement'   => $request->input('work_arrangement'),
        ]));

        // Notify all admins about the new job posting
        $employer = $request->user();
        User::where('role', 'admin')->each(
            fn($admin) => $admin->notify(new AdminNewJobPostedNotification($job, $employer))
        );

        return redirect()->route('employer.jobs.index')
            ->with('success', 'Job listing created successfully!');
    }

    /**
     * Show the Job Details page for a single listing.
     */
    public function show(Request $request, JobListing $job): Response
    {
        $this->authorizeJob($request, $job);

        $user    = $request->user()->load('employerProfile');
        $profile = $user->employerProfile;
        $isOwner = $job->employer_id === $user->id;

        // Build hiring team from collaborators
        $hiringTeam = $job->collaborators()
            ->with('user')
            ->get()
            ->map(fn(JobCollaborator $c) => [
                'id'     => $c->id,
                'name'   => "{$c->user->first_name} {$c->user->last_name}",
                'role'   => $c->role,
                'status' => $c->status,
                'avatar' => $c->user->avatar,
                'email'  => $c->user->email,
            ]);

        // Add the owner at the top
        $owner = $job->employer;
        $hiringTeam->prepend([
            'id'     => null,
            'name'   => "{$owner->first_name} {$owner->last_name}",
            'role'   => 'Creator',
            'status' => 'owner',
            'avatar' => $owner->avatar,
            'email'  => $owner->email,
        ]);

        return Inertia::render('Employer/JobDetails', [
            'user'       => $user,
            'profile'    => $profile,
            'isVerified' => $profile?->is_verified ?? false,
            'isOwner'    => $isOwner,
            'job'        => [
                'id'                 => $job->id,
                'title'              => $job->title,
                'company'            => $job->company_name ?? $profile?->company_name ?? "{$user->first_name} {$user->last_name}",
                'location'           => $job->location,
                'status'             => $job->status,
                'applications_count' => $job->applications()->count(),
                'posted_date'        => $job->created_at->toISOString(),
                'description'        => $job->description,
                'responsibilities'   => $this->splitList($job->responsibilities),
                'qualifications'     => $this->splitList($job->qualifications),
                'requirements'       => $this->splitList($job->requirements),
                'screener_questions' => $this->splitList($job->screener_questions),
                'employment_type'    => $job->employment_type,
                'salary_min'         => $job->salary_min,
                'salary_max'         => $job->salary_max,
                'salary_currency'    => $job->salary_currency ?? 'USD',
                'skills_required'    => $job->skills_required ?? [],
                'experience_level'   => $job->experience_level,
                'is_remote'          => (bool) $job->is_remote,
                'deadline'           => $job->deadline?->toDateString(),
                'industry'           => $job->industry,
                'application_limit'  => $job->application_limit,
                'work_arrangement'   => $job->work_arrangement,
                'logo_path'          => $this->resolveLogoUrl($job->logo_path),
                'views_count'        => $job->views_count ?? 0,
                'clicks_count'       => $job->clicks_count ?? 0,
                'hiring_team'        => $hiringTeam->values()->toArray(),
            ],
        ]);
    }

    /**
     * Show the standalone edit page for a job listing.
     */
    public function edit(Request $request, JobListing $job): Response
    {
        $this->authorizeJob($request, $job);

        $user        = $request->user()->load('employerProfile');
        $companyName = $user->employerProfile?->company_name ?? "{$user->first_name} {$user->last_name}";

        // Collaborators for the Hiring Team tab
        $collaborators = $job->collaborators()
            ->with('user')
            ->get()
            ->map(fn(JobCollaborator $c) => [
                'id'         => $c->id,
                'user_id'    => $c->user->id,
                'first_name' => $c->user->first_name,
                'last_name'  => $c->user->last_name,
                'email'      => $c->user->email,
                'avatar'     => $c->user->avatar,
                'role'       => $c->role,
                'status'     => $c->status,
            ]);

        return Inertia::render('Employer/CreateJob', [
            'user'          => $user,
            'profile'       => $user->employerProfile,
            'companyName'   => $companyName,
            'mode'          => 'edit',
            'collaborators' => $collaborators,
            'job'           => [
                'id'                 => $job->id,
                'title'              => $job->title,
                'company'            => $job->company_name,
                'location'           => $job->location,
                'description'        => $job->description,
                'responsibilities'   => $this->splitList($job->responsibilities),
                'qualifications'     => $this->splitList($job->qualifications),
                'requirements'       => $this->splitList($job->requirements),
                'screener_questions' => $this->splitList($job->screener_questions),
                'employment_type'    => $job->employment_type,
                'salary_min'         => $job->salary_min,
                'salary_max'         => $job->salary_max,
                'salary_currency'    => $job->salary_currency ?? 'USD',
                'skills_required'    => $job->skills_required ?? [],
                'experience_level'   => $job->experience_level,
                'is_remote'          => (bool) $job->is_remote,
                'deadline'           => $job->deadline?->toDateString(),
                'status'             => $job->status,
                'industry'           => $job->industry,
                'application_limit'  => $job->application_limit,
                'work_arrangement'   => $job->work_arrangement,
                // Fully-resolved absolute URL so the <img> renders correctly
                'logo_path'          => $this->resolveLogoUrl($job->logo_path),
            ],
        ]);
    }

    /**
     * Update an existing job listing.
     */
    public function update(Request $request, JobListing $job): RedirectResponse
    {
        $this->authorizeJob($request, $job);
        $wasDraft = $job->status === 'draft';

        $request->validate([
            'title'               => 'required|string|max:255',
            'company'             => 'nullable|string|max:255',
            'location'            => 'required|string|max:255',
            'description'         => 'required|string|min:10',
            'responsibilities'    => 'nullable|array',
            'responsibilities.*'  => 'string|max:500',
            'qualifications'      => 'nullable|array',
            'qualifications.*'    => 'string|max:500',
            'requirements'        => 'nullable|array',
            'requirements.*'      => 'string|max:500',
            'screener_questions'  => 'nullable|array',
            'screener_questions.*'=> 'string|max:500',
            'project_timeline'    => 'nullable|string|max:10000',
            'onboarding_process'  => 'nullable|string|max:10000',
            'logo'                => 'nullable|image|max:5120',
            'employment_type'     => 'required|string',
            'salary_min'          => 'nullable|numeric|min:0',
            'salary_max'          => 'nullable|numeric|min:0|gte:salary_min',
            'salary_currency'     => 'nullable|string|size:3',
            'skills_required'     => 'nullable|array',
            'skills_required.*'   => 'string|max:100',
            'experience_level'    => 'nullable|string',
            'industry'            => 'nullable|string',
            'is_remote'           => 'boolean',
            'deadline'            => 'nullable|date',
            'status'              => 'nullable|in:active,inactive,draft',
            'application_limit'   => 'nullable|integer|min:1',
            'work_arrangement'    => 'nullable|string|max:100',
        ]);

        // Keep existing logo unless a new one is uploaded
        $logoPath = $job->logo_path;
        if ($request->hasFile('logo')) {
            // Delete old file from disk
            if (is_string($job->logo_path) && str_starts_with($job->logo_path, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $job->logo_path));
            }
            $storedPath = $request->file('logo')->store("job-logos/{$request->user()->id}", 'public');
            $logoPath   = '/storage/' . $storedPath;
        }

        $job->update($this->persistableJobAttributes([
            'title'              => $request->title,
            'company_name'       => $request->input('company'),
            'location'           => $request->location,
            'description'        => $request->description,
            'responsibilities'   => $this->normalizeJsonList($request->input('responsibilities')),
            'qualifications'     => $this->normalizeJsonList($request->input('qualifications')),
            'requirements'       => $this->normalizeJsonList($request->input('requirements')),
            'screener_questions' => $this->normalizeJsonList($request->input('screener_questions')),
            'project_timeline'   => $request->input('project_timeline'),
            'onboarding_process' => $request->input('onboarding_process'),
            'logo_path'          => $logoPath,
            'employment_type'    => $request->employment_type,
            'salary_min'         => $request->salary_min,
            'salary_max'         => $request->salary_max,
            'salary_currency'    => $request->salary_currency ?? 'USD',
            'skills_required'    => $request->skills_required ?? [],
            'experience_level'   => $request->experience_level,
            'industry'           => $request->industry,
            'is_remote'          => $request->boolean('is_remote'),
            'deadline'           => $request->deadline,
            'status'             => $request->status ?? $job->status,
            'application_limit'  => $request->application_limit,
            'work_arrangement'   => $request->input('work_arrangement'),
        ]));

        if ($wasDraft && $job->status === 'active') {
            $this->notifyPendingCollaboratorsForPostedJob($job, $request->user());
        }

        return redirect()->route('employer.jobs.show', $job->id)
            ->with('success', 'Job listing updated successfully!');
    }

    /**
     * Update only the job listing status.
     */
    public function updateStatus(Request $request, JobListing $job): RedirectResponse
    {
        $this->authorizeJob($request, $job);
        $wasDraft = $job->status === 'draft';

        $request->validate(['status' => 'required|in:active,inactive,draft']);
        $job->update(['status' => $request->status]);

        if ($wasDraft && $job->status === 'active') {
            $this->notifyPendingCollaboratorsForPostedJob($job, $request->user());
        }

        return back()->with('success', 'Job status updated.');
    }

    /**
     * Delete a job listing.
     */
    public function destroy(Request $request, JobListing $job): RedirectResponse
    {
        $this->authorizeJob($request, $job);

        if (is_string($job->logo_path) && str_starts_with($job->logo_path, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $job->logo_path));
        }

        $job->delete();

        return redirect()->route('employer.jobs.index')
            ->with('success', 'Job listing deleted.');
    }

    /**
     * Duplicate a job listing as a draft.
     */
    public function duplicate(Request $request, JobListing $job): RedirectResponse
    {
        $this->authorizeJob($request, $job);

        $clone             = $job->replicate();
        $clone->title      = $job->title . ' (Copy)';
        $clone->status     = 'draft';
        $clone->created_at = now();
        $clone->updated_at = now();
        $clone->save();

        return redirect()->route('employer.jobs.show', $clone->id)
            ->with('success', 'Job duplicated as a draft.');
    }

    /**
     * Repost a job — reset to active with today as the posted date.
     */
    public function repost(Request $request, JobListing $job): RedirectResponse
    {
        $this->authorizeJob($request, $job);

        $job->update([
            'status'     => 'active',
            'deadline'   => null,
            'created_at' => now(),
        ]);

        return redirect()->route('employer.jobs.show', $job->id)
            ->with('success', 'Job reposted successfully.');
    }

    /**
     * Show applications for a specific job.
     */
    public function applications(Request $request, JobListing $job): Response
    {
        $this->authorizeJob($request, $job);

        $user        = $request->user()->load('employerProfile');
        $profile     = $user->employerProfile;
        $companyName = $profile?->company_name ?? "{$user->first_name} {$user->last_name}";

        $employerAddress = collect([
            $profile?->headquarters_address,
            $profile?->city,
            $profile?->state,
            $profile?->country,
        ])->filter()->implode(', ');

        $applications = $job->applications()
            ->where('status', '!=', 'draft')
            ->with('user.jobSeekerProfile')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($app) => [
                'id'               => $app->id,
                'status'           => $app->status,
                'cover_letter'     => $app->cover_letter,
                'resume_path'      => $app->resume_path,
                'application_data' => $app->application_data,
                'created_at'       => $app->created_at->toDateString(),
                'user'             => [
                    'id'         => $app->user->id,
                    'first_name' => $app->user->first_name,
                    'last_name'  => $app->user->last_name,
                    'email'      => $app->user->email,
                    'phone'      => $app->user->phone,
                    'avatar'     => $app->user->avatar,
                    'profile_frame' => $app->user->jobSeekerProfile?->profile_frame ?? 'default',
                    'profile'    => $app->user->jobSeekerProfile ? [
                        'profile_frame'      => $app->user->jobSeekerProfile->profile_frame ?? 'default',
                        'professional_title' => $app->user->jobSeekerProfile->professional_title,
                        'current_job_title'  => $app->user->jobSeekerProfile->current_job_title,
                        'current_company'    => $app->user->jobSeekerProfile->current_company,
                        'city'               => $app->user->jobSeekerProfile->city,
                        'state'              => $app->user->jobSeekerProfile->state,
                        'country'            => $app->user->jobSeekerProfile->country,
                        'skills'             => $app->user->jobSeekerProfile->skills,
                        'resume_path'        => $app->user->jobSeekerProfile->resume_path,
                    ] : null,
                ],
            ]);

        return Inertia::render('Employer/JobApplications', [
            'job' => [
                'id'              => $job->id,
                'title'           => $job->title,
                'company'         => $companyName,
                'location'        => $job->location,
                'employment_type' => $job->employment_type,
                'posted_date'     => $job->created_at->toISOString(),
            ],
            'applications'    => $applications,
            'employerAddress' => $employerAddress ?: null,
        ]);
    }

    /**
     * Reject an application: save reason, send email.
     */
    public function rejectApplication(Request $request, JobListing $job, JobApplication $application): RedirectResponse
    {
        $this->authorizeJob($request, $job);
        abort_if($application->job_listing_id !== $job->id, 403);

        $request->validate(['rejection_reason' => 'required|string|max:2000']);

        $application->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'reviewed_at'      => now(),
        ]);

        Mail::to($application->user->email)
            ->send(new ApplicationRejected($application, $job, $request->rejection_reason));

        $application->user->notify(new ApplicationRejectedNotification($application, $job));

        return back()->with('success', 'Application rejected and applicant notified.');
    }

    /**
     * Approve an application: schedule interview, send email.
     */
    public function approveApplication(Request $request, JobListing $job, JobApplication $application): RedirectResponse
    {
        $this->authorizeJob($request, $job);
        abort_if($application->job_listing_id !== $job->id, 403);

        $request->validate([
            'interview_date'   => 'required|date|after_or_equal:today',
            'interview_time'   => 'required|string',
            'interview_type'   => 'required|in:Online Interview,In-Person,Phone',
            'interviewer_name' => 'required|string|max:255',
            'location_or_link' => 'nullable|string|max:500',
            'notes'            => 'nullable|string|max:2000',
        ]);

        $application->update([
            'status'      => 'approved',
            'reviewed_at' => now(),
        ]);

        $interview = Interview::create([
            'job_application_id' => $application->id,
            'job_listing_id'     => $job->id,
            'candidate_id'       => $application->user_id,
            'employer_id'        => $request->user()->id,
            'interviewer_name'   => $request->interviewer_name,
            'interview_date'     => $request->interview_date,
            'interview_time'     => $request->interview_time,
            'interview_type'     => $request->interview_type,
            'location_or_link'   => $request->location_or_link,
            'notes'              => $request->notes,
            'status'             => 'active',
        ]);

        $candidateName = "{$application->user->first_name} {$application->user->last_name}";

        Mail::to($application->user->email)
            ->send(new InterviewScheduled($interview, $job, $candidateName));

        $application->user->notify(new InterviewScheduledNotification($interview, $job));

        return back()->with('success', 'Application approved and interview scheduled!');
    }

    /**
     * Simple status toggle (e.g. back to pending).
     */
    public function updateApplicationStatus(
        Request $request,
        JobListing $job,
        JobApplication $application
    ): RedirectResponse {
        $this->authorizeJob($request, $job);
        abort_if($application->job_listing_id !== $job->id, 403);

        $request->validate(['status' => 'required|in:pending,approved,rejected']);

        $application->update([
            'status'      => $request->status,
            'reviewed_at' => in_array($request->status, ['approved', 'rejected']) ? now() : $application->reviewed_at,
        ]);

        if ($request->status === 'rejected') {
            $application->user->notify(new ApplicationRejectedNotification($application, $job));
        }

        return back()->with('success', 'Application status updated.');
    }

    /* ══════════════════════════════════════════════════════════════════════
       Private helpers
    ══════════════════════════════════════════════════════════════════════ */

    /**
     * Ensure the authenticated employer owns this job listing.
     */
    private function authorizeJob(Request $request, JobListing $job): void
    {
        abort_if(
            !$job->isAccessibleBy($request->user()),
            403,
            'Unauthorized.'
        );
    }

    /**
     * Resolve a stored logo_path into a fully-qualified absolute URL.
     *
     * The DB stores paths as '/storage/job-logos/...' (relative). This helper
     * always returns an absolute http(s):// URL so the frontend <img> renders
     * correctly regardless of the app's base URL or local dev domain.
     */
    private function resolveLogoUrl(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        // Already absolute — return as-is
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        // Strip any leading /storage/ prefix then re-build via asset()
        $relative = ltrim(str_replace('/storage/', '', $path), '/');

        return asset('storage/' . $relative);
    }

    /**
     * Convert a JSON-cast field (array|null) or plain array back to a clean
     * array for the frontend.
     */
    private function splitList(mixed $value): array
    {
        if (blank($value)) {
            return [];
        }

        if (is_array($value)) {
            return array_values(array_filter(array_map('trim', $value)));
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                return array_values(array_filter(array_map('trim', $decoded)));
            }
            // Fallback: treat as newline-delimited plain text (legacy data)
            return array_values(array_filter(array_map('trim', explode("\n", $value))));
        }

        return [];
    }

    /**
     * Normalise incoming list data into a clean array for JSON columns.
     * Used for responsibilities, qualifications, requirements, screener_questions.
     */
    private function normalizeJsonList(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('trim', $value)));
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                return array_values(array_filter(array_map('trim', $decoded)));
            }
            return array_values(array_filter(array_map('trim', explode("\n", $value))));
        }

        return [];
    }

    /**
     * Keep writes compatible with environments that may not have all latest
     * job_listings columns migrated yet.
     */
    private function persistableJobAttributes(array $attributes): array
    {
        static $columns = null;

        if ($columns === null) {
            $columns = Schema::getColumnListing((new JobListing())->getTable());
        }

        return array_intersect_key($attributes, array_flip($columns));
    }

    /**
     * Send collaboration notifications for pending invites once a draft job is posted.
     */
    private function notifyPendingCollaboratorsForPostedJob(JobListing $job, User $actor): void
    {
        $pendingCollaborators = $job->collaborators()
            ->where('status', 'pending')
            ->with(['user', 'inviter'])
            ->get();

        foreach ($pendingCollaborators as $collaborator) {
            if (!$collaborator->user) {
                continue;
            }

            $inviter = $collaborator->inviter ?? $actor;
            $collaborator->user->notify(new CollaborationInviteNotification($collaborator, $job, $inviter));
        }
    }
}