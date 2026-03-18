<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            if (!Schema::hasColumn('reports', 'action_taken')) {
                $table->string('action_taken')->nullable()->after('status');
            }
            if (!Schema::hasColumn('reports', 'action_by')) {
                $table->foreignId('action_by')->nullable()->constrained('users')->nullOnDelete()->after('action_taken');
            }
            if (!Schema::hasColumn('reports', 'action_at')) {
                $table->timestamp('action_at')->nullable()->after('action_by');
            }
            if (!Schema::hasColumn('reports', 'action_note')) {
                $table->text('action_note')->nullable()->after('action_at');
            }
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
