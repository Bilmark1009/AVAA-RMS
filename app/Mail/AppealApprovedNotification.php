<?php

namespace App\Mail;

use App\Models\JobListing;
use App\Models\User;
use App\Models\Report;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppealApprovedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ?JobListing $job,
        public User $employer,
        public Report $report,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Appeal Has Been Approved - Job Posting Restored',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appeal-approved',
            with: [
                'job' => $this->job,
                'employer' => $this->employer,
                'report' => $this->report,
            ],
        );
    }
}
