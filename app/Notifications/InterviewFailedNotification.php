<?php

namespace App\Notifications;

use App\Models\Interview;
use App\Models\JobListing;
use Illuminate\Notifications\Notification;

/**
 * Sent to a Job Seeker when they fail an interview.
 * Respects: inapp_interview_invites
 */
class InterviewFailedNotification extends Notification
{
    public function __construct(
        protected Interview $interview,
        protected JobListing $job,
    ) {
    }

    public function via(object $notifiable): array
    {
        $settings = $notifiable->notificationSettings;
        $channels = [];
        if ($settings?->inapp_interview_invites ?? true) {
            $channels[] = 'database';
        }
        return $channels ?: ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => "Thank you for interviewing for \"{$this->job->title}\". Unfortunately, you were not selected for this position.",
            'job_id' => $this->job->id,
            'link' => route('job-seeker.jobs.browse'),
        ];
    }
}
