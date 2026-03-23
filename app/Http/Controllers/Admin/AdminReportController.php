<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AccountBanned;
use App\Mail\AccountSuspended;
use App\Models\Report;
use App\Models\User;
use App\Models\JobListing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminReportController extends Controller
{
    /**
     * List all reports with filters for the admin panel.
     * GET /admin/reports
     */
    public function index(Request $request)
    {
        $status = $request->query('status', 'pending');
        $tab    = $request->query('tab', 'messages'); // 'messages' | 'job_posts'

        // Map our DB status to what the frontend knows
        // Frontend uses: pending | approved | decline | appeals
        // DB uses:       pending | reviewed | resolved | dismissed
        $isAppealsFilter = $status === 'appeals';
        $dbStatuses = match ($status) {
            'approved' => ['resolved'],
            'decline'  => ['dismissed'],
            'appeals'  => ['resolved', 'dismissed'], // Appeals can be on approved OR declined reports
            default    => ['pending', 'reviewed'],
        };

        $query = Report::with([
            'reporter',
            'reportedUser',
            'reportedUser.employerProfile',
            'reportedUser.jobSeekerProfile',
            'jobListing',
            'jobListing.employer',
            'jobListing.employer.employerProfile',
            'message',
            'conversation',
            'actionBy',
        ])
        ->whereIn('status', $dbStatuses);

        // For appeals filter, only show reports that have appeals
        if ($isAppealsFilter) {
            $query->whereNotNull('appeal_message')
                  ->whereNotNull('appealed_at');
            // Don't filter by tab when viewing appeals - show appeals from both job posts and messages
        } else {
            // Tab filter: job reports are tied to a job listing; others are user/message reports.
            if ($tab === 'messages') {
                $query->whereNull('job_listing_id');
            } else {
                $query->whereNotNull('job_listing_id');
            }
        }

        $query->orderByDesc('created_at');

        $reports = $query->get()->map(function (Report $r) {
            $jobListing = $r->jobListing;
            $reportedUser = $r->reportedUser;
            $isJobReport = !is_null($r->job_listing_id);

            // Build display names for both job and user/message reports
            $employerName = $jobListing?->employer?->employerProfile?->company_name
                ?? ($jobListing?->employer
                    ? trim(($jobListing->employer->first_name ?? '') . ' ' . ($jobListing->employer->last_name ?? ''))
                    : ($reportedUser?->employerProfile?->company_name
                        ?? ($reportedUser
                            ? trim(($reportedUser->first_name ?? '') . ' ' . ($reportedUser->last_name ?? ''))
                            : 'Unknown')));

            $reporterName = $r->reporter
                ? "{$r->reporter->first_name} {$r->reporter->last_name}"
                : 'Unknown';

            // Map reason enum → human-readable title
            $reasonLabels = [
                'inappropriate_behavior' => 'Inappropriate behavior',
                'spam'                   => 'Spam or automated content',
                'suspicious_job'         => 'Suspicious job offer or scam',
                'identity_theft'         => 'Identity theft or faking profile',
                'other'                  => 'Other concern',
            ];

            // Evidence: convert stored paths to public URLs
            $evidenceUrls = collect($r->evidence ?? [])->map(
                fn ($path) => Storage::url($path)
            )->values()->all();

            $activeJobsCount = $jobListing?->employer_id
                ? \App\Models\JobListing::where('employer_id', $jobListing->employer_id)
                    ->where('status', 'active')
                    ->count()
                : 0;

            $baseCountQuery = Report::query();
            $hasCountTarget = false;

            if ($isJobReport && $r->job_listing_id) {
                $baseCountQuery->where('job_listing_id', $r->job_listing_id);
                $hasCountTarget = true;
            } elseif (!$isJobReport && $r->reported_user_id) {
                $baseCountQuery->where('reported_user_id', $r->reported_user_id);
                $hasCountTarget = true;
            }

            $previousResolvedCount = $hasCountTarget
                ? (clone $baseCountQuery)
                    ->whereIn('status', ['resolved'])
                    ->where('id', '<>', $r->id)
                    ->count()
                : 0;

            $totalReportsCount = $hasCountTarget
                ? (clone $baseCountQuery)->count()
                : 0;

            return [
                'id'                    => $r->id,
                'job_title'             => $isJobReport ? ($jobListing?->title ?? 'Unknown') : $employerName,
                'company'               => $isJobReport
                    ? ($jobListing?->company_name
                        ?? $jobListing?->employer?->employerProfile?->company_name
                        ?? 'N/A')
                    : ($reportedUser?->employerProfile?->company_name ?? 'N/A'),
                'location'              => $isJobReport ? ($jobListing?->location ?? 'N/A') : 'N/A',
                'reason_title'          => $reasonLabels[$r->reason] ?? $r->reason,
                'reason_description'    => $r->details ?? $r->description ?? '',
                'reported_by'           => $reporterName,
                'reported_at'           => $r->created_at->diffForHumans(),
                'active_jobs_count'     => $activeJobsCount,
                'previous_reports_count'=> $previousResolvedCount,
                'report_count_total'    => $totalReportsCount,
                'type'                  => $isJobReport ? 'job' : 'message',
                'employer_name'         => $employerName,
                'is_high_priority'      => $previousResolvedCount >= 2,
                'evidence'              => $evidenceUrls,
                'message_content'       => $r->message?->content ?? null,
                'status'                => $r->status,
                'action_taken'          => $r->action_taken,
                'employer_status'       => $this->resolveEmployerStatus($r),
                'approved_by'           => $r->status === 'resolved' && $r->actionBy
                    ? "{$r->actionBy->first_name} {$r->actionBy->last_name}"
                    : null,
                'approved_date'         => $r->status === 'resolved' && $r->action_at
                    ? $r->action_at->diffForHumans()
                    : null,
                'declined_by'           => $r->status === 'dismissed' && $r->actionBy
                    ? "{$r->actionBy->first_name} {$r->actionBy->last_name}"
                    : null,
                'declined_date'         => $r->status === 'dismissed' && $r->action_at
                    ? $r->action_at->diffForHumans()
                    : null,
                'appeal_message'        => $r->appeal_message,
                'appeal_status'         => $r->appeal_status,
                'appealed_at'           => $r->appealed_at?->diffForHumans(),
                'appeal_decision_note'  => $r->appeal_decision_note,
            ];
        });

        return Inertia::render('Admin/ReportView', [
            'reports' => $reports,
            'filters' => [
                'status' => $status,
                'tab'    => $tab,
            ],
        ]);
    }

    /**
     * Approve (resolve) a report.
     * PATCH /admin/reports/{report}/approve
     */
    public function approve(Request $request, Report $report)
    {
        $request->validate([
            'action_note' => 'nullable|string|max:500',
        ]);

        $report->update([
            'status' => 'resolved',
            'action_taken' => $request->action_note ?? 'Approved',
            'action_by' => $request->user()->id,
            'action_at' => now(),
            'action_note' => $request->action_note,
        ]);

        // Auto-ban check: if employer has 5+ distinct jobs with approved reports
        $this->checkAndAutoBanEmployer($report);

        return redirect()->back()->with('success', 'Report approved and marked as resolved.');
    }

    /**
     * Decline (dismiss) a report.
     * PATCH /admin/reports/{report}/decline
     */
    public function decline(Request $request, Report $report)
    {
        $request->validate([
            'decline_reason' => 'nullable|string|max:500',
        ]);

        $report->update([
            'status' => 'dismissed',
            'action_taken' => 'Declined',
            'action_by' => $request->user()->id,
            'action_at' => now(),
            'action_note' => $request->decline_reason,
        ]);

        return redirect()->back()->with('success', 'Report declined and dismissed.');
    }

    /**
     * Suspend an employer/user account.
     * PATCH /admin/reports/{report}/suspend
     */
    public function suspend(Request $request, Report $report)
    {
        $request->validate([
            'action_note' => 'nullable|string|max:500',
        ]);

        // Get the reported job if this is a job report
        $job = $report->jobListing;
        if (!$job) {
            return redirect()->back()->with('error', 'This report is not for a job posting.');
        }

        // Only deactivate the specific reported job
        $job->update([
            'status' => 'inactive',
            'updated_at' => now(),
        ]);

        // Get the employer for notification
        $user = $job->employer;
        if (!$user) {
            return redirect()->back()->with('error', 'Employer not found.');
        }

        // Extract duration from action_note (e.g., "Suspended for 7 Days")
        $duration = '7 Days';
        if ($request->action_note) {
            preg_match('/(\d+\s+Days?)/', $request->action_note, $matches);
            if ($matches) {
                $duration = $matches[0];
            }
        }

        // Update report
        $report->update([
            'status' => 'resolved',
            'action_taken' => 'Suspended',
            'action_by' => $request->user()->id,
            'action_at' => now(),
            'action_note' => $request->action_note,
        ]);

        // Auto-ban check: if employer has 5+ distinct jobs with approved reports
        $autoBanned = $this->checkAndAutoBanEmployer($report);

        // Send suspension email
        try {
            Mail::to($user->email)->send(new AccountSuspended(
                user: $user,
                report: $report,
                activeJobsCount: 1,  // Only this one job was suspended
                reportReason: $report->reason_title ?? 'Policy Violation',
                duration: $duration
            ));
        } catch (\Exception $e) {
            // Log but don't fail the request if email fails
            \Log::error('Failed to send suspension email: ' . $e->getMessage());
        }

        $message = 'Job posting suspended successfully. Notification sent to employer.';
        if ($autoBanned) {
            $message .= ' Employer has been automatically BANNED due to 5+ approved job reports.';
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Ban an employer/user account.
     * PATCH /admin/reports/{report}/ban
     */
    public function ban(Request $request, Report $report)
    {
        $request->validate([
            'action_note' => 'nullable|string|max:500',
        ]);

        // Get the reported job if this is a job report
        $job = $report->jobListing;
        if (!$job) {
            return redirect()->back()->with('error', 'This report is not for a job posting.');
        }

        // Only deactivate the specific reported job
        $job->update([
            'status' => 'inactive',
            'updated_at' => now(),
        ]);

        // Get the employer for notification
        $user = $job->employer;
        if (!$user) {
            return redirect()->back()->with('error', 'Employer not found.');
        }

        // Update report
        $report->update([
            'status' => 'resolved',
            'action_taken' => 'Banned',
            'action_by' => $request->user()->id,
            'action_at' => now(),
            'action_note' => $request->action_note,
        ]);

        // Send ban email
        try {
            Mail::to($user->email)->send(new AccountBanned(
                user: $user,
                report: $report,
                activeJobsCount: 1,  // Only this one job was banned
                reportReason: $report->reason_title ?? 'Policy Violation'
            ));
        } catch (\Exception $e) {
            // Log but don't fail the request if email fails
            \Log::error('Failed to send ban email: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Job posting permanently removed successfully. Notification sent to employer.');
    }

    /**
     * Approve an appeal - removes suspension/ban and restores the job posting.
     * PATCH /admin/appeals/{report}/approve
     */
    public function approveAppeal(Request $request, Report $report)
    {
        // Verify the report has an appeal
        if (!$report->appeal_message || !$report->appealed_at) {
            return redirect()->back()->with('error', 'This report does not have a pending appeal.');
        }

        // Only allow approving pending appeals
        if ($report->appeal_status !== 'pending') {
            return redirect()->back()->with('error', 'This appeal has already been processed.');
        }

        $jobListing = $report->jobListing;

        // Update the appeal status
        $report->update([
            'appeal_status' => 'approved',
            'appeal_decision_note' => $request->input('decision_note', 'Appeal approved - suspension/ban lifted.'),
        ]);

        // If there's a job listing, restore it to active status
        if ($jobListing) {
            $jobListing->update([
                'status' => 'active',
                'updated_at' => now(),
            ]);

            // Dismiss ALL resolved reports for this employer's jobs — resets report count to zero
            $employerId = $jobListing->employer_id;
            if ($employerId) {
                Report::whereHas('jobListing', fn($q) => $q->where('employer_id', $employerId))
                    ->where('status', 'resolved')
                    ->update(['status' => 'dismissed']);
            }

            // If the employer was auto-banned, lift the ban since report count is now reset
            $employer = $jobListing->employer;
            if ($employer && $employer->status === 'banned') {
                $employer->update(['status' => 'active']);
            }
        }

        // Send notification email to employer
        try {
            $employer = $jobListing?->employer;
            if ($employer) {
                \Illuminate\Support\Facades\Mail::to($employer->email)->send(
                    new \App\Mail\AppealApprovedNotification($jobListing, $employer, $report)
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send appeal approval email', ['exception' => $e->getMessage()]);
        }

        return redirect()->back()->with('success', 'Appeal approved! Job posting has been restored.');
    }

    /**
     * Reject an appeal - keeps the suspension/ban in place.
     * PATCH /admin/appeals/{report}/reject
     */
    public function rejectAppeal(Request $request, Report $report)
    {
        // Verify the report has an appeal
        if (!$report->appeal_message || !$report->appealed_at) {
            return redirect()->back()->with('error', 'This report does not have a pending appeal.');
        }

        // Only allow rejecting pending appeals
        if ($report->appeal_status !== 'pending') {
            return redirect()->back()->with('error', 'This appeal has already been processed.');
        }

        // Update the appeal status
        $report->update([
            'appeal_status' => 'rejected',
            'appeal_decision_note' => $request->input('decision_note', 'Appeal declined - original action remains in effect.'),
        ]);

        // Send notification email to employer
        try {
            $employer = $report->jobListing?->employer;
            if ($employer) {
                \Illuminate\Support\Facades\Mail::to($employer->email)->send(
                    new \App\Mail\AppealRejectedNotification($report->jobListing, $employer, $report)
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send appeal rejection email', ['exception' => $e->getMessage()]);
        }

        return redirect()->back()->with('success', 'Appeal declined. The original action remains in effect.');
    }

    /* ══════════════════════════════════════════════════════════════════════
       Private helpers
    ══════════════════════════════════════════════════════════════════════ */

    /**
     * Check if an employer has 5+ distinct jobs with approved (resolved) reports.
     * If so, auto-ban the employer account.
     *
     * @return bool Whether an auto-ban was triggered.
     */
    private function checkAndAutoBanEmployer(Report $report): bool
    {
        // Determine the employer user from job report
        $employerId = $report->jobListing?->employer_id;
        if (!$employerId) {
            return false;
        }

        $employer = User::find($employerId);
        if (!$employer || $employer->status === 'banned') {
            return false;
        }

        // Count distinct job listings that have resolved reports for this employer
        $distinctResolvedJobCount = Report::whereHas('jobListing', fn($q) => $q->where('employer_id', $employerId))
            ->where('status', 'resolved')
            ->distinct('job_listing_id')
            ->count('job_listing_id');

        if ($distinctResolvedJobCount >= 5) {
            $employer->update(['status' => 'banned']);

            // Deactivate all remaining active jobs
            JobListing::where('employer_id', $employerId)
                ->where('status', 'active')
                ->update(['status' => 'inactive']);

            // Send ban notification email
            try {
                Mail::to($employer->email)->send(new AccountBanned(
                    user: $employer,
                    report: $report,
                    activeJobsCount: 0,
                    reportReason: 'Multiple policy violations (5+ approved reports on different job postings)'
                ));
            } catch (\Exception $e) {
                \Log::error('Failed to send auto-ban email: ' . $e->getMessage());
            }

            return true;
        }

        return false;
    }

    /**
     * Resolve the actual employer status for a report entry.
     */
    private function resolveEmployerStatus(Report $r): string
    {
        $user = $r->jobListing?->employer ?? $r->reportedUser;
        if (!$user) {
            return 'Unknown';
        }

        return match ($user->status) {
            'banned'    => 'Banned',
            'suspended' => 'Suspended',
            default     => 'Active',
        };
    }
}