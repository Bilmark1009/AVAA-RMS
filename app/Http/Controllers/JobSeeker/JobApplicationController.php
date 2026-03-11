<?php

namespace App\Http\Controllers\JobSeeker;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobListing;
use App\Notifications\ApplicationReceivedNotification;
use App\Notifications\NewApplicationNotification;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class JobApplicationController extends Controller
{
    /**
     * Job Seeker: Application History index.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $applications = JobApplication::query()
            ->with([
                'jobListing' => function ($q) {
                    $q->with(['employer.employerProfile']);
                },
                'interview',
            ])
            ->where('user_id', $user->id)
            ->where('status', '!=', 'draft')
            ->latest()
            ->get()
            ->map(function (JobApplication $app) {
                $job = $app->jobListing;
                $employer = $job?->employer;
                $company = $employer?->employerProfile?->company_name
                    ?? trim(($employer?->first_name ?? '').' '.($employer?->last_name ?? ''))
                    ?: 'Unknown Company';
                $logoPath = $employer?->employerProfile?->logo_path;
                $logoUrl = null;
                if ($logoPath) {
                    $relative = ltrim($logoPath, '/');

                    // If it's already an absolute URL, keep it.
                    if (str_starts_with($relative, 'http://') || str_starts_with($relative, 'https://')) {
                        $logoUrl = $relative;
                    } else {
                        // Prefer public/ logos folder if present (your setup).
                        $publicRelative = str_starts_with($relative, 'logos/')
                            ? $relative
                            : 'logos/'.$relative;

                        if (file_exists(public_path($publicRelative))) {
                            $logoUrl = '/'.$publicRelative;
                        } else {
                            // Fallback to storage disk (default Laravel behavior).
                            $logoUrl = Storage::disk('public')->url($logoPath);
                        }
                    }
                }

                $initials = collect(preg_split('/\s+/', trim($company)))
                    ->filter()
                    ->map(fn ($w) => mb_substr($w, 0, 1))
                    ->join('');
                $initials = mb_strtoupper(mb_substr($initials, 0, 2));

                // Derive "Interviewing" stage if an active interview exists.
                $stage = $app->status;
                if (! in_array($app->status, ['rejected', 'withdrawn', 'hired', 'contract_ended'], true)) {
                    if ($app->interview && ($app->interview->status ?? null) === 'active') {
                        $stage = 'interviewing';
                    }
                }

                $canWithdraw = ! in_array($app->status, ['withdrawn', 'rejected', 'hired', 'contract_ended'], true);

                return [
                    'id' => $app->id,
                    'status' => $app->status,
                    'stage' => $stage,
                    'applied_at' => optional($app->created_at)->toISOString(),
                    'time_ago' => optional($app->created_at)->diffForHumans(),
                    'can_withdraw' => $canWithdraw,
                    'job' => $job ? [
                        'id' => $job->id,
                        'title' => $job->title,
                        'location' => $job->location,
                        'is_remote' => (bool) $job->is_remote,
                        'employment_type' => $job->employment_type,
                    ] : null,
                    'company' => [
                        'name' => $company,
                        'initials' => $initials ?: '??',
                        'logo_url' => $logoUrl,
                    ],
                ];
            })
            ->values();

        return Inertia::render('JobSeeker/ApplicationHistory', [
            'applications' => $applications,
        ]);
    }

    /**
     * Job Seeker: Withdraw a submitted application.
     */
    public function withdraw(Request $request, JobApplication $application): RedirectResponse
    {
        abort_unless($application->user_id === $request->user()->id, 403);

        if (in_array($application->status, ['withdrawn', 'rejected', 'hired', 'contract_ended'], true)) {
            return back();
        }

        $application->update(['status' => 'withdrawn']);

        return back()->with('success', 'Application withdrawn successfully.');
    }

    /**
     * Show the multi-step application form (pre-filled from profile).
     */
    public function create(JobListing $job): Response|RedirectResponse
    {
        $user = Auth::user();

        // Already applied?
        $existing = JobApplication::where('user_id', $user->id)
            ->where('job_listing_id', $job->id)
            ->first();

        if ($existing && $existing->status !== 'draft') {
            return redirect()->route('job-seeker.jobs.show', $job->id)
                ->with('info', 'You have already applied to this job.');
        }

        $user->load('jobSeekerProfile');
        $profile = $user->jobSeekerProfile;

        // Pre-fill data from profile
        $prefill = [
            // Step 1: Personal Info
            'full_name' => trim("{$user->first_name} {$user->last_name}"),
            'email' => $user->email,
            'phone' => $user->phone ?? '',
            'location' => $profile ? implode(', ', array_filter([$profile->city, $profile->state, $profile->country])) : '',
            'linkedin_url' => $profile->linkedin_url ?? '',
            'portfolio_url' => $profile->portfolio_url ?? '',

            // Step 2: Professional Experience
            'current_job_title' => $profile->current_job_title ?? '',
            'current_company' => $profile->current_company ?? '',
            'years_of_experience' => $profile->years_of_experience ?? '',
            'skills' => $profile->skills ?? [],
            'cover_letter' => '',

            // Step 3: Resume
            'resume_path' => $profile->resume_path ?? null,
        ];

        // If there's a draft, use the draft data instead
        if ($existing && $existing->status === 'draft' && $existing->application_data) {
            $prefill = array_merge($prefill, $existing->application_data);
            if ($existing->resume_path) {
                $prefill['resume_path'] = $existing->resume_path;
            }
            if ($existing->cover_letter) {
                $prefill['cover_letter'] = $existing->cover_letter;
            }
        }

        return Inertia::render('JobSeeker/ApplyJob', [
            'job' => [
                'id' => $job->id,
                'title' => $job->title,
                'company' => $job->employer?->employerProfile?->company_name
                    ?? $job->employer?->first_name
                    ?? 'Unknown Company',
                'location' => $job->location,
                'employment_type' => $job->employment_type,
            ],
            'prefill' => $prefill,
            'draftId' => $existing?->id,
        ]);
    }

    /**
     * Submit the application.
     */
    public function store(Request $request, JobListing $job): RedirectResponse
    {
        $user = $request->user();

        // Check for existing non-draft application
        $existing = JobApplication::where('user_id', $user->id)
            ->where('job_listing_id', $job->id)
            ->first();

        if ($existing && $existing->status !== 'draft') {
            return redirect()->route('job-seeker.jobs.show', $job->id)
                ->with('info', 'You have already applied to this job.');
        }

        // Check application limit
        if ($job->application_limit && $job->applications()->where('status', '!=', 'draft')->count() >= $job->application_limit) {
            return back()->withErrors(['apply' => 'This job is no longer accepting applications.']);
        }

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'location' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'string', 'max:255'],
            'portfolio_url' => ['nullable', 'string', 'max:255'],
            'current_job_title' => ['nullable', 'string', 'max:255'],
            'current_company' => ['nullable', 'string', 'max:255'],
            'years_of_experience' => ['nullable', 'string', 'max:50'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:100'],
            'cover_letter' => ['nullable', 'string', 'max:5000'],
            'resume' => ['nullable', 'file', 'mimes:pdf', 'max:25600'],
            'existing_resume' => ['nullable', 'string'],
        ]);

        // Handle resume
        $resumePath = $validated['existing_resume'] ?? null;
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store("resumes/{$user->id}", 'public');
            $resumePath = '/storage/' . $resumePath;
        }

        // Build application data snapshot
        $applicationData = [
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? '',
            'location' => $validated['location'] ?? '',
            'linkedin_url' => $validated['linkedin_url'] ?? '',
            'portfolio_url' => $validated['portfolio_url'] ?? '',
            'current_job_title' => $validated['current_job_title'] ?? '',
            'current_company' => $validated['current_company'] ?? '',
            'years_of_experience' => $validated['years_of_experience'] ?? '',
            'skills' => $validated['skills'] ?? [],
            'cover_letter' => $validated['cover_letter'] ?? '',
        ];

        $data = [
            'user_id' => $user->id,
            'job_listing_id' => $job->id,
            'status' => 'pending',
            'cover_letter' => $validated['cover_letter'] ?? null,
            'resume_path' => $resumePath,
            'application_data' => $applicationData,
        ];

        if ($existing && $existing->status === 'draft') {
            $existing->update($data);
            $application = $existing->fresh();
        } else {
            $application = JobApplication::create($data);
        }

        // Notify the job seeker that their application was received
        $user->notify(new ApplicationReceivedNotification($application, $job));

        // Notify the employer about the new application
        $employer = $job->employer;
        if ($employer) {
            $employer->notify(new NewApplicationNotification($application, $job, $user));
        }

        return redirect()->route('job-seeker.jobs.show', $job->id)
            ->with('success', 'Application submitted successfully!');
    }

    /**
     * Save a draft application.
     */
    public function saveDraft(Request $request, JobListing $job): RedirectResponse
    {
        $user = $request->user();

        $existing = JobApplication::where('user_id', $user->id)
            ->where('job_listing_id', $job->id)
            ->first();

        if ($existing && $existing->status !== 'draft') {
            return back()->with('info', 'You have already submitted this application.');
        }

        $formData = $request->only([
            'full_name',
            'email',
            'phone',
            'location',
            'linkedin_url',
            'portfolio_url',
            'current_job_title',
            'current_company',
            'years_of_experience',
            'skills',
            'cover_letter',
        ]);

        // Handle resume upload for draft too
        $resumePath = $request->input('existing_resume');
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store("resumes/{$user->id}", 'public');
            $resumePath = '/storage/' . $resumePath;
        }

        $data = [
            'user_id' => $user->id,
            'job_listing_id' => $job->id,
            'status' => 'draft',
            'cover_letter' => $formData['cover_letter'] ?? null,
            'resume_path' => $resumePath,
            'application_data' => $formData,
        ];

        if ($existing) {
            $existing->update($data);
        } else {
            JobApplication::create($data);
        }

        return back()->with('status', 'draft-saved');
    }
}
