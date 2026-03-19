<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            // Add job_listing_id for job posting reports
            $table->foreignId('job_listing_id')
                ->nullable()
                ->constrained('job_listings')
                ->nullOnDelete();
            
            // Make user_id nullable since not all reports are about users
            $table->foreignId('reported_user_id')
                ->nullable()
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropConstrainedForeignId('job_listing_id');
            $table->foreignId('reported_user_id')->change();
        });
    }
};
