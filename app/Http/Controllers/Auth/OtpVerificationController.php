<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OtpVerificationController extends Controller
{
    /**
     * Verify the submitted OTP code.
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->route($user->getDashboardRoute())
                ->with('status', 'already-verified');
        }

        if (
            $user->email_otp !== $request->otp ||
            $user->email_otp_expires_at === null ||
            now()->isAfter($user->email_otp_expires_at)
        ) {
            return back()->withErrors(['otp' => 'The OTP is invalid or has expired. Please request a new one.']);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'email_otp' => null,
            'email_otp_expires_at' => null,
        ])->save();

        event(new Verified($user));

        return redirect()->route($user->getDashboardRoute())
            ->with('status', 'verified');
    }
}
