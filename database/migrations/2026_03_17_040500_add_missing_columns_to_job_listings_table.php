<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('job_listings')) {
            return;
        }

        Schema::table('job_listings', function (Blueprint $table) {
            if (!Schema::hasColumn('job_listings', 'responsibilities')) {
                $table->json('responsibilities')->nullable()->after('description');
            }

            if (!Schema::hasColumn('job_listings', 'qualifications')) {
                $table->json('qualifications')->nullable()->after('responsibilities');
            }

            if (!Schema::hasColumn('job_listings', 'requirements')) {
                $table->json('requirements')->nullable()->after('qualifications');
            }

            if (!Schema::hasColumn('job_listings', 'screener_questions')) {
                $table->json('screener_questions')->nullable()->after('requirements');
            }

            if (!Schema::hasColumn('job_listings', 'work_arrangement')) {
                $table->string('work_arrangement')->nullable()->after('screener_questions');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('job_listings')) {
            return;
        }

        Schema::table('job_listings', function (Blueprint $table) {
            if (Schema::hasColumn('job_listings', 'work_arrangement')) {
                $table->dropColumn('work_arrangement');
            }

            if (Schema::hasColumn('job_listings', 'screener_questions')) {
                $table->dropColumn('screener_questions');
            }

            if (Schema::hasColumn('job_listings', 'requirements')) {
                $table->dropColumn('requirements');
            }

            if (Schema::hasColumn('job_listings', 'qualifications')) {
                $table->dropColumn('qualifications');
            }

            if (Schema::hasColumn('job_listings', 'responsibilities')) {
                $table->dropColumn('responsibilities');
            }
        });
    }
};
