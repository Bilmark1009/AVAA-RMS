<?php

namespace App\Notifications;

use App\Models\User;
use App\Models\JobListing;
use App\Models\JobApplication;
use Illuminate\Notifications\Notification;

/**
 * Sent to an Employer when a new application is submitted for their job.
 * All admin/employer in-app notifications default to true (no dedicated in-app employers settings column,
 * so we always dispatch to the database channel for employers).
 */
class NewApplicationNotification extends Notification
{
    public function __construct(
        protected JobApplication $application,
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
        $name = "{$this->applicant->first_name} {$this->applicant->last_name}";
        return [
            'message' => "{$name} applied for your job \"{$this->job->title}\".",
            'job_id' => $this->job->id,
            'link' => route('employer.jobs.applications', $this->job->id),
        ];
    }
}
