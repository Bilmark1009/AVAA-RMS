<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employer_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->string('title');
            $table->string('company_name')->nullable();
            $table->string('location');
            $table->text('description');
            $table->json('responsibilities')->nullable();
            $table->json('qualifications')->nullable();
            $table->json('requirements')->nullable();
            $table->json('screener_questions')->nullable();
            $table->string('work_arrangement')->nullable();
            $table->text('project_timeline')->nullable();
            $table->text('onboarding_process')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('employment_type');       // Full-time, Part-time, Contract …
            $table->string('industry')->nullable();
            $table->string('experience_level')->nullable();
            $table->boolean('is_remote')->default(false);

            // Salary (optional)
            $table->decimal('salary_min', 10, 2)->nullable();
            $table->decimal('salary_max', 10, 2)->nullable();
            $table->string('salary_currency', 3)->default('USD');

            // Skills as JSON array of strings
            $table->json('skills_required')->nullable();

            // Optional cap on number of applicants
            $table->unsignedInteger('application_limit')->nullable();

            // Application deadline
            $table->date('deadline')->nullable();

            // Listing status
            $table->enum('status', ['active', 'inactive', 'draft'])->default('active');

            $table->timestamps();
            $table->softDeletes();

            // Indices for common filter queries
            $table->index('employer_id');
            $table->index('status');
            $table->index('industry');
            $table->index('employment_type');
            $table->index('is_remote');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_listings');
    }
};