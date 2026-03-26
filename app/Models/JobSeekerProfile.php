<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class JobSeekerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'about',
        'professional_title',
        'city',
        'state',
        'country',
        'current_job_title',
        'current_company',
        'years_of_experience',
        'employment_type_preference',
        'highest_education',
        'field_of_study',
        'institution_name',
        'skills',
        'certifications',
        'resume_path',
        'resume_parsed_data',
        'portfolio_url',
        'linkedin_url',
        'desired_job_types',
        'desired_industries',
        'expected_salary_min',
        'expected_salary_max',
        'salary_currency',
        'willing_to_relocate',
        'profile_visibility',
        'profile_completeness',
        // ── Added by add_availability_fields migration ──
        'notice_period',
        'work_style',
        'weekly_hours',
        'open_to_work',
        'profile_frame',
    ];

    protected $casts = [
        'employment_type_preference' => 'array',
        'skills' => 'array',
        'certifications' => 'array',
        'resume_parsed_data' => 'array',
        'desired_job_types' => 'array',
        'desired_industries' => 'array',
        'willing_to_relocate' => 'boolean',
        'open_to_work' => 'boolean',
        'expected_salary_min' => 'decimal:2',
        'expected_salary_max' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted()
    {
        static::updated(function ($profile) {
            if (!$profile->wasChanged('open_to_work')) {
                return;
            }

            if (!Schema::hasTable('user_timeline_events')) {
                return;
            }

            try {
                $status = $profile->open_to_work ? 'Open to Work' : 'Not Open to Work';
                \App\Models\UserTimelineEvent::create([
                    'user_id' => $profile->user_id,
                    'event_type' => 'status_change',
                    'description' => "Status changed to {$status}",
                    'metadata' => [
                        'status' => $profile->open_to_work ? 'open_to_work' : 'not_open_to_work',
                    ],
                ]);
            } catch (\Throwable $e) {
                // Timeline logging should never block profile/status updates.
            }
        });
    }
}