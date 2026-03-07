<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class EmployerVerifiedNotification extends Notification
{
    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Employer Account Has Been Verified!')
            ->greeting("Hello {$notifiable->name}!")
            ->line('Great news! Your employer account has been verified by our admin team.')
            ->line('You can now post jobs and start finding great candidates.')
            ->action('Go to Dashboard', url('/employer/dashboard'))
            ->line('Thank you for using our platform!');
    }

    public function toArray($notifiable): array
    {
        return [
            'message' => 'Your employer account has been verified. You can now post jobs!',
            'verified_at' => now()->toISOString(),
        ];
    }
}