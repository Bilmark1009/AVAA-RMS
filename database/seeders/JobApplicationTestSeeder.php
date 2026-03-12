<?php

namespace Database\Seeders;

use App\Models\JobApplication;
use App\Models\JobListing;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class JobApplicationTestSeeder extends Seeder
{
    public function run(): void
    {
        $jobSeeker = User::firstOrCreate(
            ['email' => 'jobseeker@test.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'Jobseeker',
                'password' => Hash::make('password'),
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

