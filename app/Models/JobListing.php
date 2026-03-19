<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobListing extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'employer_id',
        'title',
        'company_name',
        'location',
        'description',
        'responsibilities',
        'qualifications',
        'requirements',
        'screener_questions',
        'work_arrangement',
        'logo_path',
        'employment_type',
        'industry',
        'experience_level',
        'is_remote',
        'salary_min',
        'salary_max',
        'salary_currency',
        'skills_required',
        'deadline',
        'status',
        'application_limit',
    ];

    protected $casts = [
        'skills_required'   => 'array',
        'qualifications'    => 'array',
        'requirements'      => 'array',
        'screener_questions'=> 'array',
        'responsibilities'  => 'array',
        'is_remote'         => 'boolean',
        'salary_min'        => 'decimal:2',
        'salary_max'        => 'decimal:2',
        'deadline'          => 'date',
        'application_limit' => 'integer',
    ];

    /* ── Relationships ── */

    public function employer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'job_listing_id');
    }

    public function collaborators(): HasMany
    {
        return $this->hasMany(JobCollaborator::class);
    }

    public function acceptedCollaborators(): HasMany
    {
        return $this->hasMany(JobCollaborator::class)->where('status', 'accepted');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    /**
     * Get the pending report for this job if it exists.
     */
    public function pendingReport()
    {
        return $this->hasOne(Report::class)->where('status', 'pending');
    }

    /**
     * Check whether the given user is an accepted collaborator on this job.
     */
    public function isCollaborator(User $user): bool
    {
        return $this->collaborators()
            ->where('user_id', $user->id)
            ->where('status', 'accepted')
            ->exists();
    }

    /**
     * Check whether the given user is the owner OR an accepted collaborator.
     */
    public function isAccessibleBy(User $user): bool
    {
        return $this->employer_id === $user->id || $this->isCollaborator($user);
    }

    /* ── Scopes ── */

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForEmployer($query, int $employerId)
    {
        return $query->where('employer_id', $employerId);
    }
}