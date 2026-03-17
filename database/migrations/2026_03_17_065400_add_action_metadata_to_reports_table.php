<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->string('action_taken')->nullable()->after('status');
            $table->foreignId('action_by')->nullable()->constrained('users')->nullOnDelete()->after('action_taken');
            $table->timestamp('action_at')->nullable()->after('action_by');
            $table->text('action_note')->nullable()->after('action_at');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['action_by']);
            $table->dropColumn(['action_taken', 'action_by', 'action_at', 'action_note']);
        });
    }
};
