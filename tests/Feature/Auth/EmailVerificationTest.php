<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\EmailOtpNotification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_verification_screen_can_be_rendered(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->get('/verify-email');

        $response->assertStatus(200);
    }

    public function test_email_can_be_verified_with_valid_otp(): void
    {
        $user = User::factory()->unverified()->create();

        Event::fake();

        $otp = $user->generateAndSaveOtp();

        $response = $this->actingAs($user)->post('/verify-email/otp', ['otp' => $otp]);

        Event::assertDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $this->assertNull($user->fresh()->email_otp);
    }

    public function test_email_is_not_verified_with_invalid_otp(): void
    {
        $user = User::factory()->unverified()->create();
        $user->generateAndSaveOtp();

        $this->actingAs($user)->post('/verify-email/otp', ['otp' => '000000']);

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_email_is_not_verified_with_expired_otp(): void
    {
        $user = User::factory()->unverified()->create();
        $otp = $user->generateAndSaveOtp();

        // Manually expire the OTP
        $user->forceFill(['email_otp_expires_at' => now()->subMinutes(1)])->save();

        $this->actingAs($user)->post('/verify-email/otp', ['otp' => $otp]);

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_otp_resend_sends_new_otp(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->post('/email/verification-notification');

        $response->assertSessionHas('status', 'otp-sent');
        Notification::assertSentTo($user, EmailOtpNotification::class);
        $this->assertNotNull($user->fresh()->email_otp);
    }
}
