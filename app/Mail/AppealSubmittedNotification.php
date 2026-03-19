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

class AppealSubmittedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public JobListing $job;
    public User $employer;
    public Report $report;
    public string $appealMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(JobListing $job, User $employer, Report $report, string $appealMessage)
    {
        $this->job = $job;
        $this->employer = $employer;
        $this->report = $report;
        $this->appealMessage = $appealMessage;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Appeal Submitted - Job Posting: ' . $this->job->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appeal-submitted',
            with: [
                'job' => $this->job,
                'employer' => $this->employer,
                'report' => $this->report,
                'appealMessage' => $this->appealMessage,
                'reportReason' => $this->report->reason ?? 'Policy violation',
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
