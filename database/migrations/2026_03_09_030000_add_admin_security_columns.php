<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('user_security_settings', function (Blueprint $table) {
            $table->boolean('restrict_by_ip')->default(false)->after('login_alert_push');
            $table->unsignedSmallInteger('session_timeout')->default(30)->after('restrict_by_ip'); // minutes
        });
    }

    public function down(): void
    {
        Schema::table('user_security_settings', function (Blueprint $table) {
            $table->dropColumn(['restrict_by_ip', 'session_timeout']);
        });
    }
};
