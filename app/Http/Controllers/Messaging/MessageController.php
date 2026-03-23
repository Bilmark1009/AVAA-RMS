<?php

namespace App\Http\Controllers\Messaging;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * POLLING ENDPOINT — returns all messages after a given ID.
     *
     * The React frontend calls this every ~3 seconds with the ID of the
     * last message it already has. Only new messages are returned,
     * keeping the payload small.
     *
     * GET /messages/{conversation}/poll?after_id=123
     */
    public function poll(Request $request, Conversation $conversation): JsonResponse
    {
        $userId = $request->user()->id;
        $this->authorizeParticipant($conversation, $userId);

        $afterId = (int) $request->query('after_id', 0);

        // Respect cleared_at — don't show messages from before user's deletion
        $clearedAt = $conversation->participants
            ->firstWhere('id', $userId)?->pivot?->cleared_at;

        $newMessages = $conversation->messages()
            ->with('sender:id,first_name,last_name,avatar,role')
            ->with('attachments')
            ->whereNull('messages.deleted_at')
            ->where('id', '>', $afterId)
            ->when($clearedAt, fn($q) => $q->where('messages.created_at', '>', $clearedAt))
            ->orderBy('id')
            ->get()
            ->map(fn($m) => $this->formatMessage($m));

        // Also mark as read while we're here
        if ($newMessages->isNotEmpty()) {
            $conversation->participants()->updateExistingPivot($userId, [
                'last_read_at' => now(),
            ]);
        }

        return response()->json([
            'messages'  => $newMessages,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Send a new message to a conversation.
     * Supports plain text + optional multiple file/image attachments.
     *
     * POST /messages/{conversation}/send
     */
    public function send(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();
        $this->authorizeParticipant($conversation, $user->id);

        // Check if user is suspended
        if ($user->isSuspended()) {
            return response()->json([
                'error' => 'Your account is suspended',
                'reason' => 'You cannot send messages while your account is suspended.',
                'suspension_remaining' => $user->suspension_remaining,
            ], 403);
        }

        // Check if user is blocked by any participant
        $otherParticipant = $conversation->otherParticipant($user->id);
        if ($otherParticipant && !$user->canMessage($otherParticipant)) {
            if ($user->hasBlocked($otherParticipant)) {
                return response()->json([
                    'error' => 'Cannot send message',
                    'reason' => 'You have blocked this user.',
                ], 403);
            } elseif ($user->isBlockedBy($otherParticipant)) {
                return response()->json([
                    'error' => 'Cannot send message',
                    'reason' => 'This user has blocked you.',
                ], 403);
            } elseif ($otherParticipant->isSuspended()) {
                return response()->json([
                    'error' => 'Cannot send message',
                    'reason' => 'This user\'s account is suspended and cannot receive messages.',
                ], 403);
            }
        }

        try {
            $request->validate([
                'body'       => 'required_without:attachments|nullable|string|max:5000',
                'attachments' => 'nullable|array|max:5', // Max 5 files per message
                'attachments.*' => 'file|max:10240', // 10 MB per file
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors(),
            ], 422);
        }

        // Determine message type based on content
        $hasAttachments = $request->hasFile('attachments');
        $hasText = !empty($request->input('body'));
        
        if ($hasAttachments && !$hasText) {
            $type = 'file'; // Will be updated to 'image' if all files are images
        } elseif ($hasAttachments && $hasText) {
            $type = 'text'; // Text with attachments
        } else {
            $type = 'text';
        }

        // Create the message first
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $user->id,
            'body'            => $request->input('body', ''),
            'type'            => $type,
        ]);

        // Handle file attachments if present
        $attachments = [];
        if ($hasAttachments) {
            $allImages = true;
            $uploadedFiles = [];

            foreach ($request->file('attachments') as $file) {
                if (!$file->isValid()) {
                    continue;
                }

                // Generate unique filename
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('messaging/attachments', $filename, 'public');

                // Check if it's an image
                $isImage = str_starts_with($file->getMimeType(), 'image/');
                if (!$isImage) {
                    $allImages = false;
                }

                // Calculate file hash for deduplication
                $fileHash = hash_file('sha256', $file->getPathname());

                // Prepare metadata
                $metadata = [];
                if ($isImage) {
                    try {
                        $imageInfo = getimagesize($file->getPathname());
                        if ($imageInfo) {
                            $metadata['width'] = $imageInfo[0];
                            $metadata['height'] = $imageInfo[1];
                        }
                    } catch (\Exception $e) {
                        // Ignore image dimension errors
                    }
                }

                // Create attachment record
                $attachment = $message->attachments()->create([
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'file_hash' => $fileHash,
                    'metadata' => $metadata,
                ]);

                $uploadedFiles[] = [
                    'id' => $attachment->id,
                    'file_url' => $attachment->file_url,
                    'original_name' => $attachment->original_name,
                    'mime_type' => $attachment->mime_type,
                    'file_size' => $attachment->file_size,
                    'file_size_formatted' => $attachment->file_size_formatted,
                    'is_image' => $attachment->is_image,
                    'file_extension' => $attachment->file_extension,
                ];
            }

            // Update message type if all files are images
            if ($allImages && !$hasText) {
                $message->update(['type' => 'image']);
            }

            $attachments = $uploadedFiles;
        }

        // Update the conversation's last_message_at for ordering
        $conversation->update(['last_message_at' => now()]);

        // Mark as read for sender immediately
        $conversation->participants()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);

        // ✅ Unarchive conversation for ALL participants when a new message is sent.
        // Mirrors Messenger behaviour — archived chats resurface on new activity
        // so nobody misses a message just because they previously archived it.
        DB::table('conversation_participants')
            ->where('conversation_id', $conversation->id)
            ->where('is_archived', true)
            ->update(['is_archived' => false]);

        // Load relationships for response
        $message->load('sender:id,first_name,last_name,avatar,role');
        $message->load('attachments');

        // Format response
        $response = $this->formatMessage($message);
        $response['attachments'] = $attachments;

        return response()->json($response, 201);
    }

    /**
     * Soft-delete a message (sender only).
     *
     * DELETE /messages/{conversation}/messages/{message}
     */
    public function destroy(Request $request, Conversation $conversation, Message $message): JsonResponse
    {
        $this->authorizeParticipant($conversation, $request->user()->id);
        abort_unless(
            $message->sender_id === $request->user()->id,
            403,
            'You can only delete your own messages.'
        );

        $message->delete();

        return response()->json(['ok' => true]);
    }

    /**
     * Explicitly mark all messages in a conversation as read.
     *
     * POST /messages/{conversation}/read
     */
    public function markRead(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeParticipant($conversation, $request->user()->id);

        $conversation->participants()->updateExistingPivot($request->user()->id, [
            'last_read_at' => now(),
        ]);

        return response()->json(['ok' => true]);
    }

    /**
     * Download message attachment.
     *
     * GET /messages/{conversation}/messages/{message}/download
     */
    public function downloadAttachment(Request $request, Conversation $conversation, Message $message): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $this->authorizeParticipant($conversation, $request->user()->id);

        abort_unless($message->attachment_path, 404, 'Attachment not found.');

        $filePath = storage_path('app/public/' . $message->attachment_path);
        abort_unless(file_exists($filePath), 404, 'Attachment file not found.');

        return response()->download($filePath, $message->attachment_name, [
            'Content-Type' => $message->attachment_mime ?? 'application/octet-stream',
        ]);
    }

    /* ── Private helpers ───────────────────────────────────────────────── */

    private function authorizeParticipant(Conversation $conversation, int $userId): void
    {
        abort_unless(
            $conversation->participants()
                ->where('user_id', $userId)
                ->exists(),
            403,
            'You are not part of this conversation.'
        );
    }

    private function formatMessage(Message $m): array
    {
        return [
            'id'              => $m->id,
            'conversation_id' => $m->conversation_id,
            'sender_id'       => $m->sender_id,
            'body'            => $m->body,
            'type'            => $m->type,
            'attachment_url'  => $m->attachment_url,
            'attachment_name' => $m->attachment_name,
            'has_attachments' => $m->has_attachments,
            'attachments'     => $m->attachments->map(function ($attachment) {
                return [
                    'id' => $attachment->id,
                    'file_url' => $attachment->file_url,
                    'original_name' => $attachment->original_name,
                    'mime_type' => $attachment->mime_type,
                    'file_size' => $attachment->file_size,
                    'file_size_formatted' => $attachment->file_size_formatted,
                    'is_image' => $attachment->is_image,
                    'file_extension' => $attachment->file_extension,
                ];
            }),
            'created_at'      => $m->created_at->toISOString(),
            'sender'          => [
                'id'         => $m->sender->id,
                'first_name' => $m->sender->first_name,
                'last_name'  => $m->sender->last_name,
                'avatar'     => $m->sender->avatar,
                'role'       => $m->sender->role,
            ],
        ];
    }
}