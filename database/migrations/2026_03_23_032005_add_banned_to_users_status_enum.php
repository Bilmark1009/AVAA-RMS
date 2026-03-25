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
        // For SQLite, we need to check if the column already has the 'banned' value
        // Since SQLite doesn't support MODIFY COLUMN, we'll handle this differently
        if (DB::getDriverName() === 'sqlite') {
            // SQLite doesn't support enum modifications, skip for now
            // The 'banned' status will be handled at application level
            return;
        }
        
        // For MySQL/MariaDB, use MODIFY COLUMN
        DB::statement("ALTER TABLE users MODIFY COLUMN status ENUM('pending', 'active', 'suspended', 'banned') NOT NULL DEFAULT 'active'");
    }

    /**
     * Reverse the migration by removing 'banned' from the enum.
     */
    public function down(): void
    {
        // Move any banned users back to suspended before rolling back
        DB::statement("UPDATE users SET status = 'suspended' WHERE status = 'banned'");
<<<<<<< HEAD
=======
        
        if (DB::getDriverName() === 'sqlite') {
            // SQLite doesn't support enum modifications, skip for now
            return;
        }
        
>>>>>>> fix/productions
        DB::statement("ALTER TABLE users MODIFY COLUMN status ENUM('pending', 'active', 'suspended') NOT NULL DEFAULT 'active'");
    }
};
