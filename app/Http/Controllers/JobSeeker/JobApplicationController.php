<?php

namespace App\Http\Controllers\JobSeeker;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobListing;
use App\Models\User;
use App\Notifications\ApplicationReceivedNotification;
use App\Notifications\ApplicationWithdrawnByApplicantNotification;
use App\Notifications\ApplicantWithdrewApplicationNotification;
use App\Notifications\NewApplicationNotification;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class JobApplicationController extends Controller
{
    public function resume(Request $request, JobApplication $application): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $user = $request->user();

        $application->loadMissing(['jobListing', 'user.jobSeekerProfile']);

        $canAccess = false;

        if ($user->id === $application->user_id) {
            $canAccess = true;
        } elseif ($user->isAdmin()) {
            $canAccess = true;
        } elseif ($user->isEmployer() && $application->jobListing && $application->jobListing->isAccessibleBy($user)) {
            $canAccess = true;
        }

        abort_unless($canAccess, 403, 'You are not allowed to access this resume.');

        $rawPath = $application->resume_path
            ?? data_get($application->application_data, 'existing_resume')
            ?? $application->user?->jobSeekerProfile?->resume_path;

        $resolved = $this->resolveStoredResumePath($application->user_id, $rawPath);
        abort_unless($resolved !== null, 404, 'Resume file not found.');

        ['disk' => $disk, 'path' => $path] = $resolved;

        $absolutePath = Storage::disk($disk)->path($path);
        abort_unless(file_exists($absolutePath), 404, 'Resume file not found.');

        $fileName = basename($path) ?: 'resume.pdf';
        $disposition = $request->boolean('download') ? 'attachment' : 'inline';

        return response()->file($absolutePath, [
            'Content-Disposition' => $disposition . '; filename="' . $fileName . '"',
        ]);
    }

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
            ->whereNotIn('status', ['accepted', 'hired', 'contract_ended'])
            ->latest()
            ->get()
            ->map(function (JobApplication $app) {
                $job = $app->jobListing;
                $employer = $job?->employer;
                $company = $employer?->employerProfile?->company_name
                    ?? trim(($employer?->first_name ?? '').' '.($employer?->last_name ?? ''))
                    ?: 'Unknown Company';
                    $logoUrl = $this->resolveImageUrl($employer?->employerProfile?->logo_path);

                $initials = collect(preg_split('/\s+/', trim($company)))
                    ->filter()
                    ->map(fn ($w) => mb_substr($w, 0, 1))
                    ->join('');
                $initials = mb_strtoupper(mb_substr($initials, 0, 2));

                // Derive "Interviewing" stage if an interview is currently active or has been rescheduled.
                $stage = $app->status;
                if (! in_array($app->status, ['rejected', 'withdrawn', 'accepted', 'hired', 'contract_ended'], true)) {
                    if ($app->interview && in_array(($app->interview->status ?? null), ['active', 'rescheduled'], true)) {
                        $stage = 'interviewing';
                    }
                }

                $canWithdraw = ! in_array($app->status, ['withdrawn', 'rejected', 'accepted', 'hired', 'contract_ended'], true);

                $interview = $app->interview;
                $interviewDate = $interview?->interview_date;
                $interviewTime = $interview?->interview_time;

                $salaryCurrency = $job?->salary_currency ?: 'USD';
                $salaryMin = $job?->salary_min !== null ? (float) $job->salary_min : null;
                $salaryMax = $job?->salary_max !== null ? (float) $job->salary_max : null;

                return [
                    'id' => $app->id,
                    'status' => $app->status,
                    'stage' => $stage,
                    'applied_at' => optional($app->created_at)->toISOString(),
                    'updated_at' => optional($app->updated_at)->toISOString(),
                    'reviewed_at' => optional($app->reviewed_at)->toISOString(),
                    'time_ago' => optional($app->created_at)->diffForHumans(),
                    'can_withdraw' => $canWithdraw,
                    'reviewer_notes' => $app->employer_notes,
                    'rejection_reason' => $app->rejection_reason,
                    'job' => $job ? [
                        'id' => $job->id,
                        'title' => $job->title,
                        'location' => $job->location,
                        'is_remote' => (bool) $job->is_remote,
                        'employment_type' => $job->employment_type,
                        'description' => $job->description,
                        'industry' => $job->industry,
                        'experience_level' => $job->experience_level,
                        'skills_required' => $job->skills_required ?? [],
                        'salary_min' => $salaryMin,
                        'salary_max' => $salaryMax,
                        'salary_currency' => $salaryCurrency,
                    ] : null,
                    'company' => [
                        'name' => $company,
                        'initials' => $initials ?: '??',
                        'logo_url' => $logoUrl,
                        'size' => $employer?->employerProfile?->company_size,
                    ],
                    'interview' => $interview ? [
                        'status' => $interview->status,
                        'interview_type' => $interview->interview_type,
                        'interviewer_name' => $interview->interviewer_name,
                        'location_or_link' => $interview->location_or_link,
                        'notes' => $interview->notes,
                        'date' => $interviewDate?->toDateString(),
                        'date_label' => $interviewDate?->format('F j, Y'),
                        'time' => $interviewTime,
                        'time_label' => $interviewTime ? Carbon::parse((string) $interviewTime)->format('g:i A') : null,
                    ] : null,
                ];
            })
            ->values();

        return Inertia::render('JobSeeker/ApplicationHistory', [
            'applications' => $applications,
        ]);
    }

        private function resolveImageUrl(?string $path): ?string
{
    if (!is_string($path) || trim($path) === '') {
        return null;
    }

    $trimmed = trim($path);

    // 1. If it's already a full URL, return it
    if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
        return $trimmed;
    }

    // 2. If it already has the /storage/ prefix, make it a full asset URL
    if (str_starts_with($trimmed, '/storage/')) {
        return asset($trimmed);
    }

    // 3. If it starts with storage/ (no leading slash), fix it and return asset
    if (str_starts_with($trimmed, 'storage/')) {
        return asset('/' . $trimmed);
    }

    // 4. Default: Assume it's a raw path inside the 'public' disk (e.g., "logos/image.jpg")
    // This uses Laravel's built-in logic to generate the correct URL
    return asset('storage/' . ltrim($trimmed, '/'));
}
    /**
     * Job Seeker: Withdraw a submitted application.
     */
    public function withdraw(Request $request, JobApplication $application): RedirectResponse
    {
        abort_unless($application->user_id === $request->user()->id, 403);

        if (in_array($application->status, ['withdrawn', 'rejected', 'accepted', 'hired', 'contract_ended'], true)) {
            return back();
        }

        $job = $application->jobListing;
        $applicant = $request->user();
        $employer = $job?->employer;

        // Notify both parties and keep the record as withdrawn for history filtering.
        if ($job) {
            $applicant->notify(new ApplicationWithdrawnByApplicantNotification($job));

            if ($employer) {
                $employer->notify(new ApplicantWithdrewApplicationNotification($job, $applicant));
            }
        }

        $application->update(['status' => 'withdrawn']);

        return back()->with('success', 'Application withdrawn successfully.');
    }

    /**
     * Show the multi-step application form (pre-filled from profile).
     */
    public function create(JobListing $job): Response|RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        // Already applied?
        $existing = JobApplication::where('user_id', $user->id)
            ->where('job_listing_id', $job->id)
            ->first();

        if ($existing && $existing->status === 'contract_ended') {
            return redirect()->route('job-seeker.jobs.show', $job->id)
                ->with('info', 'Reapplication is not allowed because your previous contract for this job has ended.');
        }

        if ($existing && ! in_array($existing->status, ['draft', 'withdrawn'], true)) {
            return redirect()->route('job-seeker.jobs.show', $job->id)
                ->with('info', 'You have already applied to this job.');
        }

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
                'company' => $job->company_name
                    ?? $job->employer?->employerProfile?->company_name
                    ?? $job->employer?->first_name
                    ?? 'Unknown Company',
                'location' => $job->location,
                'employment_type' => $job->employment_type,
                'description' => $job->description,
                'responsibilities' => $job->responsibilities,
                'qualifications' => $job->qualifications,
                'project_timeline' => $job->project_timeline,
                'onboarding_process' => $job->onboarding_process,
                'salary_min' => $job->salary_min,
                'salary_max' => $job->salary_max,
                'salary_currency' => $job->salary_currency,
                'skills_required' => $job->skills_required ?? [],
                'deadline' => $job->deadline?->toDateString(),
                'logo_path' => $job->logo_path,
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

        if ($job->status !== 'active') {
            return back()->withErrors(['apply' => 'This job is not currently accepting applications.']);
        }

        if ($job->deadline && now()->startOfDay()->gt($job->deadline)) {
            return back()->withErrors(['apply' => 'This job posting has expired.']);
        }

        // Check for existing non-draft application
        $existing = JobApplication::where('user_id', $user->id)
            ->where('job_listing_id', $job->id)
            ->first();

        if ($existing && $existing->status === 'contract_ended') {
            return redirect()->route('job-seeker.jobs.show', $job->id)
                ->with('info', 'Reapplication is not allowed because your previous contract for this job has ended.');
        }

        if ($existing && ! in_array($existing->status, ['draft', 'withdrawn'], true)) {
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
            $resumePath = $this->storeWithOriginalName($request->file('resume'), "resumes/{$user->id}", 'public', 'resume');
            $resumePath = '/storage/' . $resumePath;
        }

        // Build application data snapshot
        $applicationData = [
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? '',
            'location' => $validated['location'] ?? '',
            'applied_job_title' => $job->title,
            'applied_company_name' => $job->company_name,
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

        if ($existing && in_array($existing->status, ['draft', 'withdrawn'], true)) {
            // Reset any previous outcome-specific fields when reapplying.
            $data = array_merge($data, [
                'rejection_reason' => null,
                'reviewed_at' => null,
                'hired_at' => null,
                'contract_ended_at' => null,
            ]);

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

        if ($job->status !== 'active') {
            return back()->withErrors(['apply' => 'This job is not currently accepting applications.']);
        }

        $existing = JobApplication::where('user_id', $user->id)
            ->where('job_listing_id', $job->id)
            ->first();

        if ($existing && $existing->status === 'contract_ended') {
            return back()->with('info', 'Reapplication is not allowed because your previous contract for this job has ended.');
        }

        if ($existing && ! in_array($existing->status, ['draft', 'withdrawn'], true)) {
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
            $resumePath = $this->storeWithOriginalName($request->file('resume'), "resumes/{$user->id}", 'public', 'resume');
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

    private function storeWithOriginalName(UploadedFile $file, string $directory, string $disk, string $fallbackBase): string
    {
        $originalBase = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeBase = preg_replace('/[^A-Za-z0-9_\- ]+/', '', $originalBase) ?: $fallbackBase;
        $safeBase = trim(preg_replace('/\s+/', '_', $safeBase), '_') ?: $fallbackBase;

        $extension = strtolower($file->getClientOriginalExtension());
        $candidate = $extension !== '' ? "{$safeBase}.{$extension}" : $safeBase;
        $counter = 1;

        while (Storage::disk($disk)->exists("{$directory}/{$candidate}")) {
            $candidate = $extension !== ''
                ? "{$safeBase}_{$counter}.{$extension}"
                : "{$safeBase}_{$counter}";
            $counter++;
        }

        return $file->storeAs($directory, $candidate, $disk);
    }

    private function resolveStoredResumePath(int $userId, ?string $rawPath): ?array
    {
        $rawPath = trim((string) $rawPath);

        if ($rawPath !== '') {
            if (str_starts_with($rawPath, '/storage/')) {
                $publicPath = ltrim(substr($rawPath, strlen('/storage/')), '/');
                if (Storage::disk('public')->exists($publicPath)) {
                    return ['disk' => 'public', 'path' => $publicPath];
                }
            }

            if (str_starts_with($rawPath, 'storage/')) {
                $publicPath = ltrim(substr($rawPath, strlen('storage/')), '/');
                if (Storage::disk('public')->exists($publicPath)) {
                    return ['disk' => 'public', 'path' => $publicPath];
                }
            }

            if (Storage::disk('local')->exists($rawPath)) {
                return ['disk' => 'local', 'path' => $rawPath];
            }

            if (Storage::disk('public')->exists($rawPath)) {
                return ['disk' => 'public', 'path' => $rawPath];
            }

            $baseName = basename($rawPath);
            if ($baseName !== '' && $baseName !== '.' && $baseName !== DIRECTORY_SEPARATOR) {
                foreach (['public', 'local'] as $disk) {
                    foreach (["resumes/{$userId}/{$baseName}", "documents/{$userId}/{$baseName}"] as $candidate) {
                        if (Storage::disk($disk)->exists($candidate)) {
                            return ['disk' => $disk, 'path' => $candidate];
                        }
                    }
                }
            }
        }

        $targetExt = strtolower(pathinfo((string) $rawPath, PATHINFO_EXTENSION));

        foreach (['public', 'local'] as $disk) {
            foreach (["resumes/{$userId}", "documents/{$userId}"] as $dir) {
                $files = Storage::disk($disk)->files($dir);
                if (empty($files)) {
                    continue;
                }

                $sameExt = array_values(array_filter($files, function ($filePath) use ($targetExt) {
                    if ($targetExt === '') {
                        return true;
                    }

                    return strtolower(pathinfo($filePath, PATHINFO_EXTENSION)) === $targetExt;
                }));

                if (empty($sameExt)) {
                    continue;
                }

                usort($sameExt, function ($a, $b) use ($disk) {
                    return Storage::disk($disk)->lastModified($b) <=> Storage::disk($disk)->lastModified($a);
                });

                return ['disk' => $disk, 'path' => $sameExt[0]];
            }
        }

        return null;
    }
}
