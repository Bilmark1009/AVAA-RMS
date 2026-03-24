<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserNotDeleted
{
    /**
     * Handle an incoming request.
     * If the currently authenticated user has been soft-deleted by an admin,
     * log them out immediately and redirect to login with an error message.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            /** @var \App\Models\User $user */
            $user = Auth::user();

            // withTrashed() is needed because the default scope excludes deleted rows.
            // We re-fetch from DB to ensure we see the latest deleted_at value.
            $fresh = \App\Models\User::withTrashed()->find($user->id);

            if ($fresh && ($fresh->trashed() || $fresh->status === 'inactive' || $fresh->status === 'banned')) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                $message = $fresh->status === 'banned'
                    ? 'Your account has been permanently banned due to policy violations. Please contact support for appeal inquiries.'
                    : 'Your account has been deactivated. Please contact the administrator.';

                return redirect()->route('login')
                    ->with('error', $message);
            }

            // Allow suspended users to access appeal-related routes
            if ($fresh && $fresh->status === 'suspended') {
                $currentRoute = $request->route();
                if ($currentRoute) {
                    $routeName = $currentRoute->getName();
                    // Allow access to appeal routes and basic employer dashboard
                    if (str_contains($routeName, 'appeals') || 
                        str_contains($routeName, 'employer.jobs.index') ||
                        str_contains($routeName, 'employer.jobs.show') ||
                        $routeName === 'employer.dashboard') {
                        return $next($request);
                    }
                }

                // For other routes, redirect to dashboard with suspension message
                return redirect()->route('employer.dashboard')
                    ->with('error', 'Your account is temporarily suspended. You can only access appeal functionality during this period.');
            }
        }

        return $next($request);
    }
}
