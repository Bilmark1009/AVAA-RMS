<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('user_notification_settings', function (Blueprint $table) {
            $table->boolean('admin_new_job_posted')->default(true)->after('inapp_messages_from_employers');
            $table->boolean('admin_new_user_registered')->default(true)->after('admin_new_job_posted');
            $table->boolean('admin_system_alerts')->default(true)->after('admin_new_user_registered');
            $table->boolean('admin_security_alerts')->default(true)->after('admin_system_alerts');
            $table->boolean('admin_maintenance_notices')->default(true)->after('admin_security_alerts');
        });
    }

    public function down(): void
    {
        Schema::table('user_notification_settings', function (Blueprint $table) {
            $table->dropColumn([
                'admin_new_job_posted',
                'admin_new_user_registered',
                'admin_system_alerts',
                'admin_security_alerts',
                'admin_maintenance_notices',
            ]);
        });
    }
};
