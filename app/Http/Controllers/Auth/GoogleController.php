<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    // Step 1: Redirect to Google
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    // Step 2: Handle Google callback
    public function callback(Request $request): RedirectResponse|Response
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect()->route('login')
                ->with('error', 'Google authentication failed. Please try again.');
        }

        // Check if user already exists by google_id or email
        $existingUser = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($existingUser) {
            // Update google_id, avatar and last login
            $existingUser->update([
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'last_login_at' => now(),
                'email_verified_at' => $existingUser->email_verified_at ?? now(),
            ]);

            Auth::login($existingUser, true);

            return redirect()->route($existingUser->getDashboardRoute());
        }

        // New user — store Google data in session and show role selection
        $request->session()->put('google_user', [
            'google_id' => $googleUser->getId(),
            'name' => $googleUser->getName(),
            'email' => $googleUser->getEmail(),
            'avatar' => $googleUser->getAvatar(),
        ]);

        return redirect()->route('auth.google.role');
    }

    // Step 3: Show role selection page
    public function showRoleSelect(Request $request): Response|RedirectResponse
    {
        // If no Google session data, redirect back to login
        if (!$request->session()->has('google_user')) {
            return redirect()->route('login')
                ->with('error', 'Session expired. Please try signing in with Google again.');
        }

        $googleUser = $request->session()->get('google_user');

        return Inertia::render('Auth/GoogleRoleSelection', [
            'googleName' => $googleUser['name'],
            'googleEmail' => $googleUser['email'],
            'googleAvatar' => $googleUser['avatar'],
        ]);
    }

    // Step 4: Create user with chosen role
    public function storeWithRole(Request $request): RedirectResponse
    {
        $request->validate([
            'role' => 'required|in:employer,job_seeker',
        ]);

        // Guard against missing session
        if (!$request->session()->has('google_user')) {
            return redirect()->route('login')
                ->with('error', 'Session expired. Please try signing in with Google again.');
        }

        $googleUser = $request->session()->get('google_user');

        // Guard against duplicate email (race condition)
        if (User::where('email', $googleUser['email'])->exists()) {
            $request->session()->forget('google_user');
            return redirect()->route('login')
                ->with('error', 'An account with this email already exists. Please log in.');
        }

        $user = User::create([
            'name' => $googleUser['name'],
            'email' => $googleUser['email'],
            'google_id' => $googleUser['google_id'],
            'avatar' => $googleUser['avatar'],
            'password' => bcrypt(Str::random(32)), // random unusable password
            'role' => $request->role,
            'email_verified_at' => now(), // Google emails are pre-verified
            'last_login_at' => now(),
        ]);

        $request->session()->forget('google_user');

        Auth::login($user, true);

        return redirect()->route($user->getDashboardRoute());
    }
}