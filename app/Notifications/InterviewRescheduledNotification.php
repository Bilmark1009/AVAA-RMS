<?php

namespace App\Notifications;

use App\Models\Interview;
use App\Models\JobListing;
use Carbon\Carbon;
use Illuminate\Notifications\Notification;

class InterviewRescheduledNotification extends Notification
{
    public function __construct(
        protected Interview $interview,
        protected JobListing $job,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $date = Carbon::parse($this->interview->interview_date)->format('M j, Y');
        $time = Carbon::parse($this->interview->interview_time)->format('g:i A');

        return [
            'message' => "Your interview for \"{$this->job->title}\" has been rescheduled to {$date} at {$time}.",
            'job_id' => $this->job->id,
            'link' => route('job-seeker.jobs.browse'),
            'interview_id' => $this->interview->id,
            'interview_date' => optional($this->interview->interview_date)?->toDateString(),
            'interview_time' => $this->interview->interview_time,
            'interview_type' => $this->interview->interview_type,
            'location_or_link' => $this->interview->location_or_link,
            'notes' => $this->interview->notes,
        ];
    }
}
