<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
        'type',
        'attachment_path',
        'attachment_name',
        'attachment_mime',
    ];

    /* ── Relationships ─────────────────────────────────────────────────── */

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /* ── Accessors ─────────────────────────────────────────────────────── */

    public function getAttachmentUrlAttribute(): ?string
    {
        return $this->attachment_path
            ? asset('storage/' . $this->attachment_path)
            : null;
    }
}