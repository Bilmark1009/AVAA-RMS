<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_notification_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();

            // Email channel
            $table->boolean('email_new_job_matches')->default(true);
            $table->boolean('email_application_status')->default(true);
            $table->boolean('email_interview_invites')->default(true);
            $table->boolean('email_messages_from_employers')->default(true);

            // In-app channel
            $table->boolean('inapp_new_job_matches')->default(true);
            $table->boolean('inapp_application_status')->default(true);
            $table->boolean('inapp_interview_invites')->default(true);
            $table->boolean('inapp_messages_from_employers')->default(true);

            // Admin notifications
            $table->boolean('admin_new_job_posted')->default(true);
            $table->boolean('admin_new_user_registered')->default(true);
            $table->boolean('admin_system_alerts')->default(true);
            $table->boolean('admin_security_alerts')->default(true);
            $table->boolean('admin_maintenance_notices')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notification_settings');
    }
};