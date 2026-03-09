<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Notification;

/**
 * Sent to the Admin when an employer requests verification.
 * This always goes to the database (admin verification page link).
 */
class AdminEmployerVerificationRequestedNotification extends Notification
{
    public function __construct(
        protected User $employer,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $company = $this->employer->employerProfile?->company_name
            ?? "{$this->employer->first_name} {$this->employer->last_name}";
        return [
            'message' => "Employer \"{$company}\" has requested account verification. Please review.",
            'user_id' => $this->employer->id,
            'link' => route('admin.verifications'),
        ];
    }
}
