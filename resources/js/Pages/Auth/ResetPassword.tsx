import InputError from '@/Components/InputError';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const inputClass =
        'mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-avaa-dark placeholder-avaa-muted focus:outline-none focus:ring-2 focus:ring-avaa-primary/40 focus:border-avaa-primary transition';

    return (
        <AuthLayout title="Reset Password" subtitle="Choose a new password for your account.">
            <Head title="Reset Password" />

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-avaa-text">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        className={inputClass}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-avaa-text">New Password</label>
                    <input
                        id="password"
                        type="password"
                        value={data.password}
                        className={inputClass}
                        autoComplete="new-password"
                        autoFocus
                        placeholder="Enter new password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-avaa-text">Confirm Password</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        className={inputClass}
                        autoComplete="new-password"
                        placeholder="Confirm new password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 rounded-lg bg-avaa-primary text-white font-semibold text-sm hover:bg-avaa-primary-hover focus:outline-none focus:ring-2 focus:ring-avaa-primary/50 focus:ring-offset-2 disabled:opacity-50 transition"
                >
                    {processing ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </AuthLayout>
    );
}
