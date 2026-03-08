<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    protected $fillable = [
        'type',
        'job_listing_id',
        'name',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    /* ── Relationships ─────────────────────────────────────────────────── */

    public function jobListing(): BelongsTo
    {
        return $this->belongsTo(JobListing::class);
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot(['last_read_at', 'is_archived', 'is_muted', 'left_at', 'cleared_at'])
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    /* ── Helpers ───────────────────────────────────────────────────────── */

    /** Returns the other user in a direct conversation. */
    public function otherParticipant(int $currentUserId): ?User
    {
        return $this->participants->firstWhere('id', '!=', $currentUserId);
    }

    /** Count messages the given user hasn't read yet. */
    public function unreadCountFor(int $userId): int
    {
        $participant = $this->participants->firstWhere('id', $userId);
        $lastRead = $participant?->pivot?->last_read_at;
        $clearedAt = $participant?->pivot?->cleared_at;

        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->when($lastRead, fn($q) => $q->where('created_at', '>', $lastRead))
            ->when($clearedAt, fn($q) => $q->where('created_at', '>', $clearedAt))
            ->whereNull('deleted_at')
            ->count();
    }

    /**
     * Find an existing direct conversation between two users.
     */
    public static function findDirect(int $userA, int $userB): ?self
    {
        return self::where('type', 'direct')
            ->whereHas('participants', fn($q) => $q->where('user_id', $userA))  // no left_at filter
            ->whereHas('participants', fn($q) => $q->where('user_id', $userB))  // no left_at filter
            ->first();
    }

    /**
     * Find or create a direct (1-on-1) conversation between two users.
     * RULE: only employer ↔ job_seeker pairs are permitted.
     */
    public static function findOrCreateDirect(User $userA, User $userB): self
    {
        $existing = self::findDirect($userA->id, $userB->id);

        if ($existing) {
            // Clear archived flag for the initiator — do NOT touch cleared_at
            // so their old messages stay hidden
            $existing->participants()->updateExistingPivot($userA->id, [
                'is_archived' => false,
            ]);
            return $existing;
        }

        $conversation = self::create(['type' => 'direct']);
        $conversation->participants()->attach([$userA->id, $userB->id]);

        return $conversation;
    }
    /**
     * Find or create the group (team) conversation for a given job listing.
     * The employer is always included as a participant.
     */
    public static function findOrCreateGroup(JobListing $job): self
    {
        $existing = self::where('type', 'group')
            ->where('job_listing_id', $job->id)
            ->first();

        if ($existing)
            return $existing;

        $companyName = $job->employer->employerProfile?->company_name
            ?? $job->employer->full_name;

        $conversation = self::create([
            'type' => 'group',
            'job_listing_id' => $job->id,
            'name' => "{$companyName} – {$job->title}",
        ]);

        // Employer is always in the group
        $conversation->participants()->attach($job->employer_id);

        return $conversation;
    }
}