<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\JobApplication;
use Inertia\Inertia;

class ApplicantTimelineController extends Controller
{
    public function show(User $user)
    {
        // Eager load profile, manual experiences, and other related data
        $user->load([
            'jobSeekerProfile', 
            'workExperiences' => function($query) {
                $query->orderBy('start_date', 'desc');
            }
        ]); 

        // Fetch system-verified placements via job_applications
        $applications = JobApplication::with(['jobListing.company'])
            ->where('user_id', $user->id)
            ->whereNotNull('hired_at')
            ->orderBy('hired_at', 'desc')
            ->get();

        return Inertia::render('Employer/ApplicantTimeline', [
            'applicant' => [
                'id' => $user->id,
                'full_name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'email' => $user->email,
                'avatar' => $user->avatar,
                'is_open_to_work' => $user->jobSeekerProfile?->is_open_to_work ?? false,
                
                // Profile data mapping
                'about' => $user->jobSeekerProfile?->about ?? 'No professional summary provided.',
                'title' => $user->jobSeekerProfile?->professional_title ?? 'No data available',
                'location' => $user->jobSeekerProfile 
                    ? trim(($user->jobSeekerProfile->city ?? '') . ', ' . ($user->jobSeekerProfile->country ?? '')) 
                    : 'No data available',
                
                // Education mapping
                'education_history' => [
                    [
                        'school' => $user->jobSeekerProfile?->institution_name ?? 'No data available',
                        'degree' => $user->jobSeekerProfile?->highest_education ?? 'No data available',
                        'field' => $user->jobSeekerProfile?->field_of_study ?? 'No data available',
                        'year' => 'No data available' 
                    ]
                ],

                // Skills (Decodes JSON if stored as string, or returns array)
                'skills' => $user->jobSeekerProfile?->skills ?? [],

                // Projects & Certifications (Mapping JSON data from job_seeker_profiles)
                // Assumes these are stored as JSON in your DB. If you have separate tables, 
                // load them like workExperiences above.
                'projects' => $user->jobSeekerProfile?->projects ?? [], 
                'certifications' => $user->jobSeekerProfile?->certifications ?? [],
                
                'availability' => [
                    'weekly_hours' => $user->jobSeekerProfile?->weekly_hours ?? 'No data available',
                    'notice_period' => $user->jobSeekerProfile?->notice_period ?? 'No data available',
                    'work_style' => $user->jobSeekerProfile?->work_style ?? 'No data available',
                    'preferred_location' => $user->jobSeekerProfile?->city ?? 'No data available',
                ],
            ],

            // Placements tracked within the AVAA system
            'currentPosition' => $applications->whereNull('contract_ended_at')->first(),
            'pastPlacements' => $applications->whereNotNull('contract_ended_at')->values(),

            // Manual history from the work_experiences table (The "missing" data)
            'manualExperiences' => $user->workExperiences->map(function($exp) {
                return [
                    'id' => $exp->id,
                    'job_title' => $exp->job_title,
                    'company' => $exp->company,
                    'employment_type' => $exp->employment_type,
                    'start_date' => $exp->start_date ? \Carbon\Carbon::parse($exp->start_date)->format('M Y') : null,
                    'end_date' => $exp->end_date ? \Carbon\Carbon::parse($exp->end_date)->format('M Y') : 'Present',
                    'description' => $exp->description,
                    'is_current' => (bool)$exp->is_current,
                ];
            })
        ]);
    }
}