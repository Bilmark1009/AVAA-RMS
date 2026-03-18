<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
        'type',
        // Keep legacy fields for backward compatibility
        'attachment_path',
        'attachment_name',
        'attachment_mime',
    ];

    protected $casts = [
        'has_attachments' => 'boolean',
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

    public function attachments(): HasMany
    {
        return $this->hasMany(MessageAttachment::class);
    }

    /* ── Accessors ─────────────────────────────────────────────────────── */

    public function getAttachmentUrlAttribute(): ?string
    {
        return $this->attachment_path
            ? asset('storage/' . $this->attachment_path)
            : null;
    }

    public function getHasAttachmentsAttribute(): bool
    {
        return $this->attachments()->exists() || !is_null($this->attachment_path);
    }

    public function getAllAttachmentsAttribute()
    {
        // Get new attachments first, then fall back to legacy attachment
        $newAttachments = $this->attachments;
        
        if ($newAttachments->isNotEmpty()) {
            return $newAttachments;
        }
        
        // Return legacy attachment as collection for consistency
        if ($this->attachment_path) {
            return collect([[
                'id' => null,
                'file_url' => $this->attachment_url,
                'original_name' => $this->attachment_name,
                'mime_type' => $this->attachment_mime,
                'file_size' => null,
                'is_image' => str_starts_with($this->attachment_mime ?? '', 'image/'),
                'file_size_formatted' => 'Unknown',
                'file_extension' => pathinfo($this->attachment_name ?? '', PATHINFO_EXTENSION),
            ]]);
        }
        
        return collect();
    }

    /* ── Scopes ─────────────────────────────────────────────────────── */

    public function scopeWithAttachments($query)
    {
        return $query->with('attachments');
    }
}