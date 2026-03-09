<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotificationSettings extends Model
{
    protected $fillable = [
        'user_id',
        'email_new_job_matches',
        'email_application_status',
        'email_interview_invites',
        'email_messages_from_employers',
        'inapp_new_job_matches',
        'inapp_application_status',
        'inapp_interview_invites',
        'inapp_messages_from_employers',
        'admin_new_job_posted',
        'admin_new_user_registered',
        'admin_system_alerts',
        'admin_security_alerts',
        'admin_maintenance_notices',
    ];

    protected $casts = [
        'email_new_job_matches' => 'boolean',
        'email_application_status' => 'boolean',
        'email_interview_invites' => 'boolean',
        'email_messages_from_employers' => 'boolean',
        'inapp_new_job_matches' => 'boolean',
        'inapp_application_status' => 'boolean',
        'inapp_interview_invites' => 'boolean',
        'inapp_messages_from_employers' => 'boolean',
        'admin_new_job_posted' => 'boolean',
        'admin_new_user_registered' => 'boolean',
        'admin_system_alerts' => 'boolean',
        'admin_security_alerts' => 'boolean',
        'admin_maintenance_notices' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}