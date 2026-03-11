<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlockedUser extends Model
{
    protected $fillable = [
        'blocker_id',
        'blocked_user_id',
        'reason',
    ];

    /* ── Relationships ─────────────────────────────────────────────────── */

    public function blocker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'blocker_id');
    }

    public function blockedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'blocked_user_id');
    }

    /* ── Scopes ─────────────────────────────────────────────────────── */

    public function scopeWhereBlockedBy($query, int $userId)
    {
        return $query->where('blocker_id', $userId);
    }

    public function scopeWhereBlocking($query, int $userId)
    {
        return $query->where('blocked_user_id', $userId);
    }
}
