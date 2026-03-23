<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Add 'banned' to the users status enum.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN status ENUM('pending', 'active', 'suspended', 'banned') NOT NULL DEFAULT 'active'");
    }

    /**
     * Reverse the migration by removing 'banned' from the enum.
     */
    public function down(): void
    {
        // Move any banned users back to suspended before rolling back
        DB::statement("UPDATE users SET status = 'suspended' WHERE status = 'banned'");
        DB::statement("ALTER TABLE users MODIFY COLUMN status ENUM('pending', 'active', 'suspended') NOT NULL DEFAULT 'active'");
    }
};
