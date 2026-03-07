<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class ProfileController extends Controller
{
    public function complete(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Phone is required only for Google-registered users who don't have one yet
        $phoneRule = ($user->google_id && !$user->phone) ? 'required' : 'nullable';

        $request->validate([
            'company_name'                => 'required|string|max:255',
            'company_website'             => 'nullable|string|max:255',
            'industry'                    => 'required|string',
            'company_size'                => 'required|string',
            'company_description'         => 'required|string|min:50',
            'logo'                        => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'headquarters_address'        => 'required|string|max:255',
            'city'                        => 'required|string|max:100',
            'state'                       => 'required|string|max:100',
            'country'                     => 'required|string|max:100',
            'postal_code'                 => 'required|string|max:20',
            'fein_tax_id'                 => 'required|string|max:50',
            'business_registration_number'=> 'nullable|string|max:100',
            'year_established'            => 'nullable|integer|min:1800|max:' . date('Y'),
            'linkedin_url'                => 'nullable|string|max:255',
            'facebook_url'                => 'nullable|string|max:255',
            'twitter_url'                 => 'nullable|string|max:255',
            'instagram_url'               => 'nullable|string|max:255',
            'phone'                       => $phoneRule . '|string|max:30',
        ]);

        $logoPath = null;

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store(
                "logos/{$user->id}",
                'public'
            );
        }

        $user->employerProfile()->create([
            'company_name'                 => $request->company_name,
            'company_website'              => $request->company_website,
            'industry'                     => $request->industry,
            'company_size'                 => $request->company_size,
            'company_description'          => $request->company_description,
            'logo_path'                    => $logoPath,
            'headquarters_address'         => $request->headquarters_address,
            'city'                         => $request->city,
            'state'                        => $request->state,
            'country'                      => $request->country,
            'postal_code'                  => $request->postal_code,
            'fein_tax_id'                  => $request->fein_tax_id,
            'business_registration_number' => $request->business_registration_number,
            'year_established'             => $request->year_established,
            'linkedin_url'                 => $request->linkedin_url,
            'facebook_url'                 => $request->facebook_url,
            'twitter_url'                  => $request->twitter_url,
            'instagram_url'                => $request->instagram_url,
        ]);

        // Save phone to users table if it was submitted (Google registration path)
        if ($request->filled('phone')) {
            $user->update(['phone' => $request->phone]);
        }

        $user->update(['profile_completed' => true]);

        return back()->with('success', 'Profile completed successfully!');
    }
}