<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_collaborators', function (Blueprint $table) {
            $table->id();

            $table->foreignId('job_listing_id')
                ->constrained('job_listings')
                ->onDelete('cascade');

            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->foreignId('invited_by')
                ->constrained('users')
                ->onDelete('cascade');

            $table->string('role')->default('Collaborator');
            $table->enum('status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->timestamp('accepted_at')->nullable();

            $table->timestamps();

            $table->unique(['job_listing_id', 'user_id']);
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_collaborators');
    }
};
