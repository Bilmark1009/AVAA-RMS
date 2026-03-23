<?php

namespace App\Notifications;

use App\Models\JobListing;
use App\Models\Report;
use Illuminate\Notifications\Notification;

/**
 * Sent to employer when appeal decision is approved.
 */
class EmployerAppealApprovedNotification extends Notification
{
    public function __construct(
        protected JobListing $job,
        protected Report $report,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Your appeal for the suspended job post has been approved. Your job is now active and visible to other users.',
            'job_id' => $this->job->id,
            'report_id' => $this->report->id,
            'link' => route('employer.jobs.index'),
        ];
    }
}
