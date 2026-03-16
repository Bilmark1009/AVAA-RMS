<?php

namespace App\Http\Controllers\Messaging;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\JobListing;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    /**
     * Main messaging page — all conversations for the current user.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $showArchived = $request->query('archived', false);

        return Inertia::render('Messaging/Index', [
            'conversations' => $this->getConversations($user, $showArchived),
            'activeConversationId' => null,
            'initialMessages' => [],
            'activeConversation' => null,
            'showArchived' => $showArchived,
        ]);
    }

    /**
     * Show a specific conversation and load its messages.
     * If the conversation no longer exists or the user is not a participant,
     * redirect gracefully to the messages index instead of throwing 404/403.
     */
    public function show(Request $request, Conversation $conversation): Response|RedirectResponse
    {
        $user = $request->user();

        // ✅ If user is not a participant, redirect instead of aborting with 403
        $isParticipant = $conversation->participants()
            ->where('user_id', $user->id)
            ->exists();

        if (!$isParticipant) {
            return redirect()->route('messages.index');
        }

        // Mark all messages as read for this user
        $conversation->participants()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);

        // Get cleared_at for this user so we only show messages after it
        $clearedAt = $conversation->participants
            ->firstWhere('id', $user->id)?->pivot?->cleared_at;

        $messages = $this->getMessages($conversation, $clearedAt);

        return Inertia::render('Messaging/Index', [
            'conversations' => $this->getConversations($user),
            'activeConversationId' => $conversation->id,
            'initialMessages' => $messages,
            'activeConversation' => $this->formatConversation($conversation, $user->id),
        ]);
    }

    /**
     * Start or open a direct conversation with another user.
     * Enforces: employer ↔ job_seeker only.
     */
    public function start(Request $request): RedirectResponse
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $current = $request->user();
        $target = User::findOrFail($request->user_id);

        $this->enforceRolePair($current, $target);

        // Check if users can message each other
        if (!$current->canMessage($target)) {
            return back()->with('error', 'You cannot start a conversation with this user.');
        }

        $conversation = Conversation::findOrCreateDirect($current, $target);

        // Make sure current user is a participant (handles edge cases)
        $isParticipant = $conversation->participants()
            ->where('user_id', $current->id)
            ->exists();

        if (!$isParticipant) {
            $conversation->participants()->attach($current->id);
        }

        return redirect()->route('messages.show', $conversation->id);
    }

    /**
     * Archive a conversation for the current user (JSON).
     */
    public function archive(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeParticipant($conversation, $request->user()->id);

        $conversation->participants()->updateExistingPivot($request->user()->id, [
            'is_archived' => true,
        ]);

        return response()->json(['ok' => true]);
    }

    /**
     * Unarchive a conversation for the current user (JSON).
     */
    public function unarchive(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeParticipant($conversation, $request->user()->id);

        $conversation->participants()->updateExistingPivot($request->user()->id, [
            'is_archived' => false,
        ]);

        return response()->json(['ok' => true]);
    }

    /**
     * Toggle mute for the current user in a conversation (JSON).
     */
    public function toggleMute(Request $request, Conversation $conversation): JsonResponse
    {
        $userId = $request->user()->id;
        $this->authorizeParticipant($conversation, $userId);

        $pivot = $conversation->participants->firstWhere('id', $userId)?->pivot;
        $nowMuted = !($pivot?->is_muted ?? false);

        $conversation->participants()->updateExistingPivot($userId, [
            'is_muted' => $nowMuted,
        ]);

        return response()->json(['ok' => true, 'is_muted' => $nowMuted]);
    }

    /**
     * Start a group conversation (employer only).
     * POST body: { name: string, participant_ids: number[] }
     */
    public function startGroup(Request $request): RedirectResponse
    {
        $current = $request->user();
        abort_unless($current->role === 'employer', 403, 'Only employers can create group chats.');

        $request->validate([
            'name' => 'required|string|max:100',
            'participant_ids' => 'required|array|min:1',
            'participant_ids.*' => 'exists:users,id',
        ]);

        $conversation = Conversation::create([
            'type' => 'group',
            'name' => $request->name,
        ]);

        // Attach the employer (creator)
        $conversation->participants()->attach($current->id);

        // Attach selected participants (excluding self)
        $participantIds = collect($request->participant_ids)
            ->filter(fn($id) => (int) $id !== $current->id)
            ->unique()
            ->all();
        $conversation->participants()->attach($participantIds);

        return redirect()->route('messages.show', $conversation->id);
    }

    /**
     * Messenger-style delete: clear this user's view of the conversation.
     * Messages before now() become invisible; conversation reappears if new messages arrive.
     */
    public function destroy(Request $request, Conversation $conversation): JsonResponse
    {
        $userId = $request->user()->id;

        $isParticipant = $conversation->participants()
            ->where('user_id', $userId)
            ->exists();

        if ($isParticipant) {
            $conversation->participants()->updateExistingPivot($userId, [
                'cleared_at' => now(),
            ]);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Hard-delete a group conversation for everyone (employer/creator only).
     * DELETE /messages/group/{conversation}
     */
    public function destroyGroup(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        abort_unless($conversation->type === 'group', 403, 'Only group conversations can be hard-deleted.');
        abort_unless($user->role === 'employer', 403, 'Only employers can delete group chats.');

        $isParticipant = $conversation->participants()
            ->where('user_id', $user->id)
            ->exists();
        abort_unless($isParticipant, 403, 'You are not part of this conversation.');

        // ✅ Use Message model directly so SoftDeletes::forceDelete() works correctly
        Message::withTrashed()
            ->where('conversation_id', $conversation->id)
            ->forceDelete();

        $conversation->participants()->detach();
        $conversation->delete();

        return response()->json(['ok' => true]);
    }

    /**
     * Get archived conversations count for the current user (JSON).
     */
    public function archivedCount(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user->id;

        $count = Conversation::whereHas('participants', fn($q) => $q->where('user_id', $userId))
            ->whereHas('participants', fn($q) => $q->where('user_id', $userId)->where('is_archived', true))
            ->count();

        return response()->json(['count' => $count]);
    }

    public function debug(Request $request): JsonResponse
    {
        $current = $request->user();
        $targetId = $request->query('user_id');

        $target = User::find($targetId);

        $existing = Conversation::where('type', 'direct')
            ->whereHas('participants', fn($q) => $q->where('user_id', $current->id))
            ->whereHas('participants', fn($q) => $q->where('user_id', $targetId))
            ->with('participants')
            ->first();

        $pivots = null;
        if ($existing) {
            $pivots = $existing->participants->map(fn($p) => [
                'user_id' => $p->id,
                'name' => $p->first_name . ' ' . $p->last_name,
                'left_at' => $p->pivot->left_at,
                'is_archived' => $p->pivot->is_archived,
            ]);
        }

        return response()->json([
            'current_user' => ['id' => $current->id, 'role' => $current->role],
            'target_user' => $target ? ['id' => $target->id, 'role' => $target->role] : null,
            'conversation_found' => $existing ? $existing->id : null,
            'participant_pivots' => $pivots,
        ]);
    }

    /* ── Private helpers ───────────────────────────────────────────────── */

    private function getConversations(User $user, bool $showArchived = false): array
    {
        $userId = $user->id;

        return Conversation::whereHas(
            'participants',
            fn($q) => $q->where('user_id', $userId)
        )
            ->with([
                'participants:id,first_name,last_name,avatar,role',
                'latestMessage.sender:id,first_name,last_name',
                'jobListing:id,title',
            ])
            ->orderByDesc('last_message_at')
            ->get()
            ->filter(function (Conversation $c) use ($userId, $showArchived) {
                $pivot = $c->participants->firstWhere('id', $userId)?->pivot;
                $isArchived = (bool) ($pivot?->is_archived ?? false);
                
                // Filter based on archived status
                if ($showArchived) {
                    // For archived view, only check if archived, ignore cleared_at
                    return $isArchived;
                } else {
                    // For normal view, exclude archived and check cleared_at
                    if ($isArchived) return false;
                    
                    $clearedAt = $pivot?->cleared_at;

                    // If never cleared, always show
                    if (!$clearedAt) return true;

                    // Show only if there are messages AFTER cleared_at
                    return $c->messages()
                        ->whereNull('deleted_at')
                        ->where('created_at', '>', $clearedAt)
                        ->exists();
                }
            })
            ->map(fn($c) => $this->formatConversation($c, $userId))
            ->values()
            ->all();
    }

    private function getMessages(Conversation $conversation, ?string $clearedAt = null): array
    {
        return $conversation->messages()
            ->with('sender:id,first_name,last_name,avatar,role')
            ->whereNull('deleted_at')
            ->when($clearedAt, fn($q) => $q->where('created_at', '>', $clearedAt))
            ->orderBy('created_at')
            ->get()
            ->map(fn($m) => [
                'id' => $m->id,
                'conversation_id' => $m->conversation_id,
                'sender_id' => $m->sender_id,
                'body' => $m->body,
                'type' => $m->type,
                'attachment_url' => $m->attachment_url,
                'attachment_name' => $m->attachment_name,
                'created_at' => $m->created_at->toISOString(),
                'sender' => [
                    'id' => $m->sender->id,
                    'first_name' => $m->sender->first_name,
                    'last_name' => $m->sender->last_name,
                    'avatar' => $m->sender->avatar,
                    'role' => $m->sender->role,
                ],
            ])
            ->all();
    }

    public function searchUsers(Request $request): JsonResponse
    {
        $current = $request->user();
        $q = trim($request->query('q', ''));

        $targetRole = $current->role === 'employer' ? 'job_seeker' : 'employer';

        $users = User::where('role', $targetRole)
            ->where('id', '!=', $current->id)
            ->where(function ($query) use ($q) {
                if ($q !== '') {
                    $query->where('email', 'like', "%{$q}%");
                }
            })
            ->whereNotIn('id', function ($query) use ($current) {
                // Exclude users that current user has blocked
                $query->select('blocked_user_id')
                    ->from('blocked_users')
                    ->where('blocker_id', $current->id);
            })
            ->whereNotIn('id', function ($query) use ($current) {
                // Exclude users that have blocked current user
                $query->select('blocker_id')
                    ->from('blocked_users')
                    ->where('blocked_user_id', $current->id);
            })
            ->with([
                'jobSeekerProfile:user_id,professional_title,current_job_title',
                'employerProfile:user_id,company_name',
            ])
            ->limit(20)
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => "{$u->first_name} {$u->last_name}",
                'email' => $u->email,
                'avatar' => $u->avatar,
                'initials' => strtoupper(($u->first_name[0] ?? '') . ($u->last_name[0] ?? '')),
                'role' => $u->role,
                'subtitle' => $u->role === 'job_seeker'
                    ? ($u->jobSeekerProfile?->professional_title
                        ?? $u->jobSeekerProfile?->current_job_title
                        ?? 'Job Seeker')
                    : ($u->employerProfile?->company_name ?? 'Employer'),
            ]);

        return response()->json($users);
    }

    public function formatConversation(Conversation $c, int $currentUserId): array
    {
        $other = $c->type === 'direct'
            ? $c->otherParticipant($currentUserId)
            : null;

        $pivot = $c->participants->firstWhere('id', $currentUserId)?->pivot;
        
        // Check blocking status
        $isBlocked = false;
        $isBlockedByOther = false;
        if ($other) {
            $currentUser = \App\Models\User::find($currentUserId);
            $isBlocked = $currentUser->hasBlocked($other);
            $isBlockedByOther = $currentUser->isBlockedBy($other);
        }

        return [
            'id' => $c->id,
            'type' => $c->type,
            'name' => $c->type === 'group'
                ? ($c->name ?? 'Group Chat')
                : ($other ? "{$other->first_name} {$other->last_name}" : 'Unknown'),
            'avatar' => $other?->avatar,
            'initials' => $other
                ? strtoupper(($other->first_name[0] ?? '') . ($other->last_name[0] ?? ''))
                : strtoupper(substr($c->name ?? 'G', 0, 2)),
            'other_user' => $other ? [
                'id' => $other->id,
                'first_name' => $other->first_name,
                'last_name' => $other->last_name,
                'role' => $other->role,
                'avatar' => $other->avatar,
            ] : null,
            'participants' => $c->participants->map(fn($p) => [
                'id' => $p->id,
                'first_name' => $p->first_name,
                'last_name' => $p->last_name,
                'avatar' => $p->avatar,
                'role' => $p->role,
            ])->values()->all(),
            'latest_message' => $c->latestMessage ? [
                'body' => $c->latestMessage->body,
                'sender_id' => $c->latestMessage->sender_id,
                'created_at' => $c->latestMessage->created_at?->toISOString(),
            ] : null,
            'unread_count' => $c->unreadCountFor($currentUserId),
            'is_archived' => (bool) ($pivot?->is_archived ?? false),
            'is_muted' => (bool) ($pivot?->is_muted ?? false),
            'is_blocked' => $isBlocked,
            'is_blocked_by_other' => $isBlockedByOther,
            'last_message_at' => $c->last_message_at?->toISOString(),
            'job_listing' => $c->jobListing
                ? ['id' => $c->jobListing->id, 'title' => $c->jobListing->title]
                : null,
        ];
    }

    private function authorizeParticipant(Conversation $conversation, int $userId): void
    {
        $exists = $conversation->participants()
            ->where('user_id', $userId)
            ->exists();

        abort_unless($exists, 403, 'You are not part of this conversation.');
    }

    private function enforceRolePair(User $a, User $b): void
    {
        $roles = [$a->role, $b->role];
        abort_unless(
            in_array('employer', $roles) && in_array('job_seeker', $roles),
            403,
            'Messaging is only allowed between employers and job seekers.'
        );
    }
}