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
