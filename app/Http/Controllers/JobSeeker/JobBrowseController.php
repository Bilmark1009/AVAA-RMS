<?php

namespace App\Http\Controllers\JobSeeker;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use App\Models\SavedJob;
use App\Models\JobApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class JobBrowseController extends Controller
{
    /* ─────────────────────────────────────────
       Browse all active job listings
    ───────────────────────────────────────── */
    public function browse(Request $request)
    {
        $user = Auth::user();

        $query = JobListing::where('status', 'active')
            ->with('employer:id,name');

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhereRaw("JSON_SEARCH(LOWER(skills_required), 'one', LOWER(?)) IS NOT NULL", ["%{$search}%"]);
            });
        }

        // Date posted filter
        match ($request->input('date_posted')) {
            'today' => $query->whereDate('created_at', today()),
            'week'  => $query->where('created_at', '>=', now()->startOfWeek()),
            'month' => $query->where('created_at', '>=', now()->startOfMonth()),
            default => null,
        };

        // Skills filter
        if ($skills = $request->input('skills', [])) {
            foreach ((array) $skills as $skill) {
                $query->whereJsonContains('skills_required', $skill);
            }
        }

        // Company filter
        if ($companies = $request->input('companies', [])) {
            // company name is stored on EmployerProfile; join if needed, or we filter in-memory
            // Simple approach: match against the employer's company_name via a subquery
            $query->whereHas('employer.employerProfile', function ($q) use ($companies) {
                $q->whereIn('company_name', (array) $companies);
            });
        }

        $jobs = $query->latest()->get();

        // IDs the current user has saved
        $savedJobIds = SavedJob::where('user_id', $user->id)
            ->pluck('job_listing_id')
            ->toArray();

        // IDs the current user has applied to
        $appliedJobIds = JobApplication::where('user_id', $user->id)
            ->pluck('job_listing_id')
            ->toArray();

        // Shape each job for the frontend
        $shaped = $jobs->map(fn($job) => $this->shapeJob($job, $savedJobIds, $appliedJobIds));

        // Aggregates for the filter sidebar
        $allActive = JobListing::where('status', 'active')->get();

        $availableSkills = $allActive
            ->flatMap(fn($j) => $j->skills_required ?? [])
            ->unique()->values()->toArray();

        $availableCompanies = $allActive
            ->map(fn($j) => $j->employer?->employerProfile?->company_name ?? $j->employer?->name)
            ->filter()->unique()->values()->toArray();

        return Inertia::render('JobSeeker/BrowseJobs', [
            'jobs'               => $shaped,
            'savedJobIds'        => $savedJobIds,
            'filters'            => $request->only(['search', 'date_posted', 'skills', 'companies']),
            'availableSkills'    => $availableSkills,
            'availableCompanies' => $availableCompanies,
        ]);
    }

    /* ─────────────────────────────────────────
       Saved jobs list
    ───────────────────────────────────────── */
    public function saved(Request $request)
    {
        $user = Auth::user();

        $savedIds = SavedJob::where('user_id', $user->id)->pluck('job_listing_id');

        $query = JobListing::whereIn('id', $savedIds)->with('employer:id,name');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        match ($request->input('date_posted')) {
            'today' => $query->whereDate('created_at', today()),
            'week'  => $query->where('created_at', '>=', now()->startOfWeek()),
            'month' => $query->where('created_at', '>=', now()->startOfMonth()),
            default => null,
        };

        if ($skills = $request->input('skills', [])) {
            foreach ((array) $skills as $skill) {
                $query->whereJsonContains('skills_required', $skill);
            }
        }

        if ($companies = $request->input('companies', [])) {
            $query->whereHas('employer.employerProfile', fn($q) =>
                $q->whereIn('company_name', (array) $companies));
        }

        $jobs = $query->latest()->get();

        $appliedJobIds = JobApplication::where('user_id', $user->id)->pluck('job_listing_id')->toArray();

        $shaped = $jobs->map(fn($job) => $this->shapeJob($job, $savedIds->toArray(), $appliedJobIds));

        // Sidebar aggregates from the user's saved pool
        $allSaved = JobListing::whereIn('id', $savedIds)->get();
        $availableSkills    = $allSaved->flatMap(fn($j) => $j->skills_required ?? [])->unique()->values()->toArray();
        $availableCompanies = $allSaved->map(fn($j) => $j->employer?->employerProfile?->company_name ?? $j->employer?->name)->filter()->unique()->values()->toArray();

        return Inertia::render('JobSeeker/SavedJobs', [
            'savedJobs'          => $shaped,
            'filters'            => $request->only(['search', 'date_posted', 'skills', 'companies']),
            'availableSkills'    => $availableSkills,
            'availableCompanies' => $availableCompanies,
        ]);
    }

    /* ─────────────────────────────────────────
       Save a job
    ───────────────────────────────────────── */
    public function save(JobListing $job)
    {
        SavedJob::firstOrCreate([
            'user_id'        => Auth::id(),
            'job_listing_id' => $job->id,
        ]);

        return back();
    }

    /* ─────────────────────────────────────────
       Unsave a job
    ───────────────────────────────────────── */
    public function unsave(JobListing $job)
    {
        SavedJob::where('user_id', Auth::id())
            ->where('job_listing_id', $job->id)
            ->delete();

        return back();
    }

    /* ─────────────────────────────────────────
       Apply to a job
    ───────────────────────────────────────── */
    public function apply(Request $request, JobListing $job)
    {
        $userId = Auth::id();

        // Prevent duplicate applications
        if (JobApplication::where('user_id', $userId)->where('job_listing_id', $job->id)->exists()) {
            return back()->withErrors(['apply' => 'You have already applied to this job.']);
        }

        // Check application limit
        if ($job->application_limit && $job->applications()->count() >= $job->application_limit) {
            return back()->withErrors(['apply' => 'This job is no longer accepting applications.']);
        }

        JobApplication::create([
            'user_id'        => $userId,
            'job_listing_id' => $job->id,
            'status'         => 'pending',
            'resume_path'    => Auth::user()->jobSeekerProfile?->resume_path,
        ]);

        return back();
    }

    /* ─────────────────────────────────────────
       Private helper: shape a JobListing for the frontend
    ───────────────────────────────────────── */
    private function shapeJob(JobListing $job, array $savedIds, array $appliedIds): array
    {
        $companyName = $job->employer?->employerProfile?->company_name
            ?? $job->employer?->name
            ?? 'Unknown Company';

        return [
            'id'              => $job->id,
            'title'           => $job->title,
            'company'         => $companyName,
            'location'        => $job->location,
            'employment_type' => $job->employment_type,
            'salary_min'      => $job->salary_min ? (float) $job->salary_min : null,
            'salary_max'      => $job->salary_max ? (float) $job->salary_max : null,
            'salary_currency' => $job->salary_currency ?? 'USD',
            'skills_required' => $job->skills_required ?? [],
            'posted_date'     => $job->created_at->toISOString(),
            'description'     => $job->description,
            'experience_level'=> $job->experience_level,
            'is_remote'       => (bool) $job->is_remote,
            'industry'        => $job->industry,
            'has_applied'     => in_array($job->id, $appliedIds),
        ];
    }
}