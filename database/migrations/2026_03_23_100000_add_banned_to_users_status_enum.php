<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $driver = DB::getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE users MODIFY COLUMN status ENUM('pending', 'active', 'suspended', 'banned') NOT NULL DEFAULT 'active'");
            return;
        }

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('pending', 'active', 'suspended', 'banned'))");
            return;
        }

        // SQLite already stores this field as text in this project, so no schema change is required.
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        DB::statement("UPDATE users SET status = 'suspended' WHERE status = 'banned'");

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE users MODIFY COLUMN status ENUM('pending', 'active', 'suspended') NOT NULL DEFAULT 'active'");
            return;
        }

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('pending', 'active', 'suspended'))");
            return;
        }

        // SQLite: no schema rollback needed for text-based status.
    }
};
