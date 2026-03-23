<?php

namespace App\Notifications;

use App\Models\JobListing;
use App\Models\Report;
use App\Models\User;
use Illuminate\Notifications\Notification;

/**
 * Sent to admins when an employer submits an appeal for a suspended job.
 */
class AdminAppealSubmittedNotification extends Notification
{
    public function __construct(
        protected JobListing $job,
        protected User $employer,
        protected Report $report,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $name = trim("{$this->employer->first_name} {$this->employer->last_name}");

        return [
            'message' => "Appeal submitted for \"{$this->job->title}\" by {$name}.",
            'job_id' => $this->job->id,
            'report_id' => $this->report->id,
            'link' => route('admin.reports.index', [
                'status' => 'appeals',
                'tab' => 'job_posts',
                'report' => $this->report->id,
            ]),
        ];
    }
}
