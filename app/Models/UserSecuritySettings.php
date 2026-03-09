<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSecuritySettings extends Model
{
    protected $fillable = [
        'user_id',
        'two_factor_enabled',
        'login_alert_email',
        'login_alert_push',
        'marketplace_visibility',
        'show_contact_info',
        'show_ratings',
        'hide_while_employed',
        'restrict_by_ip',
        'session_timeout',
    ];

    protected $casts = [
        'two_factor_enabled' => 'boolean',
        'login_alert_email' => 'boolean',
        'login_alert_push' => 'boolean',
        'show_contact_info' => 'boolean',
        'show_ratings' => 'boolean',
        'hide_while_employed' => 'boolean',
        'restrict_by_ip' => 'boolean',
        'session_timeout' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}