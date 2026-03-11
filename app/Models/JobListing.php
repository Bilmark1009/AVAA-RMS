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
        'project_timeline',
        'onboarding_process',
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