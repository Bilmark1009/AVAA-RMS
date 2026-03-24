<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // For SQLite, we need to recreate the table to modify the enum
        // Get all columns from the current users table
        $columns = Schema::getColumnListing('users');
        
        // Create a temporary table with the new enum definition
        DB::statement("
            CREATE TABLE users_temp (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                username VARCHAR(255) UNIQUE,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(255),
                email_verified_at TIMESTAMP NULL,
                email_otp VARCHAR(6),
                email_otp_expires_at TIMESTAMP NULL,
                password VARCHAR(255) NOT NULL,
                google_id VARCHAR(255) UNIQUE,
                avatar VARCHAR(255),
                role VARCHAR(20) NOT NULL DEFAULT 'job_seeker',
                status VARCHAR(20) NOT NULL DEFAULT 'active',
                profile_completed BOOLEAN NOT NULL DEFAULT 0,
                last_login_at TIMESTAMP NULL,
                remember_token VARCHAR(100),
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL,
                deleted_at TIMESTAMP NULL,
                messaging_preferences TEXT
            )
        ");
        
        // Copy data from original table to temp table
        DB::statement("INSERT INTO users_temp SELECT * FROM users");
        
        // Drop the original table
        DB::statement("DROP TABLE users");
        
        // Rename the temp table to the original name
        DB::statement("ALTER TABLE users_temp RENAME TO users");
        
        // Create indexes
        DB::statement("CREATE INDEX users_role_index ON users (role)");
    }

    public function down(): void
    {
        // For SQLite, we need to recreate the table to remove 'banned' from the enum
        DB::statement("
            CREATE TABLE users_temp (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                username VARCHAR(255) UNIQUE,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(255),
                email_verified_at TIMESTAMP NULL,
                email_otp VARCHAR(6),
                email_otp_expires_at TIMESTAMP NULL,
                password VARCHAR(255) NOT NULL,
                google_id VARCHAR(255) UNIQUE,
                avatar VARCHAR(255),
                role VARCHAR(20) NOT NULL DEFAULT 'job_seeker',
                status VARCHAR(20) NOT NULL DEFAULT 'active',
                profile_completed BOOLEAN NOT NULL DEFAULT 0,
                last_login_at TIMESTAMP NULL,
                remember_token VARCHAR(100),
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL,
                deleted_at TIMESTAMP NULL,
                messaging_preferences TEXT
            )
        ");
        
        // Copy data from original table to temp table
        DB::statement("INSERT INTO users_temp SELECT * FROM users");
        
        // Drop the original table
        DB::statement("DROP TABLE users");
        
        // Rename the temp table to the original name
        DB::statement("ALTER TABLE users_temp RENAME TO users");
        
        // Create indexes
        DB::statement("CREATE INDEX users_role_index ON users (role)");
    }
};
