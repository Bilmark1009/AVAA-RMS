<?php

namespace App\Notifications;

use App\Models\JobApplication;
use App\Models\JobListing;
use Illuminate\Notifications\Notification;

/**
 * Sent to a Job Seeker when their application is rejected.
 * Respects: inapp_application_status
 */
class ApplicationRejectedNotification extends Notification
{
    public function __construct(
        protected JobApplication $application,
        protected JobListing $job,
    ) {
    }

    public function via(object $notifiable): array
    {
        $settings = $notifiable->notificationSettings;
        $channels = [];
        if ($settings?->inapp_application_status ?? true) {
            $channels[] = 'database';
        }
        return $channels ?: ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $companyOrJob = $this->job->company_name ?: $this->job->title;

        return [
            'message' => "Your application for \"{$companyOrJob}\" has been rejected.",
            'job_id' => $this->job->id,
            'link' => route('job-seeker.jobs.browse'),
        ];
    }
}
