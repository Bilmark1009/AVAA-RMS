<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\EmployerVerifiedNotification;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmployerVerificationController extends Controller
{
    public function index(): Response
    {
        $pendingEmployers = User::where('role', 'employer')
            ->whereHas('employerProfile', function ($query) {
                $query->where('is_verified', false);
            })
            ->with('employerProfile')
            ->latest()
            ->get();

        return Inertia::render('Admin/Verifications', [
            'pendingEmployers' => $pendingEmployers->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                    'profile' => $user->employerProfile ? [
                        'company_name' => $user->employerProfile->company_name,
                        'industry' => $user->employerProfile->industry,
                        'company_size' => $user->employerProfile->company_size,
                        'website' => $user->employerProfile->company_website,
                        'company_description' => $user->employerProfile->company_description,
                        'phone' => $user->phone ?? null, // Phone is on the user table
                        'address' => $user->employerProfile->headquarters_address,
                        'city' => $user->employerProfile->city,
                        'state' => $user->employerProfile->state,
                        'country' => $user->employerProfile->country,
                        'postal_code' => $user->employerProfile->postal_code,
                        'linkedin_url' => $user->employerProfile->linkedin_url,
                        'facebook_url' => $user->employerProfile->facebook_url,
                        'twitter_url' => $user->employerProfile->twitter_url,
                        'instagram_url' => $user->employerProfile->instagram_url,
                        'registration_number' => $user->employerProfile->business_registration_number,
                        'tax_id' => $user->employerProfile->fein_tax_id,
                        'year_established' => $user->employerProfile->year_established,
                    ] : null,
                ];
            }),
        ]);
    }

    public function verify(User $user): RedirectResponse
    {
        abort_if($user->role !== 'employer', 403);
        abort_if(!$user->employerProfile, 404, 'Employer has no profile yet.');

        $user->employerProfile()->update([
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        $user->notify(new EmployerVerifiedNotification());

        return back()->with('success', "{$user->name} has been verified.");
    }

    public function revoke(User $user): RedirectResponse
    {
        abort_if($user->role !== 'employer', 403);

        $user->employerProfile()->update([
            'is_verified' => false,
            'verified_at' => null,
        ]);

        return back()->with('success', "Verification revoked for {$user->name}.");
    }
}