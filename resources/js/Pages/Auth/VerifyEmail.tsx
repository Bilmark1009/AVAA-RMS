import AuthLayout from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState, ClipboardEvent, KeyboardEvent } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { post, processing, errors, setData } = useForm({ otp: '' });
    const { post: resendPost, processing: resendProcessing } = useForm({});

    const syncOtp = (updated: string[]) => {
        setData('otp', updated.join(''));
    };

    const handleChange = (index: number, value: string) => {
        const char = value.replace(/\D/g, '').slice(-1);
        const updated = [...digits];
        updated[index] = char;
        setDigits(updated);
        syncOtp(updated);
        if (char && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const updated = Array(6).fill('');
        pasted.split('').forEach((ch, i) => { updated[i] = ch; });
        setDigits(updated);
        syncOtp(updated);
        const nextEmpty = pasted.length < 6 ? pasted.length : 5;
        inputRefs.current[nextEmpty]?.focus();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.otp'));
    };

    const resend: FormEventHandler = (e) => {
        e.preventDefault();
        resendPost(route('verification.send'));
    };

    return (
        <AuthLayout title="Verify Your Email" subtitle="Enter the 6-digit code we sent to your email.">
            <Head title="Email Verification" />

            <p className="mb-6 text-sm text-avaa-text leading-relaxed">
                We sent a verification code to your email address. Enter it below to
                confirm your account. The code expires in <strong>10 minutes</strong>.
            </p>

            {status === 'otp-sent' && (
                <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700">
                    A new verification code has been sent to your email address.
                </div>
            )}

            {errors.otp && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
                    {errors.otp}
                </div>
            )}

            {/* OTP Digit Boxes */}
            <form onSubmit={submit}>
                <div className="flex justify-center gap-3 mb-6">
                    {digits.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => { inputRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={handlePaste}
                            className="w-11 h-14 text-center text-xl font-bold rounded-lg border-2 border-avaa-muted/40 bg-transparent text-avaa-text focus:outline-none focus:border-avaa-primary transition-colors"
                            autoFocus={i === 0}
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={processing || digits.join('').length < 6}
                    className="w-full py-3 rounded-lg bg-avaa-primary text-white font-semibold text-sm hover:bg-avaa-primary-hover focus:outline-none focus:ring-2 focus:ring-avaa-primary/50 focus:ring-offset-2 disabled:opacity-50 transition"
                >
                    {processing ? 'Verifying…' : 'Verify Email'}
                </button>
            </form>

            {/* Resend + Logout */}
            <div className="mt-6 flex items-center justify-between text-sm">
                <form onSubmit={resend}>
                    <button
                        type="submit"
                        disabled={resendProcessing}
                        className="text-avaa-muted hover:text-avaa-text font-medium disabled:opacity-50 transition"
                    >
                        {resendProcessing ? 'Sending…' : 'Resend Code'}
                    </button>
                </form>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-avaa-muted hover:text-avaa-text font-medium"
                >
                    Log Out
                </Link>
            </div>
        </AuthLayout>
    );
}
