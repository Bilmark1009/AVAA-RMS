<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Mail\InterviewRescheduled;
use App\Mail\InterviewScheduled;
use App\Models\Interview;
use App\Models\JobListing;
use App\Models\JobApplication;
use App\Notifications\InterviewScheduledNotification;
use App\Notifications\InterviewPassedNotification;
use App\Notifications\InterviewFailedNotification;
use App\Notifications\InterviewRescheduledNotification;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class InterviewController extends Controller
{
    /**
     * List all interviews for the employer's jobs.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get all job IDs owned by this employer
        $jobIds = JobListing::where('employer_id', $user->id)->pluck('id');

        $interviews = Interview::whereIn('job_listing_id', $jobIds)
            ->with(['candidate', 'jobListing', 'jobApplication'])
            ->orderByDesc('interview_date')
            ->get()
            ->map(fn($i) => [
                'id' => $i->id,
                'interviewer_name' => $i->interviewer_name,
                'interview_date' => $i->interview_date->toDateString(),
                'interview_time' => $i->interview_time,
                'interview_type' => $i->interview_type,
                'location_or_link' => $i->location_or_link,
                'notes' => $i->notes,
                'status' => $i->status,
                'candidate' => [
                    'id' => $i->candidate->id,
                    'first_name' => $i->candidate->first_name,
                    'last_name' => $i->candidate->last_name,
                    'email' => $i->candidate->email,
                    'avatar' => $i->candidate->avatar,
                    'profile_frame' => $i->candidate->jobSeekerProfile?->profile_frame ?? 'default',
                    'title' => $i->candidate->jobSeekerProfile?->professional_title
                        ?? $i->candidate->jobSeekerProfile?->current_job_title
                        ?? '',
                ],
                'job' => [
                    'id' => $i->jobListing->id,
                    'title' => $i->jobListing->title,
                ],
            ]);

        // Get approved applications without interviews
        $pendingApplications = JobApplication::whereIn('job_listing_id', $jobIds)
            ->where('status', 'pending')
            ->with(['user', 'jobListing'])
            ->get()
            ->map(fn($app) => [
                'id' => $app->id,
                'candidate' => [
                    'id' => $app->user->id,
                    'first_name' => $app->user->first_name,
                    'last_name' => $app->user->last_name,
                    'email' => $app->user->email,
                    'avatar' => $app->user->avatar,
                    'profile_frame' => $app->user->jobSeekerProfile?->profile_frame ?? 'default',
                    'title' => $app->user->jobSeekerProfile?->professional_title
                        ?? $app->user->jobSeekerProfile?->current_job_title
                        ?? '',
                ],
                'job' => [
                    'id' => $app->jobListing->id,
                    'title' => $app->jobListing->title,
                ],
                'applied_at' => $app->created_at->toDateString(),
                'cover_letter' => $app->cover_letter,
            ]);

        // Stats
        $today = now()->toDateString();
        $stats = [
            'todays_total' => $interviews
                ->where('interview_date', $today)
                ->whereIn('status', ['active', 'rescheduled'])
                ->count(),
            'upcoming' => $interviews
                ->where('interview_date', '>=', $today)
                ->whereIn('status', ['active', 'rescheduled'])
                ->count(),
            'pending_applications' => $pendingApplications->count(),
        ];

        return Inertia::render('Employer/Interviews', [
            'interviews' => $interviews->values(),
            'pendingApplications' => $pendingApplications->values(),
            'stats' => $stats,
        ]);
    }

    /**
     * Create a new interview for an approved application.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'job_application_id' => 'required|exists:job_applications,id',
            'interview_date' => 'required|date|after_or_equal:today',
            'interview_time' => 'required|string',
            'interview_type' => 'required|in:Online Interview,In-Person,Phone',
            'interviewer_name' => 'required|string|max:255',
            'location_or_link' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:2000',
        ]);

        $application = JobApplication::with(['jobListing', 'user'])->findOrFail($request->job_application_id);

        // Ensure the employer owns this job
        abort_if($application->jobListing->employer_id !== $request->user()->id, 403, 'Unauthorized.');

        // If application is pending, approve it first
        if ($application->status === 'pending') {
            $application->update(['status' => 'approved']);
        }

        // Ensure application is approved and has no interview
        abort_if($application->status !== 'approved', 422, 'Application must be approved first.');
        abort_if($application->interview()->exists(), 422, 'Interview already exists for this application.');

        $interview = Interview::create([
            'job_application_id' => $application->id,
            'job_listing_id' => $application->job_listing_id,
            'candidate_id' => $application->user_id,
            'employer_id' => $request->user()->id,
            'interviewer_name' => $request->interviewer_name,
            'interview_date' => $request->interview_date,
            'interview_time' => $request->interview_time,
            'interview_type' => $request->interview_type,
            'location_or_link' => $request->location_or_link,
            'notes' => $request->notes,
            'status' => 'active',
        ]);

        // Send email notification
        $candidateName = trim(($application->user->first_name ?? '') . ' ' . ($application->user->last_name ?? ''));
        Mail::to($application->user->email)->send(new \App\Mail\InterviewScheduled($interview, $application->jobListing, $candidateName));

        // In-app notification
        $application->user->notify(new InterviewScheduledNotification($interview, $application->jobListing));

        return back()->with('success', 'Application approved and interview scheduled successfully.');
    }

    /**
     * Update interview details.
     */
    public function update(Request $request, Interview $interview): RedirectResponse
    {
        $this->authorizeInterview($request, $interview);

        $originalSchedule = [
            'interview_date' => optional($interview->interview_date)?->toDateString(),
            'interview_time' => $interview->interview_time,
            'interview_type' => $interview->interview_type,
            'location_or_link' => $interview->location_or_link,
        ];
        $originalStatus = $interview->status;

        $request->validate([
            'interview_date' => 'required|date',
            'interview_time' => 'required|string',
            'interview_type' => 'required|in:Online Interview,In-Person,Phone',
            'interviewer_name' => 'required|string|max:255',
            'location_or_link' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:2000',
        ]);

        $interview->update($request->only([
            'interview_date',
            'interview_time',
            'interview_type',
            'interviewer_name',
            'location_or_link',
            'notes',
        ]));

        $wasRescheduled = $originalSchedule['interview_date'] !== optional($interview->interview_date)?->toDateString()
            || $originalSchedule['interview_time'] !== $interview->interview_time
            || $originalSchedule['interview_type'] !== $interview->interview_type
            || $originalSchedule['location_or_link'] !== $interview->location_or_link;

        if ($wasRescheduled) {
            // Mark as rescheduled so cancelled interviews clearly reflect the new schedule state.
            $interview->update(['status' => 'rescheduled']);

            $interview->loadMissing(['candidate', 'jobListing']);
            $candidate = $interview->candidate;
            $job = $interview->jobListing;

            $candidateName = trim(($candidate->first_name ?? '') . ' ' . ($candidate->last_name ?? ''));

            Mail::to($candidate->email)->send(new InterviewRescheduled($interview, $job, $candidateName));
            $candidate->notify(new InterviewRescheduledNotification($interview, $job));

            return back()->with('success', $originalStatus === 'cancelled'
                ? 'Interview rescheduled from cancelled status and applicant notified.'
                : 'Interview rescheduled and applicant notified.');
        }

        return back()->with('success', 'Interview updated.');
    }

    /**
     * Update interview status.
     */
    public function updateStatus(Request $request, Interview $interview): RedirectResponse
    {
        $this->authorizeInterview($request, $interview);

        $request->validate([
            'status' => 'required|in:active,rescheduled,completed,cancelled',
        ]);

        $interview->update(['status' => $request->status]);

        return back()->with('success', 'Interview status updated.');
    }

    /**
     * Mark interview as passed.
     */
    public function passInterview(Request $request, Interview $interview): RedirectResponse
    {
        $this->authorizeInterview($request, $interview);

        $interview->update([
            'status' => 'completed',
            'interview_result' => 'passed'
        ]);

        $application = $interview->jobApplication;
        $application->update([
            'status' => 'hired',
            'hired_at' => now()
        ]);

        \Illuminate\Support\Facades\Mail::to($interview->candidate->email)
            ->queue(new \App\Mail\InterviewPassed($application, $interview->jobListing));

        // In-app notification
        $interview->candidate->notify(new InterviewPassedNotification($interview, $interview->jobListing));

        return back()->with('success', 'Applicant marked as passed and hired.');
    }

    /**
     * Mark interview as failed.
     */
    public function failInterview(Request $request, Interview $interview): RedirectResponse
    {
        $this->authorizeInterview($request, $interview);

        $interview->update([
            'status' => 'completed',
            'interview_result' => 'failed'
        ]);

        $application = $interview->jobApplication;
        $application->update([
            'status' => 'rejected'
        ]);

        \Illuminate\Support\Facades\Mail::to($interview->candidate->email)
            ->queue(new \App\Mail\InterviewFailed($application, $interview->jobListing));

        // In-app notification
        $interview->candidate->notify(new InterviewFailedNotification($interview, $interview->jobListing));

        return back()->with('success', 'Applicant marked as failed.');
    }

    /* ── Private helpers ── */

    private function authorizeInterview(Request $request, Interview $interview): void
    {
        abort_if($interview->employer_id !== $request->user()->id, 403, 'Unauthorized.');
    }
}
