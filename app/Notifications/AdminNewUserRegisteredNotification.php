<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Notification;

/**
 * Sent to the Admin when a new user registers.
 * Respects: admin_new_user_registered
 */
class AdminNewUserRegisteredNotification extends Notification
{
    public function __construct(
        protected User $newUser,
    ) {
    }

    public function via(object $notifiable): array
    {
        $settings = $notifiable->notificationSettings;
        if ($settings?->admin_new_user_registered ?? true) {
            return ['database'];
        }
        return [];
    }

    public function toArray(object $notifiable): array
    {
        $name = "{$this->newUser->first_name} {$this->newUser->last_name}";
        $role = ucfirst(str_replace('_', ' ', $this->newUser->role));
        return [
            'message' => "New {$role} registered: {$name} ({$this->newUser->email})",
            'user_id' => $this->newUser->id,
            'link' => route('admin.users.index'),
        ];
    }
}
