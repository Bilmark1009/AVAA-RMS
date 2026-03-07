import InputError from '@/Components/InputError';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    const inputClass =
        'mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-avaa-dark placeholder-avaa-muted focus:outline-none focus:ring-2 focus:ring-avaa-primary/40 focus:border-avaa-primary transition';

    return (
        <AuthLayout title="Forgot your password?" subtitle="No problem — enter your email and we'll send you a reset link.">
            <Head title="Forgot Password" />

            {status && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-avaa-text">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        className={inputClass}
                        autoFocus
                        placeholder="you@example.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 rounded-lg bg-avaa-primary text-white font-semibold text-sm hover:bg-avaa-primary-hover focus:outline-none focus:ring-2 focus:ring-avaa-primary/50 focus:ring-offset-2 disabled:opacity-50 transition"
                >
                    {processing ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
        </AuthLayout>
    );
}
