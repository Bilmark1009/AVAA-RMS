<?php

namespace App\Notifications;

use App\Models\Interview;
use App\Models\JobListing;
use Illuminate\Notifications\Notification;

/**
 * Sent to a Job Seeker when an interview is scheduled.
 * Respects: inapp_interview_invites
 */
class InterviewScheduledNotification extends Notification
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
        $date = \Carbon\Carbon::parse($this->interview->interview_date)->format('M j, Y');
        return [
            'message' => "You have been invited for a {$this->interview->interview_type} interview for \"{$this->job->title}\" on {$date}.",
            'job_id' => $this->job->id,
            'link' => route('job-seeker.jobs.browse'),
        ];
    }
}
