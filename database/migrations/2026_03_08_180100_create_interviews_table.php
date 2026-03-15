<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('job_listing_id')->constrained()->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('employer_id')->constrained('users')->cascadeOnDelete();
            $table->string('interviewer_name');
            $table->date('interview_date');
            $table->time('interview_time');
            $table->string('interview_type'); // Online Interview, In-Person, Phone
            $table->string('location_or_link')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('active'); // active, completed, cancelled
            $table->string('interview_result')->nullable(); // passed | failed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
