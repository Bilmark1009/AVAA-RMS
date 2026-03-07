<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplication extends Model
{
    protected $fillable = [
        'job_listing_id',
        'user_id',
        'status',
        'cover_letter',
        'resume_path',
        'employer_notes',
        'reviewed_at',
        'shortlisted_at',
    ];

    protected $casts = [
        'reviewed_at'    => 'datetime',
        'shortlisted_at' => 'datetime',
    ];

    /* ── Relationships ── */

    public function jobListing(): BelongsTo
    {
        return $this->belongsTo(JobListing::class, 'job_listing_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /* ── Scopes ── */

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeShortlisted($query)
    {
        return $query->where('status', 'shortlisted');
    }
}