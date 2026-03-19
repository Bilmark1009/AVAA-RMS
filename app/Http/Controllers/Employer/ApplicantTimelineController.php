<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ApplicantTimelineController extends Controller
{
    /**
     * List all hired employees for the employer's jobs.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get all applications that are 'hired' for this employer's jobs, where contract is not ended
        $employees = JobApplication::whereHas('jobListing', function ($q) use ($user) {
            $q->where('employer_id', $user->id);
        })
            ->where('status', 'hired')
            ->whereNull('contract_ended_at')
            ->with(['user.jobSeekerProfile', 'jobListing', 'user'])
            ->latest('hired_at')
            ->get()
            ->map(fn($app) => [
                'id' => $app->id,
                'status' => $app->status,
                'application_data' => $app->application_data,
                'cover_letter' => $app->cover_letter,
                'resume_path' => $app->resume_path,
                'created_at' => $app->created_at?->toIso8601String(),
                'candidate' => [
                    'id' => $app->user->id,
                    'first_name' => $app->user->first_name,
                    'last_name' => $app->user->last_name,
                    'email' => $app->user->email,
                    'phone' => $app->user->phone,
                    'avatar' => $app->user->avatar,
                    'title' => $app->user->jobSeekerProfile?->professional_title
                        ?? $app->user->jobSeekerProfile?->current_job_title
                        ?? '',
                    'profile' => [
                        'professional_title' => $app->user->jobSeekerProfile?->professional_title,
                        'current_job_title' => $app->user->jobSeekerProfile?->current_job_title,
                        'current_company' => $app->user->jobSeekerProfile?->current_company,
                        'city' => $app->user->jobSeekerProfile?->city,
                        'state' => $app->user->jobSeekerProfile?->state,
                        'country' => $app->user->jobSeekerProfile?->country,
                        'skills' => $app->user->jobSeekerProfile?->skills,
                        'resume_path' => $app->user->jobSeekerProfile?->resume_path,
                    ],
                ],
                'job' => [
                    'id' => $app->jobListing->id,
                    'title' => $app->jobListing->title,
                ],
                'hired_at' => $app->hired_at?->toIso8601String(),
            ]);

        return Inertia::render('Employer/Users', [
            'employees' => $employees,
            'activeCount' => $employees->count(),
        ]);
    }

    /**
     * End an employee's contract.
     */
    public function endContract(Request $request, JobApplication $application): RedirectResponse
    {
        // Ensure the application belongs to a job owned by this employer
        abort_if($application->jobListing->employer_id !== $request->user()->id, 403, 'Unauthorized.');

        $application->update([
            'status' => 'contract_ended',
            'contract_ended_at' => now(),
        ]);

        \Illuminate\Support\Facades\Mail::to($application->user->email)
            ->queue(new \App\Mail\ContractEnded($application, $application->jobListing));

        return back()->with('success', 'Employee contract ended.');
    }
   public function show(Request $request, JobApplication $application): Response
{
    abort_if($application->jobListing->employer_id !== $request->user()->id, 403);

    // Ensure education relationships are loaded if they are in a separate table, 
    // otherwise they come from the jobSeekerProfile
    $application->load(['user.jobSeekerProfile', 'user.workExperiences', 'user.documents','jobListing']);

    $user = $application->user;
    $profile = $user->jobSeekerProfile;

    $resumePath = $application->resume_path;

    if (!$resumePath && $profile) {
        $resumePath = $profile->resume_path;
    }

    if (!$resumePath) {
        // Look for a document marked as 'Resume' in the user_documents table
        $resumeDocument = $user->documents
            ->where('document_type', 'Resume')
            ->first();
        
        $resumePath = $resumeDocument ? $resumeDocument->file_path : null;
    }
    // 1. Start with an empty array or existing work_experiences
    $manualExperiences = $user->workExperiences->map(fn($exp) => [
        'id' => $exp->id,
        'job_title' => $exp->job_title,
        'company' => $exp->company_name ?? $exp->company, 
        'start_date' => $exp->start_date ? \Carbon\Carbon::parse($exp->start_date)->format('M Y') : 'N/A',
        'end_date' => $exp->is_current ? 'Present' : ($exp->end_date ? \Carbon\Carbon::parse($exp->end_date)->format('M Y') : 'N/A'),
        'description' => $exp->description,
    ])->toArray();

    // 2. Since your work_experiences table is empty, 
    // we manually inject the Denso Ten data from the profile table
    if (empty($manualExperiences) && $profile?->current_company) {
        $manualExperiences[] = [
            'id' => 'profile-primary',
            'job_title' => $profile->current_job_title ?? 'Professional',
            'company' => $profile->current_company,
            'start_date' => 'Previous', // Since there's no start_date in job_seeker_profiles
            'end_date' => 'Recent',
            'description' => "Total experience: {$profile->years_of_experience}",
            'is_current' => false,
        ];
    }
    return Inertia::render('Employer/ApplicantTimeline', [
        'applicant' => [
            'id' => $user->id,
            'full_name' => $user->first_name . ' ' . $user->last_name,
            'first_name' => $user->first_name,
            'avatar' => $user->avatar,
            'email' => $user->email,
            'phone' => $user->phone,
            'title' => $profile?->professional_title,
            'about' => $profile?->about, 
            'resume_path' => $resumePath,
            'location' => $profile 
                ? "{$profile->city}, {$profile->state}, {$profile->country}" 
                : 'Location not provided',
            'skills' => is_string($profile?->skills) 
                ? json_decode($profile->skills, true) 
                : ($profile?->skills ?? []),
            // FETCHING EDUCATION DATA
            'education_history' => $profile && $profile->institution_name ? [
                [
                    'institution_name' => $profile->institution_name,
                    'degree' => $profile->highest_education,
                    'field' => $profile->field_of_study,
                ]
            ] : [],

            'is_open_to_work' => $profile?->is_open_to_work ?? true,
            'availability' => [
                'weekly_hours' => $profile?->weekly_hours,
                'work_style' => $profile?->work_style,
                'notice_period' => $profile?->notice_period,
            ]
        ],

       'currentPosition' => [
            'job_title' => $application->jobListing->title,
            
            // Gets the actual company name from the listing relationship
            'company' => $application->jobListing->company->name 
                         ?? $application->jobListing->employer->company_name 
                         ?? 'AVAA Partner',
            
            // Gets the actual hired date from the application
            'start_date' => $application->hired_at 
                ? $application->hired_at->format('M d, Y') 
                : 'Joined Recently',
                
            'is_current' => true,
            'description' => "Currently hired as " . $application->jobListing->title . " via AVAA Platform"
        ],

        
        'manualExperiences' => $manualExperiences,
        'pastPlacements' => [],
        
    ]);
}
}
