<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── conversations ────────────────────────────────────────────────────
        // type = 'direct'  → 1-on-1 between employer ↔ job_seeker
        // type = 'group'   → team chat auto-created when applicant is hired
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['direct', 'group'])->default('direct');

            // Group conversations are tied to a specific job listing (the "team")
            $table->foreignId('job_listing_id')
                  ->nullable()
                  ->constrained('job_listings')
                  ->nullOnDelete();

            // Human-readable name (used for group chats, e.g. "TechFlow – Senior VA Team")
            $table->string('name')->nullable();

            // Denormalised timestamp so we can ORDER BY without joining messages
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
        });

        // ── conversation_participants ────────────────────────────────────────
        Schema::create('conversation_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Per-participant state
            $table->timestamp('last_read_at')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->boolean('is_muted')->default(false);

            // Soft-delete per user (user "deletes" their copy of the conversation)
            $table->timestamp('left_at')->nullable();
            $table->timestamp('cleared_at')->nullable();

            $table->unique(['conversation_id', 'user_id']);
            $table->timestamps();
        });

        // ── messages ─────────────────────────────────────────────────────────
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();

            $table->text('body');
            $table->enum('type', ['text', 'file', 'image', 'system'])->default('text');

            // Optional file attachment
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
            $table->string('attachment_mime')->nullable();

            // Soft-delete (sender deletes their own message)
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversation_participants');
        Schema::dropIfExists('conversations');
    }
};