<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobPreferencesController extends Controller
{
    public function edit(Request $request): Response
    {
        $profile = $request->user()->jobSeekerProfile;

        return Inertia::render('Settings/JobPreferences', [
            'hasProfile'  => $profile !== null,
            'preferences' => $profile ? [
                // All fields already exist on job_seeker_profiles
                'employment_type_preference' => $profile->employment_type_preference ?? [],
                'desired_job_types'          => $profile->desired_job_types          ?? [],
                'desired_industries'         => $profile->desired_industries          ?? [],
                'expected_salary_min'        => $profile->expected_salary_min,
                'expected_salary_max'        => $profile->expected_salary_max,
                'salary_currency'            => $profile->salary_currency            ?? 'USD',
                'willing_to_relocate'        => $profile->willing_to_relocate        ?? false,
                // Availability fields — add migration below if not yet on table
                'notice_period'              => $profile->notice_period              ?? '',
                'work_style'                 => $profile->work_style                 ?? '',
                'weekly_hours'               => $profile->weekly_hours               ?? '',
            ] : null,
        ]);
    }

    public function update(Request $request)
    {
        $profile = $request->user()->jobSeekerProfile;

        abort_if($profile === null, 403, 'Complete your profile first.');

        $validated = $request->validate([
            'employment_type_preference' => ['array'],
            'desired_job_types'          => ['array'],
            'desired_industries'         => ['array'],
            'expected_salary_min'        => ['nullable', 'numeric', 'min:0'],
            'expected_salary_max'        => ['nullable', 'numeric', 'min:0'],
            'salary_currency'            => ['string', 'size:3'],
            'willing_to_relocate'        => ['boolean'],
            'notice_period'              => ['nullable', 'string', 'max:50'],
            'work_style'                 => ['nullable', 'string', 'max:50'],
            'weekly_hours'               => ['nullable', 'string', 'max:50'],
        ]);

        $profile->update($validated);

        $profile->profile_completeness = $this->calculateProfileCompleteness($profile);
        $profile->save();

        return back();
    }

    private function calculateProfileCompleteness($profile): int
    {
        $checks = [
            !empty($profile->skills),
            !empty($profile->resume_path),
            !empty($profile->state),
            !empty($profile->current_job_title),
            !empty($profile->current_company),
            !empty($profile->field_of_study),
            !empty($profile->institution_name),
            !empty($profile->certifications),
            !empty($profile->portfolio_url),
            !empty($profile->linkedin_url),
            !empty($profile->desired_industries),
            !empty($profile->expected_salary_min),
        ];

        $filled = collect($checks)->filter(fn($v) => $v)->count();

        return (int) round(40 + ($filled / count($checks)) * 60);
    }
}