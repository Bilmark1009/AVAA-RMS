<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('job_listings', function (Blueprint $table) {
        // Add whichever ones are missing
        if (!Schema::hasColumn('job_listings', 'requirements')) {
            $table->text('requirements')->nullable();
        }
        if (!Schema::hasColumn('job_listings', 'screener_questions')) {
            $table->json('screener_questions')->nullable(); // JSON is good for arrays
        }
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_listings', function (Blueprint $table) {
            //
        });
    }
};
