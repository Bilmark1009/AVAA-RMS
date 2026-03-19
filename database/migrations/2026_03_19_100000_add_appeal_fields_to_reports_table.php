<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            // Add appeal-related fields
            $table->text('appeal_message')->nullable()->after('action_note');
            $table->timestamp('appealed_at')->nullable()->after('appeal_message');
            $table->enum('appeal_status', ['pending', 'approved', 'rejected', 'info_requested'])->nullable()->after('appealed_at');
            $table->text('appeal_decision_note')->nullable()->after('appeal_status');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn([
                'appeal_message',
                'appealed_at',
                'appeal_status',
                'appeal_decision_note',
            ]);
        });
    }
};
