<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/**
 * Sent to a Job Seeker when an employer deletes a job they applied for.
 * Respects: inapp_application_status
 */
class JobDeletedByEmployerNotification extends Notification
{
    public function __construct(
        protected string $jobTitle,
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
            'message' => "Sorry, the job '{$this->jobTitle}' you applied for has been deleted by the employer. If you have any questions, please message the employer directly.",
            'job_title' => $this->jobTitle,
            'link' => route('job-seeker.applications.index'),
        ];
    }
}
