<?php

namespace App\Http\Controllers\JobSeeker;

use App\Http\Controllers\Controller;
use App\Models\UserDocument;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the job seeker's read-only profile view.
     */
    public function show(Request $request): Response
    {
        $user = $request->user()->load(['jobSeekerProfile', 'workExperiences']);

        return Inertia::render('JobSeeker/Profile', [
            'user' => $user,
            'profile' => $user->jobSeekerProfile,
            'experiences' => $user->workExperiences,
        ]);
    }

    /**
     * Show the job seeker's profile edit page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load(['jobSeekerProfile', 'workExperiences']);

        return Inertia::render('JobSeeker/ProfileEdit', [
            'user' => $user,
            'profile' => $user->jobSeekerProfile,
            'experiences' => $user->workExperiences,
        ]);
    }

    /**
     * Initial onboarding — creates the profile for the first time.
     */
    public function complete(Request $request): RedirectResponse
    {
        $request->validate([
            'professional_title' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'years_of_experience' => 'required|string',
            'state' => 'nullable|string|max:100',
            'skills' => 'nullable|array',
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $user = $request->user();

        $resumePath = null;
        if ($request->hasFile('resume')) {
            $file = $request->file('resume');
            $resumePath = $this->storeWithOriginalName($file, "resumes/{$user->id}", 'local', 'resume');

            // Also create a user_documents entry so it shows in Settings > Documents
            $user->documents()->create([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $resumePath,
                'file_type' => strtolower($file->getClientOriginalExtension()),
                'file_size' => $file->getSize(),
                'document_type' => 'CV / Resume',
            ]);
        }

        $completeness = $this->calculateCompleteness($request, $resumePath);

        $user->jobSeekerProfile()->create([
            'professional_title' => $request->professional_title,
            'city' => $request->city,
            'state' => $request->state,
            'country' => $request->country,
            'years_of_experience' => $request->years_of_experience,
            'skills' => $request->skills ?? [],
            'resume_path' => $resumePath,
            'profile_completeness' => $completeness,
        ]);

        $user->update(['profile_completed' => true]);

        return back()->with('success', 'Profile completed successfully!');
    }

    /**
     * Update an existing profile from the profile edit page.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'about' => 'nullable|string|max:2000',
            'professional_title' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'years_of_experience' => 'required|string',
            'state' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:30',
            'skills' => 'nullable|array',
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'current_job_title' => 'nullable|string|max:255',
            'current_company' => 'nullable|string|max:255',
            'highest_education' => 'nullable|string',
            'field_of_study' => 'nullable|string|max:255',
            'institution_name' => 'nullable|string|max:255',
            'certifications' => 'nullable|array',
            'portfolio_url' => 'nullable|string|max:255',
            'linkedin_url' => 'nullable|string|max:255',
            'employment_type_preference' => 'nullable|array',
            'desired_job_types' => 'nullable|array',
            'desired_industries' => 'nullable|array',
            'expected_salary_min' => 'nullable|numeric|min:0',
            'expected_salary_max' => 'nullable|numeric|min:0',
            'salary_currency' => 'nullable|string|size:3',
            'willing_to_relocate' => 'nullable',
            'profile_visibility' => 'nullable|in:public,private',
        ]);

        $user = $request->user();
        $profile = $user->jobSeekerProfile;

        // Save phone to users table if provided
        if ($request->filled('phone')) {
            $user->update(['phone' => $request->phone]);
        }

        // Keep existing resume unless a new one is uploaded
        $resumePath = $profile->resume_path;
        if ($request->hasFile('resume')) {
            $resumePath = $this->storeWithOriginalName($request->file('resume'), "resumes/{$user->id}", 'local', 'resume');
        }

        $completeness = $this->calculateCompleteness($request, $resumePath);

        $profile->update([
            'about' => $request->about,
            'professional_title' => $request->professional_title,
            'city' => $request->city,
            'state' => $request->state,
            'country' => $request->country,
            'current_job_title' => $request->current_job_title,
            'current_company' => $request->current_company,
            'years_of_experience' => $request->years_of_experience,
            'employment_type_preference' => $request->employment_type_preference ?? [],
            'highest_education' => $request->highest_education ?? '',
            'field_of_study' => $request->field_of_study,
            'institution_name' => $request->institution_name,
            'skills' => $request->skills ?? [],
            'certifications' => $request->certifications ?? [],
            'resume_path' => $resumePath,
            'portfolio_url' => $request->portfolio_url,
            'linkedin_url' => $request->linkedin_url,
            'desired_job_types' => $request->desired_job_types ?? [],
            'desired_industries' => $request->desired_industries ?? [],
            'expected_salary_min' => $request->expected_salary_min,
            'expected_salary_max' => $request->expected_salary_max,
            'salary_currency' => $request->salary_currency ?? 'USD',
            'willing_to_relocate' => filter_var($request->willing_to_relocate, FILTER_VALIDATE_BOOLEAN),
            'profile_visibility' => $request->profile_visibility ?? 'public',
            'profile_completeness' => $completeness,
        ]);

        return redirect()->route('job-seeker.profile.show')->with('success', 'Profile updated successfully!');
    }

    /**
     * Shared completeness calculation — 40% base + up to 60% from optional fields.
     */
    private function calculateCompleteness(Request $request, ?string $resumePath): int
    {
        $checks = [
            !empty($request->skills),
            !empty($resumePath),
            !empty($request->state),
            !empty($request->current_job_title),
            !empty($request->current_company),
            !empty($request->field_of_study),
            !empty($request->institution_name),
            !empty($request->certifications),
            !empty($request->portfolio_url),
            !empty($request->linkedin_url),
            !empty($request->desired_industries),
            !empty($request->expected_salary_min),
        ];

        $filled = collect($checks)->filter(fn($v) => $v)->count();
        return (int) round(40 + ($filled / count($checks)) * 60);
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
}