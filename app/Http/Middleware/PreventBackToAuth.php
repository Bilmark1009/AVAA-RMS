<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PreventBackToAuth
{
    /**
     * Guest/auth page paths that authenticated users should never see.
     */
    protected array $guestPaths = [
        '/',
        '/login',
        '/register',
        '/register/employer',
        '/register/job-seeker',
        '/forgot-password',
        '/reset-password',
        '/auth/google',
        '/auth/google/callback',
        '/auth/google/select-role',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && $this->isGuestPage($request)) {
            $response = redirect()->route($this->getDashboardRoute(Auth::user()));
            $this->setNoCacheHeaders($response);
            return $response;
        }

        $response = $next($request);

        // Set no-cache on ALL pages so bfcache won't show stale pages
        // (login page after login, or dashboard after logout).
        $this->setNoCacheHeaders($response);

        return $response;
    }

    protected function isGuestPage(Request $request): bool
    {
        $path = '/' . ltrim($request->path(), '/');

        foreach ($this->guestPaths as $guestPath) {
            if ($path === $guestPath || str_starts_with($path, $guestPath . '/')) {
                return true;
            }
        }

        return false;
    }

    protected function getDashboardRoute($user): string
    {
        return $user->getDashboardRoute();
    }

    protected function setNoCacheHeaders($response): void
    {
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');
    }
}
