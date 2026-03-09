<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingsController extends Controller
{
    /* ── Account ──────────────────────────────────────────────────────── */

    public function account(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Admin/Settings/Account', [
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'status' => session('status'),
            'user' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'email_verified_at' => $user->email_verified_at,
                'google_id' => $user->google_id,
            ],
        ]);
    }

    public function updateAccount(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        if ($validated['email'] !== $user->email) {
            $validated['email_verified_at'] = null;
        }

        $user->fill($validated)->save();

        return back()->with('status', 'account-updated');
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
        ]);

        $user = $request->user();

        if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
        }

        $path = $request->file('avatar')->store("avatars/{$user->id}", 'public');
        $user->update(['avatar' => '/storage/' . $path]);

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

    /* ── Security ─────────────────────────────────────────────────────── */

    public function security(Request $request): Response
    {
        $user = $request->user();
        $settings = $user->securitySettings ?? null;

        return Inertia::render('Admin/Settings/Security', [
            'settings' => [
                'two_factor_enabled' => $settings?->two_factor_enabled ?? false,
                'login_alert_email' => $settings?->login_alert_email ?? true,
                'login_alert_push' => $settings?->login_alert_push ?? true,
                'restrict_by_ip' => $settings?->restrict_by_ip ?? false,
                'session_timeout' => $settings?->session_timeout ?? 30,
            ],
        ]);
    }

    public function updateSecurity(Request $request)
    {
        $validated = $request->validate([
            'two_factor_enabled' => ['boolean'],
            'login_alert_email' => ['boolean'],
            'login_alert_push' => ['boolean'],
            'restrict_by_ip' => ['boolean'],
            'session_timeout' => ['integer', 'in:15,30,60,120'],
        ]);

        $request->user()->securitySettings()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return back();
    }

    /* ── Notifications ────────────────────────────────────────────────── */

    public function notifications(Request $request): Response
    {
        $user = $request->user();
        $settings = $user->notificationSettings ?? null;

        return Inertia::render('Admin/Settings/Notifications', [
            'settings' => [
                'new_job_posted' => $settings?->admin_new_job_posted ?? true,
                'new_user_registered' => $settings?->admin_new_user_registered ?? true,
                'system_alerts' => $settings?->admin_system_alerts ?? true,
                'security_alerts' => $settings?->admin_security_alerts ?? true,
                'maintenance_notices' => $settings?->admin_maintenance_notices ?? true,
            ],
        ]);
    }

    public function updateNotifications(Request $request)
    {
        $validated = $request->validate([
            'new_job_posted' => ['boolean'],
            'new_user_registered' => ['boolean'],
            'system_alerts' => ['boolean'],
            'security_alerts' => ['boolean'],
            'maintenance_notices' => ['boolean'],
        ]);

        $request->user()->notificationSettings()->updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'admin_new_job_posted' => $validated['new_job_posted'],
                'admin_new_user_registered' => $validated['new_user_registered'],
                'admin_system_alerts' => $validated['system_alerts'],
                'admin_security_alerts' => $validated['security_alerts'],
                'admin_maintenance_notices' => $validated['maintenance_notices'],
            ]
        );

        return back();
    }
}
