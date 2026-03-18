<?php

namespace Database\Seeders;

use App\Models\JobListing;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class JobListingSeeder extends Seeder
{
    /**
     * Seed sample active job listings for testing the Browse Jobs UI.
     */
    public function run(): void
    {
        $employer = User::firstOrCreate(
            ['email' => 'employer@test.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'Employer',
                'password' => Hash::make('password'),
                'role' => 'employer',
                'status' => 'active',
                'profile_completed' => true,
                'email_verified_at' => now(),
            ]
        );

        $jobs = [
            [
                'title' => 'Senior Frontend Developer',
                'company_name' => 'TechCorp Inc.',
                'location' => 'San Francisco, CA (Remote)',
                'description' => 'We are looking for a Senior Frontend Developer to build and maintain our React-based web applications. You will work with design and backend teams to deliver fast, accessible user experiences.',
                'employment_type' => 'Full-time',
                'industry' => 'Technology',
                'experience_level' => 'Senior',
                'is_remote' => true,
                'salary_min' => 120000,
                'salary_max' => 160000,
                'salary_currency' => 'USD',
                'skills_required' => ['React', 'TypeScript', 'CSS', 'REST APIs'],
                'status' => 'active',
            ],
            [
                'title' => 'Product Manager',
                'company_name' => 'StartupXYZ',
                'location' => 'New York, NY',
                'description' => 'Join our product team to own the roadmap and drive features from discovery to launch. You will work closely with engineering and design to ship products that users love.',
                'employment_type' => 'Full-time',
                'industry' => 'Technology',
                'experience_level' => 'Mid-level',
                'is_remote' => false,
                'salary_min' => 95000,
                'salary_max' => 130000,
                'salary_currency' => 'USD',
                'skills_required' => ['Product strategy', 'Agile', 'User research', 'Jira'],
                'status' => 'active',
            ],
            [
                'title' => 'UX Designer',
                'company_name' => 'Design Studio Co.',
                'location' => 'Austin, TX (Hybrid)',
                'description' => 'Create intuitive and visually compelling interfaces for our B2B SaaS platform. You will conduct user research, create wireframes and prototypes, and collaborate with developers.',
                'employment_type' => 'Full-time',
                'industry' => 'Design',
                'experience_level' => 'Mid-level',
                'is_remote' => false,
                'salary_min' => 85000,
                'salary_max' => 110000,
                'salary_currency' => 'USD',
                'skills_required' => ['Figma', 'User research', 'Prototyping', 'Design systems'],
                'status' => 'active',
            ],
        ];

        foreach ($jobs as $data) {
            JobListing::firstOrCreate(
                [
                    'employer_id' => $employer->id,
                    'title' => $data['title'],
                ],
                array_merge($data, [
                    'employer_id' => $employer->id,
                    'responsibilities' => null,
                    'qualifications' => null,
                    'project_timeline' => null,
                    'onboarding_process' => null,
                    'logo_path' => null,
                    'deadline' => now()->addDays(30),
                    'application_limit' => null,
                ])
            );
        }

        $this->command->info('Created ' . count($jobs) . ' sample job listing(s) for Browse Jobs UI testing.');
    }
}
