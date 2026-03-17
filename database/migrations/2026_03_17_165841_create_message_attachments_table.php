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
        Schema::create('message_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained()->cascadeOnDelete();
            
            // File information
            $table->string('file_path'); // Path in storage
            $table->string('original_name'); // Original filename
            $table->string('mime_type'); // MIME type for handling
            $table->unsignedBigInteger('file_size'); // File size in bytes
            
            // Metadata
            $table->string('file_hash')->nullable(); // SHA-256 hash for deduplication
            $table->json('metadata')->nullable(); // Additional metadata (dimensions, etc.)
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['message_id']);
            $table->index(['file_hash']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_attachments');
    }
};
