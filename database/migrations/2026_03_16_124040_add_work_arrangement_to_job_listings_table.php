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
        if (!Schema::hasColumn('job_listings', 'work_arrangement')) {
            $table->string('work_arrangement')->nullable()->after('location');
        }
    });
}

public function down(): void
{
    Schema::table('job_listings', function (Blueprint $table) {
        $table->dropColumn('work_arrangement');
    });
}
};
