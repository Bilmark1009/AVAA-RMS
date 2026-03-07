<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|string|email|max:255|unique:users',
            'phone'                 => 'required|string|max:20',
            'password'              => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
            'role'     => 'employer',
        ]);

        event(new Registered($user));
        Auth::login($user);

        return redirect()->route('employer.dashboard');
    }

    // Store job seeker
    public function storeJobSeeker(Request $request): RedirectResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'phone'    => 'required|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
            'role'     => 'job_seeker',
        ]);

        event(new Registered($user));
        Auth::login($user);

        return redirect()->route('job-seeker.dashboard');
    }
}