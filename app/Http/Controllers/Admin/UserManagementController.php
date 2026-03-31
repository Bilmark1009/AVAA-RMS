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
            ->leftJoin('employer_profiles', 'users.id', '=', 'employer_profiles.user_id')
            ->with(['jobSeekerProfile:user_id,skills,professional_title,current_job_title,profile_frame,open_to_work', 'employerProfile:user_id,company_name'])
            ->select('users.*', 'employer_profiles.company_name as profile_company_name')
            ->selectRaw("(
                EXISTS (
                    SELECT 1
                    FROM job_applications ja
                    WHERE ja.user_id = users.id
                      AND ja.hired_at IS NOT NULL
                      AND ja.contract_ended_at IS NULL
                )
                OR EXISTS (
                    SELECT 1
                    FROM work_experiences we
                    WHERE we.user_id = users.id
                      AND we.is_current = 1
                      AND (we.job_title IS NULL OR LOWER(we.job_title) <> 'status update')
                )
            ) as currently_working")
            ->selectSub(function ($query) {
                $query->selectRaw('COUNT(*)')
                    ->from('job_applications')
                    ->join('job_listings', 'job_applications.job_listing_id', '=', 'job_listings.id')
                    ->whereRaw('job_listings.employer_id = users.id');
            }, 'job_applications_count')
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
     * Also handles reactivating banned users.
     */
    public function updateStatus(User $user): \Illuminate\Http\RedirectResponse
    {
        abort_if($user->role === 'admin', 403, 'Cannot change admin status.');

        $wasBanned = $user->status === 'banned';
        $newStatus = $user->status === 'active' ? 'inactive' : 'active';

        $user->update(['status' => $newStatus]);

        $message = $wasBanned
            ? 'User account has been reactivated. The ban has been lifted.'
            : 'User status updated.';

        return back()->with('success', $message);
    }
}
