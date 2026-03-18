<?php

namespace App\Http\Controllers\Messaging;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlockController extends Controller
{
    /**
     * Block a user.
     * POST /messages/block/{user}
     */
    public function block(Request $request, User $user): JsonResponse
    {
        $current = $request->user();
        
        abort_if($current->id === $user->id, 422, 'You cannot block yourself.');

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $block = $current->block($user, $request->reason);

        $block = $current->block($user, $request->reason);

        return response()->json([
            'ok' => true,
            'blocked_user' => [
                'id' => $user->id,
                'name' => $user->full_name,
            ],
        ]);
    }

    /**
     * Unblock a user.
     * DELETE /messages/block/{user}
     */
    public function unblock(Request $request, User $user): JsonResponse
    {
        $current = $request->user();
        
        abort_if($current->id === $user->id, 422, 'You cannot unblock yourself.');

        $success = $current->unblock($user);

        return response()->json([
            'ok' => $success,
            'unblocked_user' => [
                'id' => $user->id,
                'name' => $user->full_name,
            ],
        ]);
    }

    /**
     * Get list of blocked users.
     * GET /messages/blocked
     */
    public function index(Request $request): JsonResponse
    {
        $current = $request->user();

        $blockedUsers = $current->blockedUsers()
            ->with('blockedUser:id,first_name,last_name,avatar,role')
            ->latest()
            ->get()
            ->map(function ($block) {
                $user = $block->blockedUser;
                return [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'avatar' => $user->avatar,
                    'role' => $user->role,
                    'reason' => $block->reason,
                    'blocked_at' => $block->created_at->toISOString(),
                ];
            });

        return response()->json($blockedUsers);
    }

    /**
     * Check if a user is blocked.
     * GET /messages/block/{user}/check
     */
    public function check(Request $request, User $user): JsonResponse
    {
        $current = $request->user();

        return response()->json([
            'is_blocked' => $current->hasBlocked($user),
            'is_blocked_by' => $current->isBlockedBy($user),
            'can_message' => $current->canMessage($user),
        ]);
    }
}
