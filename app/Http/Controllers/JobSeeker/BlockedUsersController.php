<?php

namespace App\Http\Controllers\JobSeeker;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class BlockedUsersController extends Controller
{
    /**
     * Display the blocked users management page for job seekers.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        return Inertia::render('JobSeeker/Settings/BlockedUsers', [
            'blockedUsers' => $user->blockedUsers()
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
                        'initials' => strtoupper(($user->first_name[0] ?? '') . ($user->last_name[0] ?? '')),
                        'company_name' => $user->employerProfile?->company_name ?? 'Employer',
                    ];
                }),
        ]);
    }

    /**
     * Block an employer (AJAX).
     */
    public function block(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'reason' => 'nullable|string|max:500',
        ]);

        $current = $request->user();
        $target = User::findOrFail($request->user_id);

        abort_if($current->id === $target->id, 422, 'You cannot block yourself.');
        abort_if($target->role !== 'employer', 422, 'Job seekers can only block employers.');

        $block = $current->block($target, $request->reason);

        // Archive any existing conversations between these users
        $conversation = \App\Models\Conversation::findDirect($current->id, $target->id);
        if ($conversation) {
            $conversation->participants()->updateExistingPivot($current->id, [
                'is_archived' => true,
            ]);
        }

        return response()->json([
            'success' => true,
            'blocked_user' => [
                'id' => $target->id,
                'name' => $target->full_name,
                'avatar' => $target->avatar,
                'role' => $target->role,
                'reason' => $block->reason,
                'blocked_at' => $block->created_at->toISOString(),
                'initials' => strtoupper(($target->first_name[0] ?? '') . ($target->last_name[0] ?? '')),
                'company_name' => $target->employerProfile?->company_name ?? 'Employer',
            ],
        ]);
    }

    /**
     * Unblock an employer (AJAX).
     */
    public function unblock(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $current = $request->user();
        $target = User::findOrFail($request->user_id);

        abort_if($current->id === $target->id, 422, 'You cannot unblock yourself.');

        $success = $current->unblock($target);

        return response()->json([
            'success' => $success,
            'unblocked_user_id' => $target->id,
        ], 200, [], JSON_PRETTY_PRINT);
    }

    /**
     * Search for employers to block (AJAX).
     */
    public function searchUsers(Request $request): JsonResponse
    {
        $current = $request->user();
        $q = trim($request->query('q', ''));

        $users = User::where('role', 'employer')
            ->where('id', '!=', $current->id)
            ->where(function ($query) use ($q) {
                if ($q !== '') {
                    $query->where('email', 'like', "%{$q}%");
                }
            })
            ->whereNotIn('id', function ($query) use ($current) {
                // Exclude users that current user has already blocked
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
            ->with('employerProfile:user_id,company_name')
            ->limit(10)
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->full_name,
                'email' => $u->email,
                'avatar' => $u->avatar,
                'initials' => strtoupper(($u->first_name[0] ?? '') . ($u->last_name[0] ?? '')),
                'role' => $u->role,
                'company_name' => $u->employerProfile?->company_name ?? 'Employer',
            ]);

        return response()->json($users);
    }
}
