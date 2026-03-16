<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the employer profile page.
     */
    public function show(Request $request): Response
    {
        $user = $request->user()->load('employerProfile');

        return Inertia::render('Employer/Profile', [
            'user' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'role' => $user->role,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'google_id' => $user->google_id,
            ],
            'profile' => $user->employerProfile,
        ]);
    }

    /**
     * Display the employer settings page.
     */
    public function settings(Request $request): Response
    {
        $user = $request->user()->load(['employerProfile', 'securitySettings']);

        return Inertia::render('Employer/Settings', [
            'user' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at,
                'google_id' => $user->google_id,
            ],
            'profile' => $user->employerProfile,
            'security' => $user->securitySettings ?? [
                'two_factor_enabled' => false,
                'login_alert_email' => true,
                'login_alert_push' => true,
            ],
            'blockedUsers' => $user->blockedUsers()
                ->with('blockedUser:id,first_name,last_name,avatar,role')
                ->latest()
                ->get()
                ->map(function ($block) {
                    $user = $block->blockedUser;
                    return [
                        'id' => $user->id,
                        'name' => $user->full_name,
                        'avatar' => $user->avatar,
                        'role' => $user->role,
                        'reason' => $block->reason,
                        'blocked_at' => $block->created_at->toISOString(),
                        'initials' => strtoupper(($user->first_name[0] ?? '') . ($user->last_name[0] ?? '')),
                        'job_title' => $user->jobSeekerProfile?->professional_title 
                            ?? $user->jobSeekerProfile?->current_job_title 
                            ?? 'Job Seeker',
                    ];
                }),
        ]);
    }

    /**
     * Update personal info for employer.
     */
    public function updatePersonal(Request $request): RedirectResponse
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

        return back()->with('status', 'personal-updated');
    }

    /**
     * Update company details for employer.
     */
    public function updateCompany(Request $request): RedirectResponse
    {
        $user = $request->user();
        $profile = $user->employerProfile;

        if (!$profile) {
            return back()->withErrors(['company_name' => 'No employer profile found.']);
        }

        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'company_description' => ['required', 'string', 'min:10'],
            'company_website' => ['nullable', 'string', 'max:255'],
            'industry' => ['required', 'string'],
            'company_size' => ['required', 'string'],
            'headquarters_address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
        ]);

        $profile->fill($validated)->save();

        return back()->with('status', 'company-updated');
    }

    /**
     * Upload employer avatar.
     */
    public function uploadAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
        ]);

        $user = $request->user();

        if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
        }

        $file = $request->file('avatar');
        $path = $file->store("avatars/{$user->id}", 'public');
        $url = '/storage/' . $path;

        $user->update(['avatar' => $url]);

        return back()->with('status', 'avatar-updated');
    }

    /**
     * Remove employer avatar.
     */
    public function removeAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
        }

        $user->update(['avatar' => null]);

        return back()->with('status', 'avatar-removed');
    }

    /**
     * Complete employer profile (onboarding).
     */
    public function complete(Request $request): RedirectResponse
    {
        $user = $request->user();

        $phoneRule = ($user->google_id && !$user->phone) ? 'required' : 'nullable';

        $request->validate([
            'company_name' => 'required|string|max:255',
            'company_website' => 'nullable|string|max:255',
            'industry' => 'required|string',
            'company_size' => 'required|string',
            'company_description' => 'required|string|min:50',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'headquarters_address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'fein_tax_id' => 'required|string|max:50',
            'business_registration_number' => 'nullable|string|max:100',
            'year_established' => 'nullable|integer|min:1800|max:' . date('Y'),
            'linkedin_url' => 'nullable|string|max:255',
            'facebook_url' => 'nullable|string|max:255',
            'twitter_url' => 'nullable|string|max:255',
            'instagram_url' => 'nullable|string|max:255',
            'phone' => $phoneRule . '|string|max:30',
        ]);

        $logoPath = null;

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store(
                "logos/{$user->id}",
                'public'
            );
        }

        $user->employerProfile()->create([
            'company_name' => $request->company_name,
            'company_website' => $request->company_website,
            'industry' => $request->industry,
            'company_size' => $request->company_size,
            'company_description' => $request->company_description,
            'logo_path' => $logoPath,
            'headquarters_address' => $request->headquarters_address,
            'city' => $request->city,
            'state' => $request->state,
            'country' => $request->country,
            'postal_code' => $request->postal_code,
            'fein_tax_id' => $request->fein_tax_id,
            'business_registration_number' => $request->business_registration_number,
            'year_established' => $request->year_established,
            'linkedin_url' => $request->linkedin_url,
            'facebook_url' => $request->facebook_url,
            'twitter_url' => $request->twitter_url,
            'instagram_url' => $request->instagram_url,
        ]);

        if ($request->filled('phone')) {
            $user->update(['phone' => $request->phone]);
        }

        $user->update(['profile_completed' => true]);

        return back()->with('success', 'Profile completed successfully!');
    }
}