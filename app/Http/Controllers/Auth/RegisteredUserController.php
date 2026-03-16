<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\AdminNewUserRegisteredNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    // Step 1: Role selection page
    public function showRoleSelection(): Response
    {
        return Inertia::render('Auth/RoleSelection');
    }

    // Step 2a: Employer registration form
    public function createEmployer(): Response
    {
        return Inertia::render('Auth/RegisterEmployer');
    }

    // Step 2b: Job Seeker registration form
    public function createJobSeeker(): Response
    {
        return Inertia::render('Auth/RegisterJobSeeker');
    }

    // Store employer
    public function storeEmployer(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'terms'      => 'accepted',
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'username' => $request->username,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'employer',
        ]);

        event(new Registered($user));
        Auth::login($user);

        // Notify all admins
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new AdminNewUserRegisteredNotification($user));
        }

        return redirect()->route('employer.dashboard');
    }

    // Store job seeker
    public function storeJobSeeker(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'username' => $request->username,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'job_seeker',
        ]);

        event(new Registered($user));
        Auth::login($user);

        // Notify all admins
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new AdminNewUserRegisteredNotification($user));
        }

        return redirect()->route('job-seeker.jobs.browse');
    }
}