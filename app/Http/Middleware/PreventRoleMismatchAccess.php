<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PreventRoleMismatchAccess
{
    /**
     * Map each role to the URL prefix it owns.
     */
    protected array $rolePrefixes = [
        'admin' => '/admin',
        'employer' => '/employer',
        'job_seeker' => '/job-seeker',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();
        $path = '/' . ltrim($request->path(), '/');

        foreach ($this->rolePrefixes as $role => $prefix) {
            // If the path belongs to a role prefix that isn't the current user's role
            if (
                $role !== $user->role &&
                (str_starts_with($path, $prefix . '/') || $path === $prefix)
            ) {
                return redirect()->route($user->getDashboardRoute());
            }
        }

        return $next($request);
    }
}
