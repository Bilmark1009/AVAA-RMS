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
            'message',
            'conversation',
            'actionBy',
        ])
        ->whereIn('status', $dbStatuses)
        ->orderByDesc('created_at');

        // Tab filter: message reports have a conversation_id; job_posts reports have neither
        if ($tab === 'messages') {
            $query->whereNotNull('conversation_id');
        } else {
            $query->whereNull('conversation_id');
        }

        $reports = $query->get()->map(function (Report $r) {
            // Build the reporter name
            $reportedUser = $r->reportedUser;
            $employerName = $reportedUser?->employerProfile?->company_name
                ?? ($reportedUser ? "{$reportedUser->first_name} {$reportedUser->last_name}" : 'Unknown');

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

            return [
                'id'                    => $r->id,
                'job_title'             => $employerName,
                'company'               => $reportedUser?->employerProfile?->company_name ?? 'N/A',
                'location'              => '',
                'reason_title'          => $reasonLabels[$r->reason] ?? $r->reason,
                'reason_description'    => $r->details ?? '',
                'reported_by'           => $reporterName,
                'reported_at'           => $r->created_at->diffForHumans(),
                'active_jobs_count'     => 0,
                'previous_reports_count'=> Report::where('reported_user_id', $r->reported_user_id)
                    ->whereIn('status', ['resolved'])
                    ->where('id', '<>', $r->id)
                    ->count(),
                'report_count_total'    => Report::where('reported_user_id', $r->reported_user_id)->count(),
                'type'                  => $r->conversation_id ? 'message' : 'job',
                'employer_name'         => $employerName,
                'is_high_priority'      => Report::where('reported_user_id', $r->reported_user_id)
                    ->whereIn('status', ['resolved'])
                    ->count() >= 2,
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