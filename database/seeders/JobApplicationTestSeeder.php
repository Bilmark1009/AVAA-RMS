<?php

namespace Database\Seeders;

use App\Models\JobApplication;
use App\Models\JobListing;
use App\Models\User;
use Illuminate\Database\Seeder;

class JobApplicationTestSeeder extends Seeder
{
    public function run(): void
    {
        // Note: User model already hashes the password via casts, so we store the plain string here.
        $jobSeeker = User::updateOrCreate(
            ['email' => 'jobseeker@test.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'Jobseeker',
                'password' => 'password',
                'role' => 'job_seeker',
                'status' => 'active',
                'profile_completed' => true,
                'email_verified_at' => now(),
            ]
        );

        $job = JobListing::query()->where('status', 'active')->latest()->first();
        if (! $job) {
            $this->command?->warn('No active job listings found. Run JobListingSeeder first.');
            return;
        }

        // Create a pending application so you can test "Withdraw" from the UI.
        JobApplication::firstOrCreate(
            [
                'user_id' => $jobSeeker->id,
                'job_listing_id' => $job->id,
            ],
            [
                'status' => 'pending',
                'cover_letter' => 'Test application for UI + notification testing.',
                'resume_path' => null,
            ]
        );

        $this->command?->info("Test job seeker: jobseeker@test.com / password");
        $this->command?->info("Created/ensured 1 pending application for job '{$job->title}'.");
    }
}

