<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserTimelineEvent extends Model
{
    protected $fillable = [
        'user_id',
        'event_type',
        'description',
        'metadata',
        'event_date',
    ];

    protected $casts = [
        'metadata' => 'array',
        'event_date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
