<?php

namespace App\Notifications;

use App\Models\JobCollaborator;
use App\Models\JobListing;
use App\Models\User;
use Illuminate\Notifications\Notification;

/**
 * Sent to a recruiter when they are invited to collaborate on a job.
 */
class CollaborationInviteNotification extends Notification
{
    public function __construct(
        protected JobCollaborator $collaborator,
        protected JobListing $job,
        protected User $inviter,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $name = "{$this->inviter->first_name} {$this->inviter->last_name}";
        return [
            'message' => "{$name} invited you to collaborate on \"{$this->job->title}\".",
            'job_id'  => $this->job->id,
            'link'    => route('employer.jobs.invitations'),
        ];
    }
}
