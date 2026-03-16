<?php

namespace App\Mail;

use App\Models\Interview;
use App\Models\JobListing;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InterviewRescheduled extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Interview $interview,
        public JobListing $job,
        public string $candidateName,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Interview Rescheduled - {$this->job->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.interview-rescheduled',
        );
    }
}
