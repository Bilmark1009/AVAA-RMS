<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class EmployeeController extends Controller
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
                    'profile_frame' => $app->user->jobSeekerProfile?->profile_frame ?? 'default',
                    'title' => $app->user->jobSeekerProfile?->professional_title
                        ?? $app->user->jobSeekerProfile?->current_job_title
                        ?? '',
                    'profile' => [
                        'profile_frame' => $app->user->jobSeekerProfile?->profile_frame ?? 'default',
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
}
