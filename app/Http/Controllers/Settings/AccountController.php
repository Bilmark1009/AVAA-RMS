<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        $profileFrame = null;
        if ($user->role === 'job_seeker') {
            $user->loadMissing('jobSeekerProfile');
            $profileFrame = optional($user->jobSeekerProfile)->profile_frame ?? 'default';
        }

        return Inertia::render('Settings/Account', [
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'status' => session('status'),
            'user' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'username' => $user->username,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'email_verified_at' => $user->email_verified_at,
                'google_id' => $user->google_id,
                'role' => $user->role,
                'profile_frame' => $profileFrame,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $isFrameOnlyUpdate = $user->role === 'job_seeker'
            && $request->has('profile_frame')
            && !$request->hasAny(['first_name', 'last_name', 'email', 'username', 'phone']);

        if ($isFrameOnlyUpdate) {
            $validated = $request->validate([
                'profile_frame' => ['nullable', 'string', 'in:default,open_to_work,not_open_to_work'],
            ]);

            $frame = $validated['profile_frame'] ?? 'default';

            $user->jobSeekerProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'profile_frame' => $frame,
                    'open_to_work' => $frame === 'open_to_work',
                ]
            );

            return back()->with('status', 'account-updated');
        }

        $rules = [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'username' => ['nullable', 'string', 'max:50', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
        ];

        if ($user->role === 'job_seeker') {
            $rules['profile_frame'] = ['nullable', 'string', 'in:default,open_to_work,not_open_to_work'];
        }

        $validated = $request->validate($rules);

        // Force re-verification if email changed
        if ($validated['email'] !== $user->email) {
            $validated['email_verified_at'] = null;
        }

        // Save profile_frame to job seeker profile
        if ($user->role === 'job_seeker' && $request->has('profile_frame')) {
            $frame = $request->profile_frame ?? 'default';

            $user->jobSeekerProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'profile_frame' => $frame,
                    'open_to_work' => $frame === 'open_to_work',
                ]
            );
        }

        unset($validated['profile_frame']);
        $user->fill($validated)->save();

        return back()->with('status', 'account-updated');
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:5120'], // 5 MB
        ]);

        $user = $request->user();

        // Delete old avatar if it's stored locally (not a Google URL)
        if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
        }

        $file = $request->file('avatar');
        $path = $file->store("avatars/{$user->id}", 'public');

        // Convert to browser-accessible URL: avatars/1/file.jpg → /storage/avatars/1/file.jpg
        $url = '/storage/' . $path;

        $user->update(['avatar' => $url]);

        return back()->with('status', 'avatar-updated');
    }

    public function removeAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
        }

        $user->update(['avatar' => null]);

        return back()->with('status', 'avatar-removed');
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        \Illuminate\Support\Facades\Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}