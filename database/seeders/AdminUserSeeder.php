<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@jobplatform.com'],
            [
                'name'              => 'Platform Admin',
                'password'          => Hash::make('password'),
                'role'              => 'admin',
                'status'            => 'active',
                'profile_completed' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}