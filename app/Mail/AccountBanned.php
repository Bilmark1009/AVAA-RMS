<?php

namespace App\Mail;

use App\Models\Report;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountBanned extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Report $report,
        public int $activeJobsCount,
        public string $reportReason,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Account Permanently Banned - Action Required',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.account-banned',
            with: [
                'user' => $this->user,
                'report' => $this->report,
                'activeJobsCount' => $this->activeJobsCount,
                'reportReason' => $this->reportReason,
            ],
        );
    }
}
