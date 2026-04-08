<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 'suspended' to job_listings.status enum (MySQL/MariaDB only).
        // SQLite doesn't support altering enums; handled at application level.
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE job_listings MODIFY COLUMN status ENUM('active', 'inactive', 'draft', 'suspended') NOT NULL DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Before removing 'suspended', map it back to 'inactive'
        DB::statement("UPDATE job_listings SET status = 'inactive' WHERE status = 'suspended'");

        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE job_listings MODIFY COLUMN status ENUM('active', 'inactive', 'draft') NOT NULL DEFAULT 'active'");
    }
};
