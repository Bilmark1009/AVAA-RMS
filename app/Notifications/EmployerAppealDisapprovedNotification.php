<?php

namespace App\Notifications;

use App\Models\JobListing;
use App\Models\Report;
use Illuminate\Notifications\Notification;

/**
 * Sent to employer when appeal decision is not approved.
 */
class EmployerAppealDisapprovedNotification extends Notification
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
            'message' => 'Your appeal for the suspended job post was not approved. The job will remain suspended. For more details, please check your email or contact support.',
            'job_id' => $this->job->id,
            'report_id' => $this->report->id,
            'link' => route('employer.jobs.index'),
        ];
    }
}
