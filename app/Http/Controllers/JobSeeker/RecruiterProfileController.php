<?php

namespace App\Http\Controllers\JobSeeker;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\JobListing;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class RecruiterProfileController extends Controller
{
    public function show(User $user)
    {
        // 1. Eager load the employer profile relationship
        $user->load('employerProfile');
        $profile = $user->employerProfile;

        // 2. Format the full name using first_name and last_name columns
        $fullName = trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? ''));
        if (empty($fullName)) {
            $fullName = 'Recruiter';
        }

        // 3. Map jobs to include the COMPANY logo specifically for the cards
        $authUserId = Auth::id();

        $postedJobs = JobListing::where('employer_id', $user->id)
    ->where('status', 'active')
    ->latest()
    ->get()
    ->map(function ($job) use ($profile, $authUserId) {
        return [
            'id' => $job->id,
            'title' => $job->title,
            'company_name' => $profile->company_name ?? 'AMR',
            'company_logo' => $profile->logo_path ? Storage::url($profile->logo_path) : null,
            'location' => $job->location,
            'is_remote' => (bool)$job->is_remote,
            // TIME: Ensure this is formatted
            'posted_date' => $job->created_at->toISOString(), 
            // TYPE: Ensure your DB has a 'type' or 'employment_type' column
            'employment_type' => $job->type ?? 'Full-time', 
            // SALARY: Provide default values to prevent "undefined"
            'salary_min' => $job->salary_min ?? 0,
            'salary_max' => $job->salary_max ?? 0,
            'salary_currency' => $job->salary_currency ?? 'USD',
            'skills_required' => $job->skills_required ?? [],
            'has_applied' => $authUserId
                ? $job->applications()->where('user_id', $authUserId)->exists()
                : false,
        ];
    });

        return Inertia::render('JobSeeker/RecruiterTimeline', [
            'member' => [
                'id' => $user->id,
                'name' => $fullName,
                
                // 4. RECRUITER PHOTO FIX: Use the 'avatar' column from the users table
                'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                
                'title' => $user->role_title ?? 'Recruiter', 
                'email' => $user->email,
                'about' => $profile->company_description ?? 'No description provided.',
                
                'company' => $profile->company_name ?? 'AVAA Partner',
                'industry' => $profile->industry ?? 'Information Technology',
                'location' => $profile 
                    ? ($profile->city . ($profile->country ? ', ' . $profile->country : '')) 
                    : 'Philippines',
                'company_size' => $profile->company_size ?? 'Unknown',
                'year_established' => $profile->year_established ?? '2010',
                'website' => $profile->company_website ?? null,
            ],
            'postedJobs' => $postedJobs,
            'stats' => [
                'total_posts' => $postedJobs->count(),
                'total_applicants' => 0, 
            ]
        ]);
    }
}