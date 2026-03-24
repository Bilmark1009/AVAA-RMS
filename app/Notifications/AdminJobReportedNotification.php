<?php

namespace App\Notifications;

use App\Models\JobListing;
use App\Models\Report;
use Illuminate\Notifications\Notification;

/**
 * Sent to admins when a job is reported by a user.
 */
class AdminJobReportedNotification extends Notification
{
    public function __construct(
        protected Report $report,
        protected JobListing $job,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => "Job reported: \"{$this->job->title}\" needs review.",
            'job_id' => $this->job->id,
            'report_id' => $this->report->id,
            'link' => route('admin.reports.index', [
                'status' => 'pending',
                'tab' => 'job_posts',
                'report' => $this->report->id,
            ]),
        ];
    }
}
