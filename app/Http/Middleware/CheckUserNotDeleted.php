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

            if ($fresh && ($fresh->trashed() || $fresh->status === 'inactive')) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')
                    ->with('error', 'Your account has been deactivated. Please contact the administrator.');
            }
        }

        return $next($request);
    }
}
