<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobListing;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminJobController extends Controller
{
    /**
     * List all job listings across all employers.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $type = $request->input('type', 'all');   // all | full-time | part-time | contract | remote

        $jobs = JobListing::with('employer:id,first_name,last_name,employerProfile')
            ->with('employer.employerProfile:user_id,company_name')
            ->withCount('applications')
            ->when($search, fn($q) => $q->where(function ($inner) use ($search) {
                $inner->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('industry', 'like', "%{$search}%");
            }))
            ->when($type === 'full-time', fn($q) => $q->whereRaw("LOWER(REPLACE(REPLACE(employment_type, '-', ' '), '_', ' ')) = ?", ['full time']))
            ->when($type === 'part-time', fn($q) => $q->whereRaw("LOWER(REPLACE(REPLACE(employment_type, '-', ' '), '_', ' ')) = ?", ['part time']))
            ->when($type === 'contract', fn($q) => $q->whereRaw("LOWER(REPLACE(REPLACE(employment_type, '-', ' '), '_', ' ')) = ?", ['contract']))
            ->when($type === 'remote', fn($q) => $q->where(function ($inner) {
                $inner->where('is_remote', true)
                    ->orWhereRaw("LOWER(REPLACE(REPLACE(employment_type, '-', ' '), '_', ' ')) = ?", ['remote']);
            }))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString()
            ->through(fn($job) => [
                'id' => $job->id,
                'title' => $job->title,
                'location' => $job->location,
                'employment_type' => $job->employment_type,
                'is_remote' => $job->is_remote,
                'salary_min' => $job->salary_min,
                'salary_max' => $job->salary_max,
                'salary_currency' => $job->salary_currency ?? 'PHP',
                'status' => $job->status,
                'skills_required' => $job->skills_required ?? [],
                'industry' => $job->industry,
                'applications_count' => $job->applications_count,
                'created_at' => $job->created_at->toDateString(),
                'company' => $job->employer?->employerProfile?->company_name
                    ?? ($job->employer ? "{$job->employer->first_name} {$job->employer->last_name}" : 'Unknown'),
            ]);

        return Inertia::render('Admin/Jobs', [
            'jobs' => $jobs,
            'filters' => ['search' => $search, 'type' => $type],
        ]);
    }

    /**
     * Show a single job listing detail with insights.
     */
    public function show(JobListing $job): Response
    {
        $job->load('employer:id,first_name,last_name', 'employer.employerProfile:user_id,company_name');

        $appCounts = [
            'total' => $job->applications()->count(),
            'pending' => $job->applications()->where('status', 'pending')->count(),
            'approved' => $job->applications()->where('status', 'approved')->count(),
            'rejected' => $job->applications()->where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/JobShow', [
            'job' => [
                'id' => $job->id,
                'title' => $job->title,
                'location' => $job->location,
                'employment_type' => $job->employment_type,
                'is_remote' => $job->is_remote,
                'salary_min' => $job->salary_min,
                'salary_max' => $job->salary_max,
                'salary_currency' => $job->salary_currency ?? 'PHP',
                'description' => $job->description,
                'skills_required' => $job->skills_required ?? [],
                'experience_level' => $job->experience_level,
                'industry' => $job->industry,
                'status' => $job->status,
                'deadline' => $job->deadline?->toDateString(),
                'created_at' => $job->created_at->toDateString(),
                'company' => $job->employer?->employerProfile?->company_name
                    ?? ($job->employer ? "{$job->employer->first_name} {$job->employer->last_name}" : 'Unknown'),
                'employer' => $job->employer ? [
                    'id' => $job->employer->id,
                    'first_name' => $job->employer->first_name,
                    'last_name' => $job->employer->last_name,
                    'avatar' => $job->employer->avatar,
                ] : null,
            ],
            'appCounts' => $appCounts,
        ]);
    }

    /**
     * Show applicants list for a job (admin read-only view).
     */
    public function applications(JobListing $job): Response
    {
        $applications = $job->applications()
            ->where('status', '!=', 'draft')
            ->with([
                'user:id,first_name,last_name,email,phone,avatar',
                'user.jobSeekerProfile:user_id,professional_title,current_job_title,current_company,city,state,country,skills,certifications,about,resume_path,linkedin_url,portfolio_url,highest_education',
                'user.workExperiences',
            ])
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
                        'certifications' => $app->user->jobSeekerProfile->certifications,
                        'about' => $app->user->jobSeekerProfile->about,
                        'resume_path' => $app->user->jobSeekerProfile->resume_path,
                        'linkedin_url' => $app->user->jobSeekerProfile->linkedin_url,
                        'portfolio_url' => $app->user->jobSeekerProfile->portfolio_url,
                        'highest_education' => $app->user->jobSeekerProfile->highest_education,
                    ] : null,
                    'work_experiences' => $app->user->workExperiences->map(fn($exp) => [
                        'id' => $exp->id,
                        'job_title' => $exp->job_title,
                        'company' => $exp->company,
                        'employment_type' => $exp->employment_type,
                        'location' => $exp->location,
                        'start_date' => $exp->start_date?->format('M Y'),
                        'end_date' => $exp->is_current ? 'Present' : $exp->end_date?->format('M Y'),
                        'is_current' => $exp->is_current,
                        'description' => $exp->description,
                    ])->values(),
                ],
            ]);

        return Inertia::render('Admin/JobApplications', [
            'job' => [
                'id' => $job->id,
                'title' => $job->title,
                'company' => $job->employer?->employerProfile?->company_name ?? 'Unknown',
                'location' => $job->location,
                'employment_type' => $job->employment_type,
                'posted_date' => $job->created_at->toDateString(),
            ],
            'applications' => $applications,
        ]);
    }
}
