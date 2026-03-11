<?php

namespace App\Notifications;

use App\Models\JobListing;
use App\Models\User;
use Illuminate\Notifications\Notification;

/**
 * Sent to an Employer when an applicant withdraws an application.
 */
class ApplicantWithdrewApplicationNotification extends Notification
{
    public function __construct(
        protected JobListing $job,
        protected User $applicant,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $name = trim("{$this->applicant->first_name} {$this->applicant->last_name}");

        return [
            'message' => "{$name} has withdrawn their application to {$this->job->title}.",
            'job_id' => $this->job->id,
            'link' => route('employer.jobs.applications', $this->job->id),
        ];
    }
}
