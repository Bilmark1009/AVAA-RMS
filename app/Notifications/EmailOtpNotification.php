<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class EmailOtpNotification extends Notification
{
    public function __construct(protected string $otp)
    {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Email Verification Code')
            ->greeting("Hello {$notifiable->name}!")
            ->line('Use the verification code below to confirm your email address.')
            ->line('**Your OTP Code: ' . $this->otp . '**')
            ->line('This code expires in **10 minutes**. Do not share it with anyone.')
            ->line('If you did not create an account, no further action is required.');
    }
}
