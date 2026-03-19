<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
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
        // Frontend uses: pending | approved | decline
        // DB uses:       pending | reviewed | resolved | dismissed
        $dbStatuses = match ($status) {
            'approved' => ['resolved'],
            'decline'  => ['dismissed'],
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
        ->whereIn('status', $dbStatuses)
        ->orderByDesc('created_at');

        // Tab filter: job reports are tied to a job listing; others are user/message reports.
        if ($tab === 'messages') {
            $query->whereNull('job_listing_id');
        } else {
            $query->whereNotNull('job_listing_id');
        }

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
                'employer_status'       => 'Active',
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
}