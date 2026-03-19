<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            // 3-state frame: default | open_to_work | not_open_to_work
            $table->string('profile_frame', 20)->default('default')->after('open_to_work');
        });
    }

    public function down(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            $table->dropColumn('profile_frame');
        });
    }
};
