<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user()->load('employerProfile');

        // Mark verification notification as read when they visit dashboard
        $user->unreadNotifications()
            ->where('type', 'App\Notifications\EmployerVerifiedNotification')
            ->update(['read_at' => now()]);

        return Inertia::render('Employer/Dashboard', [
            'user'            => $user,
            'profile'         => $user->employerProfile,
            'profileComplete' => $user->profile_completed,
            'isVerified'      => $user->employerProfile?->is_verified ?? false,
            'justVerified'    => $user->notifications()
                ->where('type', 'App\Notifications\EmployerVerifiedNotification')
                ->whereNull('read_at')
                ->exists(),
            // true when employer registered via Google and hasn't set a phone yet
            'needsPhone'      => (bool) ($user->google_id && !$user->phone),
        ]);
    }
}