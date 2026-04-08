<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add missing open_to_work column to job_seeker_profiles table.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('job_seeker_profiles', 'open_to_work')) {
            Schema::table('job_seeker_profiles', function (Blueprint $table) {
                $table->boolean('open_to_work')->default(false)->after('weekly_hours');
            });
        }
    }

    /**
     * Reverse the migration.
     */
    public function down(): void
    {
        if (Schema::hasColumn('job_seeker_profiles', 'open_to_work')) {
            Schema::table('job_seeker_profiles', function (Blueprint $table) {
                $table->dropColumn('open_to_work');
            });
        }
    }
};
