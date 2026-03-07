<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user() || $request->user()->role !== $role) {
            $user = $request->user();
            if ($user) {
                // Redirect to their correct dashboard instead of a blank 403
                return redirect()->route($user->getDashboardRoute());
            }
            return redirect()->route('login');
        }

        return $next($request);
    }
}