<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Note: User model already hashes the password via casts, so we store the plain string here.
        User::updateOrCreate(
            ['email' => 'admin@jobplatform.com'],
            [
                'first_name' => 'Platform',
                'last_name' => 'Admin',
                'password' => 'password',
                'role' => 'admin',
                'status' => 'active',
                'profile_completed' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}