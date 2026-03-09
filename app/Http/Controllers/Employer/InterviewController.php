<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\Interview;
use App\Models\JobListing;
use App\Notifications\InterviewPassedNotification;
use App\Notifications\InterviewFailedNotification;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
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
                    'title' => $i->candidate->jobSeekerProfile?->professional_title
                        ?? $i->candidate->jobSeekerProfile?->current_job_title
                        ?? '',
                ],
                'job' => [
                    'id' => $i->jobListing->id,
                    'title' => $i->jobListing->title,
                ],
            ]);

        // Stats
        $today = now()->toDateString();
        $stats = [
            'todays_total' => $interviews->where('interview_date', $today)->where('status', 'active')->count(),
            'upcoming' => $interviews->where('interview_date', '>=', $today)->where('status', 'active')->count(),
            'pending_feedback' => $interviews->where('interview_date', '<', $today)->where('status', 'active')->count(),
        ];

        return Inertia::render('Employer/Interviews', [
            'interviews' => $interviews->values(),
            'stats' => $stats,
        ]);
    }

    /**
     * Update interview details.
     */
    public function update(Request $request, Interview $interview): RedirectResponse
    {
        $this->authorizeInterview($request, $interview);

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

        return back()->with('success', 'Interview updated.');
    }

    /**
     * Update interview status.
     */
    public function updateStatus(Request $request, Interview $interview): RedirectResponse
    {
        $this->authorizeInterview($request, $interview);

        $request->validate([
            'status' => 'required|in:active,completed,cancelled',
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
