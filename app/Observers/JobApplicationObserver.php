<?php

namespace App\Observers;

use App\Models\Conversation;
use App\Models\JobApplication;
use App\Models\Message;

class JobApplicationObserver
{
    /**
     * Fires every time a JobApplication is updated.
     *
     * We watch for the moment hired_at goes from NULL → a value.
     * This happens in InterviewController::passInterview() which calls:
     *   $application->update(['status' => 'hired', 'hired_at' => now()])
     *
     * When that happens we:
     *  1. Find-or-create the group / team conversation for the job listing.
     *  2. Add the newly hired job seeker to that group (if not already in).
     *  3. Post a system message announcing the new hire.
     *  4. Ensure a direct conversation also exists between employer ↔ job seeker.
     */
    public function updated(JobApplication $application): void
    {
        $justHired = $application->isDirty('hired_at')
                  && $application->hired_at !== null
                  && $application->getOriginal('hired_at') === null;

        if (! $justHired) return;

        // Load required relations
        $application->loadMissing([
            'jobListing.employer.employerProfile',
            'user',
        ]);

        $job      = $application->jobListing;
        $employer = $job->employer;
        $jobSeeker = $application->user;

        // ── 1 & 2: Group conversation ──────────────────────────────────────
        $group = Conversation::findOrCreateGroup($job);

        $alreadyInGroup = $group->participants()
            ->where('user_id', $jobSeeker->id)
            ->exists();

        if (! $alreadyInGroup) {
            $group->participants()->attach($jobSeeker->id);

            // ── 3: System announcement ─────────────────────────────────────
            Message::create([
                'conversation_id' => $group->id,
                'sender_id'       => $employer->id,
                'body'            => "🎉 {$jobSeeker->full_name} has joined the team for \"{$job->title}\"!",
                'type'            => 'system',
            ]);

            $group->touch('last_message_at');
        }

        // ── 4: Direct conversation ─────────────────────────────────────────
        Conversation::findOrCreateDirect($employer, $jobSeeker);
    }
}