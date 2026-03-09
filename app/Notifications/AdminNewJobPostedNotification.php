<?php

namespace App\Notifications;

use App\Models\JobListing;
use App\Models\User;
use Illuminate\Notifications\Notification;

/**
 * Sent to the Admin when a new job is posted.
 * Respects: admin_new_job_posted
 */
class AdminNewJobPostedNotification extends Notification
{
    public function __construct(
        protected JobListing $job,
        protected User $employer,
    ) {
    }

    public function via(object $notifiable): array
    {
        $settings = $notifiable->notificationSettings;
        if ($settings?->admin_new_job_posted ?? true) {
            return ['database'];
        }
        return [];
    }

    public function toArray(object $notifiable): array
    {
        $company = $this->employer->employerProfile?->company_name
            ?? "{$this->employer->first_name} {$this->employer->last_name}";
        return [
            'message' => "New job posted: \"{$this->job->title}\" by {$company}.",
            'job_id' => $this->job->id,
            'link' => route('admin.jobs.show', $this->job->id),
        ];
    }
}
