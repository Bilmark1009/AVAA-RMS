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
            ->with(['employer:id,first_name,last_name', 'employer.employerProfile:id,user_id,company_name,logo_path']);

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
            'jobs'               => $shaped,
            'savedJobIds'        => $savedJobIds,
            'filters'            => $request->only(['search', 'date_posted', 'skills', 'companies']),
            'availableSkills'    => $availableSkills,
            'availableCompanies' => $availableCompanies,
            'profileComplete'    => (bool) $user->profile_completed,
        ]);
    }

    public function show(Request $request, JobListing $job)
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
                    $q->where('employer_id', $job->employer_id);
                }
            })
            ->limit(3)
            ->get()
            ->map(fn($j) => $this->shapeJob($j, $savedJobIds, $appliedJobIds, $applicationStatuses));

        // ── Build hiring team: job owner + accepted collaborators ──
        $job->load([
            'employer.employerProfile',
            'acceptedCollaborators.user.employerProfile',
        ]);

        $hiringTeamItems = [];

        // Job owner first
        if ($job->employer) {
            $hiringTeamItems[] = $this->shapeTeamMember($job->employer);
        }

        // Accepted collaborators
        foreach ($job->acceptedCollaborators as $collab) {
            if ($collab->user) {
                $hiringTeamItems[] = $this->shapeTeamMember($collab->user);
            }
        }

        $hiringTeam = collect($hiringTeamItems);

        $source = $request->query('from') === 'saved' ? 'saved' : 'browse';

        return Inertia::render('JobSeeker/JobDetail', [
            'job'         => $this->shapeJob($job, $savedJobIds, $appliedJobIds, $applicationStatuses),
            'isSaved'     => in_array($job->id, $savedJobIds),
            'hasApplied'  => in_array($job->id, $appliedJobIds),
            'similarJobs' => $similarJobs,
            'hiringTeam'  => $hiringTeam->values(),
            'source'      => $source,
        ]);
    }

    /* ─────────────────────────────────────────
       Shape a User into a hiring team member
    ───────────────────────────────────────── */
    private function shapeTeamMember(\App\Models\User $user): array
    {
        $profile = $user->employerProfile;
        $location = collect([$profile?->city, $profile?->state, $profile?->country])
            ->filter()
            ->implode(', ');

        return [
            'id'              => $user->id,
            'name'            => trim("{$user->first_name} {$user->last_name}"),
            'title'           => $profile?->company_name ?? 'Recruiter',
            'avatar'          => $this->resolveImageUrl($user->avatar)
                                ?? $this->resolveImageUrl($profile?->logo_path),
            'email'           => $user->email,
            'phone'           => $user->phone,
            'company'         => $profile?->company_name,
            'industry'        => $profile?->industry,
            'company_size'    => $profile?->company_size,
            'location'        => $location ?: null,
            'company_website' => $profile?->company_website,
            'linkedin_url'    => $profile?->linkedin_url,
            'facebook_url'    => $profile?->facebook_url,
            'twitter_url'     => $profile?->twitter_url,
        ];
    }

    /* ─────────────────────────────────────────
       Saved jobs list
    ───────────────────────────────────────── */
    public function saved(Request $request)
    {
        $user = Auth::user();

        $savedIds = SavedJob::where('user_id', $user->id)->pluck('job_listing_id');

        $query = JobListing::whereIn('id', $savedIds)
            ->with(['employer:id,first_name,last_name', 'employer.employerProfile:id,user_id,company_name,logo_path']);

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

        $appliedJobIds = JobApplication::where('user_id', $user->id)
            ->whereNotIn('status', ['withdrawn', 'accepted', 'hired'])
            ->pluck('job_listing_id')
            ->toArray();

        $applicationStatuses = JobApplication::where('user_id', $user->id)
            ->whereIn('job_listing_id', $jobs->pluck('id'))
            ->pluck('status', 'job_listing_id')
            ->toArray();

        $shaped = $jobs->map(fn($job) => $this->shapeJob($job, $savedIds->toArray(), $appliedJobIds, $applicationStatuses));

        $allSaved        = JobListing::whereIn('id', $savedIds)->get();
        $availableSkills = $allSaved->flatMap(fn($j) => $j->skills_required ?? [])->unique()->values()->toArray();
        $availableCompanies = $allSaved
            ->map(fn($j) => $j->employer?->employerProfile?->company_name ?? $j->employer?->first_name)
            ->filter()->unique()->values()->toArray();

        return Inertia::render('JobSeeker/SavedJobs', [
            'savedJobs'          => $shaped,
            'filters'            => $request->only(['search', 'date_posted', 'skills', 'companies']),
            'availableSkills'    => $availableSkills,
            'availableCompanies' => $availableCompanies,
        ]);
    }

    /* ─────────────────────────────────────────
       Save / Unsave a job
    ───────────────────────────────────────── */
    public function save(JobListing $job)
    {
        SavedJob::firstOrCreate([
            'user_id'        => Auth::id(),
            'job_listing_id' => $job->id,
        ]);

        return back();
    }

    public function unsave(JobListing $job)
    {
        SavedJob::where('user_id', Auth::id())
            ->where('job_listing_id', $job->id)
            ->delete();

        return back();
    }

    /* ─────────────────────────────────────────
       Report a job listing
    ───────────────────────────────────────── */
    public function report(Request $request, JobListing $job)
    {
        $validated = $request->validate([
            // Keep these in sync with the reports table enum values
            'reason'      => 'required|string|in:spam,inappropriate_behavior,suspicious_job,identity_theft,other',
            'description' => 'nullable|string|max:1000',
        ]);

        \App\Models\Report::create([
            'job_listing_id' => $job->id,
            'reporter_id'    => Auth::id(),
            'reason'         => $validated['reason'],
            'details'        => $validated['description'],
            'status'         => 'pending',
        ]);

        return back()->with('success', 'Thank you! We have received your report and will review it shortly.');
    }

    /* ─────────────────────────────────────────
       Share a job via email
    ───────────────────────────────────────── */
    public function share(Request $request, JobListing $job)
    {
        $validated = $request->validate([
            'email'   => 'required|email',
            'message' => 'nullable|string|max:500',
        ]);

        $currentUser = Auth::user();
        $recipientEmail = $validated['email'];
        $personalMessage = $validated['message'];

        // Send email with job details
        \Illuminate\Support\Facades\Mail::send('emails.share-job', [
            'job'              => $job,
            'senderName'       => "{$currentUser->first_name} {$currentUser->last_name}",
            'senderEmail'      => $currentUser->email,
            'personalMessage'  => $personalMessage,
            'jobUrl'           => route('job-seeker.jobs.show', $job->id),
        ], function ($message) use ($recipientEmail, $job) {
            $message->to($recipientEmail)
                    ->subject("Check out this job: {$job->title}");
        });

        return back()->with('success', 'Job shared successfully!');
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
            $job      = $app->jobListing;
            $employer = $job?->employer;
            $company  = $employer?->employerProfile?->company_name
                ?? trim(($employer?->first_name ?? '').' '.($employer?->last_name ?? ''))
                ?: 'Unknown Company';

            $initials = collect(preg_split('/\s+/', trim($company)))
                ->filter()
                ->map(fn ($w) => mb_substr($w, 0, 1))
                ->join('');
            $initials = mb_strtoupper(mb_substr($initials, 0, 2)) ?: '??';

            $logoUrl   = $this->resolveImageUrl($employer?->employerProfile?->logo_path);
            $start     = $app->hired_at ?: $app->created_at;
            $end       = $app->contract_ended_at;
            $startDate = $start ? Carbon::parse($start)->toDateString() : null;
            $endDate   = $end   ? Carbon::parse($end)->toDateString()   : null;

            $durationLabel = null;
            if ($start) {
                $to     = $end ?: now();
                $months = Carbon::parse($start)->diffInMonths($to);
                $years  = intdiv($months, 12);
                $rem    = $months % 12;
                if ($years > 0 && $rem > 0)  $durationLabel = "{$years}yr {$rem}mo";
                elseif ($years > 0)           $durationLabel = "{$years} year".($years !== 1 ? 's' : '');
                else                          $durationLabel = max(1, $rem)." month".(max(1, $rem) !== 1 ? 's' : '');
            }

            return [
                'id'        => $app->id,
                'job_title' => $job?->title ?? 'Job',
                'company'   => ['name' => $company, 'initials' => $initials, 'logo_url' => $logoUrl],
                'start_date'  => $startDate,
                'end_date'    => $endDate,
                'duration'    => $durationLabel,
                'location'    => $job?->location,
                'is_remote'   => (bool) ($job?->is_remote ?? false),
            ];
        };

        $current       = $apps->first(fn ($a) => in_array($a->status, ['accepted', 'hired'], true) && $a->contract_ended_at === null);
        $currentShaped = $current ? $shape($current) : null;
        $past          = $apps->reject(fn ($a) => $current && $a->id === $current->id)->map(fn ($a) => $shape($a))->values();

        return Inertia::render('JobSeeker/JobHistory', [
            'currentPosition' => $currentShaped,
            'pastPlacements'  => $past,
        ]);
    }

    /* ─────────────────────────────────────────
       Apply to a job
    ───────────────────────────────────────── */
    public function apply(Request $request, JobListing $job)
    {
        $userId = Auth::id();

        if (JobApplication::where('user_id', $userId)->where('job_listing_id', $job->id)->exists()) {
            return back()->withErrors(['apply' => 'You have already applied to this job.']);
        }

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
    private function shapeJob(JobListing $job, array $savedIds, array $appliedIds, array $applicationStatuses = []): array
    {
        $companyName = $job->company_name
            ?? $job->employer?->employerProfile?->company_name
            ?? $job->employer?->first_name
            ?? 'Unknown Company';

        return [
            // ── Core identity ──────────────────────────────
            'id'               => $job->id,
            'title'            => $job->title,
            'company'          => $companyName,
            'location'         => $job->location,
            'posted_date'      => $job->created_at->toISOString(),
            'deadline'         => $job->deadline?->toDateString(),

            // ── Employment details ─────────────────────────
            'employment_type'  => $job->employment_type,
            'experience_level' => $job->experience_level,
            'work_arrangement' => $job->work_arrangement,        // ← was missing
            'is_remote'        => (bool) $job->is_remote,
            'industry'         => $job->industry,
            'application_limit'=> $job->application_limit,

            // ── Compensation ───────────────────────────────
            'salary_min'       => $job->salary_min      ? (float) $job->salary_min      : null,
            'salary_max'       => $job->salary_max      ? (float) $job->salary_max      : null,
            'salary_currency'  => $job->salary_currency ?? 'USD',

            // ── Content sections ───────────────────────────
            'description'        => $job->description,
            'responsibilities'   => $job->responsibilities,
            'qualifications'     => $job->qualifications,
            'requirements'       => $job->requirements,          // ← was missing
            'skills_required'    => $job->skills_required   ?? [],
            'screener_questions' => $job->screener_questions ?? [], // ← was missing
            'project_timeline'   => $job->project_timeline,
            'onboarding_process' => $job->onboarding_process,

            // ── Media ──────────────────────────────────────
            'logo_path' => $job->logo_path,
            'logo_url'  => $this->resolveImageUrl($job->logo_path)
                        ?? $this->resolveImageUrl($job->employer?->employerProfile?->logo_path),

            // ── Application state ──────────────────────────
            'has_applied'        => in_array($job->id, $appliedIds),
            'application_status' => $applicationStatuses[$job->id] ?? null,
        ];
    }

    private function resolveImageUrl(?string $path): ?string
    {
        if (!is_string($path) || trim($path) === '') {
            return null;
        }

        $trimmed = trim($path);

        if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            return $trimmed;
        }

        if (str_starts_with($trimmed, '/storage/') || str_starts_with($trimmed, '/logos/')) {
            return $trimmed;
        }

        if (str_starts_with($trimmed, 'storage/') || str_starts_with($trimmed, 'logos/')) {
            return '/'.$trimmed;
        }

        if (Storage::disk('public')->exists($trimmed)) {
            return Storage::url($trimmed);
        }

        return '/'.ltrim($trimmed, '/');
    }
}