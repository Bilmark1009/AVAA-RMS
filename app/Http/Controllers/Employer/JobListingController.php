<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
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
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
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

        $jobs = JobListing::where('employer_id', $user->id)
            ->withCount('applications')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($job) => [
                'id' => $job->id,
                'title' => $job->title,
                'location' => $job->location,
                'company' => $job->company_name ?? $user->employerProfile?->company_name ?? "{$user->first_name} {$user->last_name}",
                'status' => $job->status,
                'applications_count' => $job->applications_count,
                'posted_date' => $job->created_at->toDateString(),
                'description' => $job->description,
                'responsibilities' => $job->responsibilities,
                'qualifications' => $job->qualifications,
                'project_timeline' => $job->project_timeline,
                'onboarding_process' => $job->onboarding_process,
                'logo_path' => $job->logo_path,
                'employment_type' => $job->employment_type,
                'salary_min' => $job->salary_min,
                'salary_max' => $job->salary_max,
                'salary_currency' => $job->salary_currency,
                'skills_required' => $job->skills_required ?? [],
                'experience_level' => $job->experience_level,
                'is_remote' => $job->is_remote,
                'deadline' => $job->deadline?->toDateString(),
                'industry' => $job->industry,
            ]);

        return Inertia::render('Employer/ManageJobs', [
            'user' => $user,
            'profile' => $user->employerProfile,
            'jobs' => $jobs,
            'isVerified' => $user->employerProfile?->is_verified ?? false,
        ]);
    }

    /**
     * Store a new job listing.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'responsibilities' => 'nullable|string|max:10000',
            'qualifications' => 'nullable|string|max:10000',
            'project_timeline' => 'nullable|string|max:10000',
            'onboarding_process' => 'nullable|string|max:10000',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'employment_type' => 'required|string',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0|gte:salary_min',
            'salary_currency' => 'nullable|string|size:3',
            'skills_required' => 'nullable|array',
            'skills_required.*' => 'string|max:100',
            'experience_level' => 'nullable|string',
            'industry' => 'nullable|string',
            'is_remote' => 'boolean',
            'deadline' => 'nullable|date|after:today',
            'status' => 'nullable|in:active,inactive,draft',
            'application_limit' => 'nullable|integer|min:1',
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $storedPath = $request->file('logo')->store("job-logos/{$request->user()->id}", 'public');
            $logoPath = '/storage/' . $storedPath;
        }

        $job = JobListing::create([
            'employer_id' => $request->user()->id,
            'title' => $request->title,
            'company_name' => $request->input('company'),
            'location' => $request->location,
            'description' => $request->description,
            'responsibilities' => $request->input('responsibilities'),
            'qualifications' => $request->input('qualifications'),
            'project_timeline' => $request->input('project_timeline'),
            'onboarding_process' => $request->input('onboarding_process'),
            'logo_path' => $logoPath,
            'employment_type' => $request->employment_type,
            'salary_min' => $request->salary_min,
            'salary_max' => $request->salary_max,
            'salary_currency' => $request->salary_currency ?? 'USD',
            'skills_required' => $request->skills_required ?? [],
            'experience_level' => $request->experience_level,
            'industry' => $request->industry,
            'is_remote' => $request->boolean('is_remote'),
            'deadline' => $request->deadline,
            'status' => $request->status ?? 'active',
            'application_limit' => $request->application_limit,
        ]);

        // Notify all admins about new job posting
        $employer = $request->user();
        User::where('role', 'admin')->each(
            fn($admin) =>
            $admin->notify(new AdminNewJobPostedNotification($job, $employer))
        );

        return back()->with('success', 'Job listing created successfully!');
    }

    /**
     * Update an existing job listing.
     */
    public function update(Request $request, JobListing $job): RedirectResponse
    {
        $this->authorizeJob($request, $job);

        $request->validate([
            'title' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'responsibilities' => 'nullable|string|max:10000',
            'qualifications' => 'nullable|string|max:10000',
            'project_timeline' => 'nullable|string|max:10000',
            'onboarding_process' => 'nullable|string|max:10000',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'employment_type' => 'required|string',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0|gte:salary_min',
            'salary_currency' => 'nullable|string|size:3',
            'skills_required' => 'nullable|array',
            'skills_required.*' => 'string|max:100',
            'experience_level' => 'nullable|string',
            'industry' => 'nullable|string',
            'is_remote' => 'boolean',
            'deadline' => 'nullable|date',
            'status' => 'nullable|in:active,inactive,draft',
            'application_limit' => 'nullable|integer|min:1',
        ]);

        $logoPath = $job->logo_path;
        if ($request->hasFile('logo')) {
            if (is_string($job->logo_path) && str_starts_with($job->logo_path, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $job->logo_path));
            }

            $storedPath = $request->file('logo')->store("job-logos/{$request->user()->id}", 'public');
            $logoPath = '/storage/' . $storedPath;
        }

        $job->update($request->only([
            'title',
            'location',
            'description',
            'responsibilities',
            'qualifications',
            'project_timeline',
            'onboarding_process',
            'employment_type',
            'salary_min',
            'salary_max',
            'salary_currency',
            'skills_required',
            'experience_level',
            'industry',
            'is_remote',
            'deadline',
            'status',
            'application_limit',
        ]));

        $job->update([
            'company_name' => $request->input('company'),
            'logo_path' => $logoPath,
        ]);

        return back()->with('success', 'Job listing updated successfully!');
    }

    /**
     * Update only the job listing status.
     */
    public function updateStatus(Request $request, JobListing $job): RedirectResponse
    {
        $this->authorizeJob($request, $job);
        $request->validate(['status' => 'required|in:active,inactive,draft']);
        $job->update(['status' => $request->status]);
        return back()->with('success', 'Job status updated.');
    }

    /**
     * Delete a job listing.
     */
    public function destroy(Request $request, JobListing $job): RedirectResponse
    {
        $this->authorizeJob($request, $job);
        $job->delete();
        return back()->with('success', 'Job listing deleted.');
    }

    /**
     * Show applications for a specific job.
     */
    public function applications(Request $request, JobListing $job): Response
    {
        $this->authorizeJob($request, $job);

        $user = $request->user()->load('employerProfile');
        $profile = $user->employerProfile;
        $companyName = $profile?->company_name ?? "{$user->first_name} {$user->last_name}";

        // Build employer address for pre-filling the in-person interview location
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
                'id' => $app->id,
                'status' => $app->status,
                'cover_letter' => $app->cover_letter,
                'resume_path' => $app->resume_path,
                'application_data' => $app->application_data,
                'created_at' => $app->created_at->toDateString(),
                'user' => [
                    'id' => $app->user->id,
                    'first_name' => $app->user->first_name,
                    'last_name' => $app->user->last_name,
                    'email' => $app->user->email,
                    'phone' => $app->user->phone,
                    'avatar' => $app->user->avatar,
                    'profile' => $app->user->jobSeekerProfile ? [
                        'professional_title' => $app->user->jobSeekerProfile->professional_title,
                        'current_job_title' => $app->user->jobSeekerProfile->current_job_title,
                        'current_company' => $app->user->jobSeekerProfile->current_company,
                        'city' => $app->user->jobSeekerProfile->city,
                        'state' => $app->user->jobSeekerProfile->state,
                        'country' => $app->user->jobSeekerProfile->country,
                        'skills' => $app->user->jobSeekerProfile->skills,
                        'resume_path' => $app->user->jobSeekerProfile->resume_path,
                    ] : null,
                ],
            ]);

        return Inertia::render('Employer/JobApplications', [
            'job' => [
                'id' => $job->id,
                'title' => $job->title,
                'company' => $companyName,
                'location' => $job->location,
                'employment_type' => $job->employment_type,
                'posted_date' => $job->created_at->toDateString(),
            ],
            'applications' => $applications,
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

        $request->validate([
            'rejection_reason' => 'required|string|max:2000',
        ]);

        $application->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'reviewed_at' => now(),
        ]);

        // Send rejection email
        Mail::to($application->user->email)
            ->send(new ApplicationRejected($application, $job, $request->rejection_reason));

        // In-app notification
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
            'interview_date' => 'required|date|after_or_equal:today',
            'interview_time' => 'required|string',
            'interview_type' => 'required|in:Online Interview,In-Person,Phone',
            'interviewer_name' => 'required|string|max:255',
            'location_or_link' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:2000',
        ]);

        $application->update([
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);

        $interview = Interview::create([
            'job_application_id' => $application->id,
            'job_listing_id' => $job->id,
            'candidate_id' => $application->user_id,
            'employer_id' => $request->user()->id,
            'interviewer_name' => $request->interviewer_name,
            'interview_date' => $request->interview_date,
            'interview_time' => $request->interview_time,
            'interview_type' => $request->interview_type,
            'location_or_link' => $request->location_or_link,
            'notes' => $request->notes,
            'status' => 'active',
        ]);

        $candidateName = "{$application->user->first_name} {$application->user->last_name}";

        // Send interview invite email
        Mail::to($application->user->email)
            ->send(new InterviewScheduled($interview, $job, $candidateName));

        // In-app notification to job seeker
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

        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $application->update([
            'status' => $request->status,
            'reviewed_at' => in_array($request->status, ['approved', 'rejected']) ? now() : $application->reviewed_at,
        ]);

        if ($request->status === 'rejected') {
            $application->user->notify(new ApplicationRejectedNotification($application, $job));
        }

        return back()->with('success', 'Application status updated.');
    }

    /* ── Private helpers ── */

    private function authorizeJob(Request $request, JobListing $job): void
    {
        abort_if($job->employer_id !== $request->user()->id, 403, 'Unauthorized.');
    }
}