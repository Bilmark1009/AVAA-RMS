<?php

namespace App\Notifications;

use App\Models\JobListing;
use Illuminate\Notifications\Notification;

/**
 * Sent to a Job Seeker when they withdraw their own application.
 * Respects: inapp_application_status
 */
class ApplicationWithdrawnByApplicantNotification extends Notification
{
    public function __construct(
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
        return [
            'message' => "You have withdrawn your application to {$this->job->title}.",
            'job_id' => $this->job->id,
            'link' => route('job-seeker.applications.index'),
        ];
    }
}
