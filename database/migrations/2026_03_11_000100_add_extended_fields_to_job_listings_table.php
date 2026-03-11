<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_listings', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('title');
            $table->text('responsibilities')->nullable()->after('description');
            $table->text('qualifications')->nullable()->after('responsibilities');
            $table->text('project_timeline')->nullable()->after('qualifications');
            $table->text('onboarding_process')->nullable()->after('project_timeline');
            $table->string('logo_path')->nullable()->after('onboarding_process');
        });
    }

    public function down(): void
    {
        Schema::table('job_listings', function (Blueprint $table) {
            $table->dropColumn([
                'company_name',
                'responsibilities',
                'qualifications',
                'project_timeline',
                'onboarding_process',
                'logo_path',
            ]);
        });
    }
};
