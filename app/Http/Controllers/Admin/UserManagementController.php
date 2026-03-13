<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * List users with optional search / role / status filters.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $role = $request->input('role', 'all'); // default to all users
        $status = $request->input('status', 'all');      // all | active | inactive

        $query = User::withTrashed()  // ← include soft-deleted so admin can see & restore them
            ->where('role', '!=', 'admin')
            ->when($role && $role !== 'all', fn($q) => $q->where('role', $role))
            ->when($search, function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($status === 'active', fn($q) => $q->whereNull('deleted_at')->where('status', 'active'))
            ->when($status === 'inactive', fn($q) => $q->where(function ($inner) {
                // Inactive = soft-deleted OR status != active
                $inner->whereNotNull('deleted_at')
                    ->orWhere('status', '!=', 'active');
            }))
            ->with(['jobSeekerProfile:user_id,skills', 'employerProfile:user_id,company_name'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Users', [
            'users' => $query,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Soft-delete a user.
     */
    public function destroy(User $user): \Illuminate\Http\RedirectResponse
    {
        abort_if($user->role === 'admin', 403, 'Cannot delete an admin account.');

        $user->delete(); // soft delete — sets deleted_at

        return back()->with('success', 'User has been deactivated successfully.');
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore(int $id): \Illuminate\Http\RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        abort_if($user->role === 'admin', 403);

        $user->restore();
        $user->update(['status' => 'active']);

        return back()->with('success', 'User account has been restored.');
    }

    /**
     * Toggle user status between active / inactive.
     */
    public function updateStatus(User $user): \Illuminate\Http\RedirectResponse
    {
        abort_if($user->role === 'admin', 403, 'Cannot change admin status.');

        $user->update([
            'status' => $user->status === 'active' ? 'inactive' : 'active',
        ]);

        return back()->with('success', 'User status updated.');
    }
}
