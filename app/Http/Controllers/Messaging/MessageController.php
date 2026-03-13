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
     * Supports plain text + optional file/image attachment.
     *
     * POST /messages/{conversation}/send
     */
    public function send(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();
        $this->authorizeParticipant($conversation, $user->id);

        // Check if user is blocked by any participant
        $otherParticipant = $conversation->otherParticipant($user->id);
        if ($otherParticipant && !$user->canMessage($otherParticipant)) {
            return response()->json([
                'error' => 'You cannot message this user.',
                'reason' => $user->hasBlocked($otherParticipant) 
                    ? 'You have blocked this user.' 
                    : 'This user has blocked you.',
            ], 403);
        }


        try {
            $request->validate([
                'body'       => 'required_without:attachment|nullable|string|max:5000',
                'attachment' => 'nullable|file|max:10240', // 10 MB
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors(),
            ], 422);
        }

        $attachmentPath = null;
        $attachmentName = null;
        $attachmentMime = null;
        $type = 'text';

        if ($request->hasFile('attachment')) {
            $file           = $request->file('attachment');
            $attachmentPath = $file->store('messaging/attachments', 'public');
            $attachmentName = $file->getClientOriginalName();
            $attachmentMime = $file->getMimeType();
            $type           = str_starts_with($attachmentMime, 'image/') ? 'image' : 'file';
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $user->id,
            'body'            => $request->input('body', ''),
            'type'            => $type,
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
            'attachment_mime' => $attachmentMime,
        ]);

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

        $message->load('sender:id,first_name,last_name,avatar,role');

        return response()->json($this->formatMessage($message), 201);
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