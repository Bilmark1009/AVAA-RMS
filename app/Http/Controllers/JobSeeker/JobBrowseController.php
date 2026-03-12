<?php

namespace App\Http\Controllers\JobSeeker;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use App\Models\SavedJob;
use App\Models\JobApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class JobBrowseController extends Controller
{
    /* ─────────────────────────────────────────
       Browse all active job listings
    ───────────────────────────────────────── */
    public function browse(Request $request)
    {
        $user = Auth::user();

        $query = JobListing::where('status', 'active')
            ->with('employer:id,first_name,last_name');

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
            'week' => $query->where('created_at', '>=', now()->startOfWeek()),
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
            ->whereNotIn('status', ['withdrawn', 'accepted', 'hired'])
            ->pluck('job_listing_id')
            ->toArray();

        $applicationStatuses = JobApplication::where('user_id', $user->id)
            ->whereIn('job_listing_id', $jobs->pluck('id'))
            ->pluck('status', 'job_listing_id')
            ->toArray();

        // Shape each job for the frontend
        $shaped = $jobs->map(fn($job) => $this->shapeJob($job, $savedJobIds, $appliedJobIds, $applicationStatuses));

        // Aggregates for the filter sidebar
        $allActive = JobListing::where('status', 'active')->get();

        $availableSkills = $allActive
            ->flatMap(fn($j) => $j->skills_required ?? [])
            ->unique()->values()->toArray();

        $availableCompanies = $allActive
            ->map(fn($j) => $j->employer?->employerProfile?->company_name ?? $j->employer?->first_name)
            ->filter()->unique()->values()->toArray();

        return Inertia::render('JobSeeker/BrowseJobs', [
            'jobs' => $shaped,
            'savedJobIds' => $savedJobIds,
            'filters' => $request->only(['search', 'date_posted', 'skills', 'companies']),
            'availableSkills' => $availableSkills,
            'availableCompanies' => $availableCompanies,
            'profileComplete' => (bool) $user->profile_completed,
        ]);
    }

    public function show(JobListing $job)
    {
        $user = Auth::user();

        $savedJobIds = SavedJob::where('user_id', $user->id)->pluck('job_listing_id')->toArray();
        $appliedJobIds = JobApplication::where('user_id', $user->id)
            ->whereNotIn('status', ['withdrawn', 'accepted', 'hired'])
            ->pluck('job_listing_id')
            ->toArray();

        $applicationStatuses = JobApplication::where('user_id', $user->id)
            ->pluck('status', 'job_listing_id')
            ->toArray();

        $similarJobs = JobListing::where('status', 'active')
            ->where('id', '!=', $job->id)
            ->where(function ($q) use ($job) {
                if ($job->industry) {
                    $q->where('industry', $job->industry);
                } else {
                    // Fall back to same employer if no industry set
                    $q->where('employer_id', $job->employer_id);
                }
            })
            ->limit(3)
            ->get()
            ->map(fn($j) => $this->shapeJob($j, $savedJobIds, $appliedJobIds, $applicationStatuses));

        return Inertia::render('JobSeeker/JobDetail', [
            'job' => $this->shapeJob($job, $savedJobIds, $appliedJobIds, $applicationStatuses),
            'isSaved' => in_array($job->id, $savedJobIds),
            'hasApplied' => in_array($job->id, $appliedJobIds),
            'similarJobs' => $similarJobs,
            'recruiter' => null, // wire up later when you have recruiter data
        ]);
    }

    /* ─────────────────────────────────────────
       Saved jobs list
    ───────────────────────────────────────── */
    public function saved(Request $request)
    {
        $user = Auth::user();

        $savedIds = SavedJob::where('user_id', $user->id)->pluck('job_listing_id');

        $query = JobListing::whereIn('id', $savedIds)->with('employer:id,first_name,last_name');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        match ($request->input('date_posted')) {
            'today' => $query->whereDate('created_at', today()),
            'week' => $query->where('created_at', '>=', now()->startOfWeek()),
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

        $appliedJobIds = JobApplication::where('user_id', $user->id)
            ->whereNotIn('status', ['withdrawn', 'accepted', 'hired'])
            ->pluck('job_listing_id')
            ->toArray();

        $applicationStatuses = JobApplication::where('user_id', $user->id)
            ->whereIn('job_listing_id', $jobs->pluck('id'))
            ->pluck('status', 'job_listing_id')
            ->toArray();

        $shaped = $jobs->map(fn($job) => $this->shapeJob($job, $savedIds->toArray(), $appliedJobIds, $applicationStatuses));

        // Sidebar aggregates from the user's saved pool
        $allSaved = JobListing::whereIn('id', $savedIds)->get();
        $availableSkills = $allSaved->flatMap(fn($j) => $j->skills_required ?? [])->unique()->values()->toArray();
        $availableCompanies = $allSaved->map(fn($j) => $j->employer?->employerProfile?->company_name ?? $j->employer?->first_name)->filter()->unique()->values()->toArray();

        return Inertia::render('JobSeeker/SavedJobs', [
            'savedJobs' => $shaped,
            'filters' => $request->only(['search', 'date_posted', 'skills', 'companies']),
            'availableSkills' => $availableSkills,
            'availableCompanies' => $availableCompanies,
        ]);
    }

    /* ─────────────────────────────────────────
       Save a job
    ───────────────────────────────────────── */
    public function save(JobListing $job)
    {
        SavedJob::firstOrCreate([
            'user_id' => Auth::id(),
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
       Job history (hired placements)
    ───────────────────────────────────────── */
    public function history(Request $request)
    {
        $user = $request->user();

        $apps = JobApplication::query()
            ->with(['jobListing.employer.employerProfile'])
            ->where('user_id', $user->id)
            ->whereIn('status', ['accepted', 'hired', 'contract_ended'])
            ->orderByDesc('hired_at')
            ->get();

        $shape = function (JobApplication $app) {
            $job = $app->jobListing;
            $employer = $job?->employer;
            $company = $employer?->employerProfile?->company_name
                ?? trim(($employer?->first_name ?? '').' '.($employer?->last_name ?? ''))
                ?: 'Unknown Company';

            $initials = collect(preg_split('/\s+/', trim($company)))
                ->filter()
                ->map(fn ($w) => mb_substr($w, 0, 1))
                ->join('');
            $initials = mb_strtoupper(mb_substr($initials, 0, 2)) ?: '??';

            $logoPath = $employer?->employerProfile?->logo_path;
            $logoUrl = null;
            if ($logoPath) {
                $relative = ltrim($logoPath, '/');
                if (str_starts_with($relative, 'http://') || str_starts_with($relative, 'https://')) {
                    $logoUrl = $relative;
                } else {
                    $publicRelative = str_starts_with($relative, 'logos/')
                        ? $relative
                        : 'logos/'.$relative;
                    if (file_exists(public_path($publicRelative))) {
                        $logoUrl = '/'.$publicRelative;
                    } else {
                        $logoUrl = Storage::url($logoPath);
                    }
                }
            }

            $start = $app->hired_at ?: $app->created_at;
            $end = $app->contract_ended_at;

            $startDate = $start ? Carbon::parse($start)->toDateString() : null;
            $endDate = $end ? Carbon::parse($end)->toDateString() : null;

            $durationLabel = null;
            if ($start) {
                $to = $end ?: now();
                $months = Carbon::parse($start)->diffInMonths($to);
                $years = intdiv($months, 12);
                $rem = $months % 12;
                if ($years > 0 && $rem > 0) $durationLabel = "{$years} year".($years !== 1 ? 's' : '')." {$rem} month".($rem !== 1 ? 's' : '');
                elseif ($years > 0) $durationLabel = "{$years} year".($years !== 1 ? 's' : '');
                else $durationLabel = max(1, $rem)." month".(max(1, $rem) !== 1 ? 's' : '');
            }

            return [
                'id' => $app->id,
                'job_title' => $job?->title ?? 'Job',
                'company' => [
                    'name' => $company,
                    'initials' => $initials,
                    'logo_url' => $logoUrl,
                ],
                'start_date' => $startDate,
                'end_date' => $endDate,
                'duration' => $durationLabel,
                'location' => $job?->location,
                'is_remote' => (bool) ($job?->is_remote ?? false),
            ];
        };

        $current = $apps->first(fn ($a) => in_array($a->status, ['accepted', 'hired'], true) && $a->contract_ended_at === null);
        $currentShaped = $current ? $shape($current) : null;

        $past = $apps
            ->reject(fn ($a) => $current && $a->id === $current->id)
            ->map(fn ($a) => $shape($a))
            ->values();

        return Inertia::render('JobSeeker/JobHistory', [
            'currentPosition' => $currentShaped,
            'pastPlacements' => $past,
        ]);
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
            'user_id' => $userId,
            'job_listing_id' => $job->id,
            'status' => 'pending',
            'resume_path' => Auth::user()->jobSeekerProfile?->resume_path,
        ]);

        return back();
    }

    /* ─────────────────────────────────────────
       Private helper: shape a JobListing for the frontend
    ───────────────────────────────────────── */
    private function shapeJob(JobListing $job, array $savedIds, array $appliedIds, array $applicationStatuses = []): array
    {
        $companyName = $job->company_name
            ?? $job->employer?->employerProfile?->company_name
            ?? $job->employer?->first_name
            ?? 'Unknown Company';

        return [
            'id' => $job->id,
            'title' => $job->title,
            'company' => $companyName,
            'location' => $job->location,
            'employment_type' => $job->employment_type,
            'salary_min' => $job->salary_min ? (float) $job->salary_min : null,
            'salary_max' => $job->salary_max ? (float) $job->salary_max : null,
            'salary_currency' => $job->salary_currency ?? 'USD',
            'skills_required' => $job->skills_required ?? [],
            'posted_date' => $job->created_at->toISOString(),
            'description' => $job->description,
            'responsibilities' => $job->responsibilities,
            'qualifications' => $job->qualifications,
            'project_timeline' => $job->project_timeline,
            'onboarding_process' => $job->onboarding_process,
            'experience_level' => $job->experience_level,
            'is_remote' => (bool) $job->is_remote,
            'industry' => $job->industry,
            'deadline' => $job->deadline?->toDateString(),
            'application_limit' => $job->application_limit,
            'logo_path' => $job->logo_path,
            'has_applied' => in_array($job->id, $appliedIds),
            'application_status' => $applicationStatuses[$job->id] ?? null,
        ];
    }
}