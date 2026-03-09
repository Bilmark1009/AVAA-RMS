<?php

namespace App\Models;

use App\Notifications\EmailOtpNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, SoftDeletes;


    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'role',
        'status',
        'profile_completed',
        'last_login_at',
        'google_id',
        'avatar',
        'email_otp',
        'email_otp_expires_at',
        'email_verified_at',
        'username',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'email_otp_expires_at' => 'datetime',
        'last_login_at' => 'datetime',
        'profile_completed' => 'boolean',
        'password' => 'hashed',
    ];

    /* ── Relationships ─────────────────────────────────────────────────── */

    public function employerProfile(): HasOne
    {
        return $this->hasOne(EmployerProfile::class);
    }

    public function jobSeekerProfile(): HasOne
    {
        return $this->hasOne(JobSeekerProfile::class);
    }

    public function workExperiences(): HasMany
    {
        return $this->hasMany(WorkExperience::class)->orderByDesc('is_current')->orderByDesc('start_date');
    }

    /**
     * Full name accessor — returns "First Last".
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /** All user documents — resumes, certificates, diplomas, etc. */
    public function documents(): HasMany
    {
        return $this->hasMany(UserDocument::class);
    }

    public function securitySettings(): HasOne
    {
        return $this->hasOne(UserSecuritySettings::class);
    }

    public function notificationSettings(): HasOne
    {
        return $this->hasOne(UserNotificationSettings::class);
    }

    /* ── Role helpers ──────────────────────────────────────────────────── */

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isEmployer(): bool
    {
        return $this->role === 'employer';
    }

    public function isJobSeeker(): bool
    {
        return $this->role === 'job_seeker';
    }

    public function getDashboardRoute(): string
    {
        return match ($this->role) {
            'admin' => 'admin.dashboard',
            'employer' => 'employer.dashboard',
            'job_seeker' => 'job-seeker.jobs.browse',
        };
    }

    /* ── OTP ───────────────────────────────────────────────────────────── */

    /**
     * Generate a 6-digit OTP, persist it with a 10-minute expiry, and return it.
     */
    public function generateAndSaveOtp(): string
    {
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $this->forceFill([
            'email_otp' => $otp,
            'email_otp_expires_at' => now()->addMinutes(10),
        ])->save();

        return $otp;
    }

    /**
     * Override the default signed-link verification email with an OTP email.
     */
    public function sendEmailVerificationNotification(): void
    {
        $otp = $this->generateAndSaveOtp();
        $this->notify(new EmailOtpNotification($otp));
    }
}