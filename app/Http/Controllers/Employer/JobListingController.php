<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
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
                'id'                 => $job->id,
                'title'              => $job->title,
                'location'           => $job->location,
                'company'            => $user->employerProfile?->company_name ?? $user->name,
                'status'             => $job->status,
                'applications_count' => $job->applications_count,
                'posted_date'        => $job->created_at->toDateString(),
                'description'        => $job->description,
                'employment_type'    => $job->employment_type,
                'salary_min'         => $job->salary_min,
                'salary_max'         => $job->salary_max,
                'salary_currency'    => $job->salary_currency,
                'skills_required'    => $job->skills_required ?? [],
                'experience_level'   => $job->experience_level,
                'is_remote'          => $job->is_remote,
                'deadline'           => $job->deadline?->toDateString(),
                'industry'           => $job->industry,
            ]);

        return Inertia::render('Employer/ManageJobs', [
            'user'       => $user,
            'profile'    => $user->employerProfile,
            'jobs'       => $jobs,
            'isVerified' => $user->employerProfile?->is_verified ?? false,
        ]);
    }

    /**
     * Store a new job listing (called from the Create Job modal).
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title'             => 'required|string|max:255',
            'location'          => 'required|string|max:255',
            'description'       => 'required|string|min:10',
            'employment_type'   => 'required|string',
            'salary_min'        => 'nullable|numeric|min:0',
            'salary_max'        => 'nullable|numeric|min:0|gte:salary_min',
            'salary_currency'   => 'nullable|string|size:3',
            'skills_required'   => 'nullable|array',
            'skills_required.*' => 'string|max:100',
            'experience_level'  => 'nullable|string',
            'industry'          => 'nullable|string',
            'is_remote'         => 'boolean',
            'deadline'          => 'nullable|date|after:today',
            'status'            => 'nullable|in:active,inactive,draft',
            'application_limit' => 'nullable|integer|min:1',
        ]);

        JobListing::create([
            'employer_id'       => $request->user()->id,
            'title'             => $request->title,
            'location'          => $request->location,
            'description'       => $request->description,
            'employment_type'   => $request->employment_type,
            'salary_min'        => $request->salary_min,
            'salary_max'        => $request->salary_max,
            'salary_currency'   => $request->salary_currency ?? 'USD',
            'skills_required'   => $request->skills_required ?? [],
            'experience_level'  => $request->experience_level,
            'industry'          => $request->industry,
            'is_remote'         => $request->boolean('is_remote'),
            'deadline'          => $request->deadline,
            'status'            => $request->status ?? 'active',
            'application_limit' => $request->application_limit,
        ]);

        return back()->with('success', 'Job listing created successfully!');
    }

    /**
     * Update an existing job listing (called from the Edit Job modal).
     */
    public function update(Request $request, JobListing $job): RedirectResponse
    {
        $this->authorizeJob($request, $job);

        $request->validate([
            'title'             => 'required|string|max:255',
            'location'          => 'required|string|max:255',
            'description'       => 'required|string|min:10',
            'employment_type'   => 'required|string',
            'salary_min'        => 'nullable|numeric|min:0',
            'salary_max'        => 'nullable|numeric|min:0|gte:salary_min',
            'salary_currency'   => 'nullable|string|size:3',
            'skills_required'   => 'nullable|array',
            'skills_required.*' => 'string|max:100',
            'experience_level'  => 'nullable|string',
            'industry'          => 'nullable|string',
            'is_remote'         => 'boolean',
            'deadline'          => 'nullable|date',
            'status'            => 'nullable|in:active,inactive,draft',
            'application_limit' => 'nullable|integer|min:1',
        ]);

        $job->update($request->only([
            'title', 'location', 'description', 'employment_type',
            'salary_min', 'salary_max', 'salary_currency',
            'skills_required', 'experience_level', 'industry',
            'is_remote', 'deadline', 'status', 'application_limit',
        ]));

        return back()->with('success', 'Job listing updated successfully!');
    }

    /**
     * Update only the status (inline table dropdown).
     */
    public function updateStatus(Request $request, JobListing $job): RedirectResponse
    {
        $this->authorizeJob($request, $job);

        $request->validate([
            'status' => 'required|in:active,inactive,draft',
        ]);

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

        return Inertia::render('Employer/JobApplications', [
            'user'         => $user,
            'profile'      => $user->employerProfile,
            'job'          => $job,
            'applications' => $job->applications()
                ->with('user.jobSeekerProfile')
                ->orderByDesc('created_at')
                ->get(),
        ]);
    }

    /* ── Private helpers ── */

    private function authorizeJob(Request $request, JobListing $job): void
    {
        abort_if($job->employer_id !== $request->user()->id, 403, 'Unauthorized.');
    }
}