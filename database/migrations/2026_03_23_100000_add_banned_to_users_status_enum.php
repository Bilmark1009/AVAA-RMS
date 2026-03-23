<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Add 'banned' to the users.status ENUM
        DB::statement("ALTER TABLE `users` MODIFY COLUMN `status` ENUM('pending', 'active', 'suspended', 'banned') NOT NULL DEFAULT 'active'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `users` MODIFY COLUMN `status` ENUM('pending', 'active', 'suspended') NOT NULL DEFAULT 'active'");
    }
};
