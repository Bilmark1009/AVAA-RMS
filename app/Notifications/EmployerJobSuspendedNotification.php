<?php

namespace App\Notifications;

use App\Models\JobListing;
use App\Models\Report;
use Illuminate\Notifications\Notification;

/**
 * Sent to employers when one of their job postings is suspended by admin.
 */
class EmployerJobSuspendedNotification extends Notification
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
            'message' => "Job suspended: \"{$this->job->title}\". Submit an appeal to request review.",
            'job_id' => $this->job->id,
            'report_id' => $this->report->id,
            'link' => route('employer.jobs.index', [
                'open_appeal' => 1,
                'job_id' => $this->job->id,
                'report_id' => $this->report->id,
            ]),
        ];
    }
}
