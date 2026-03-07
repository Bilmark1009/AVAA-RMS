import InputError from '@/Components/InputError';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    const inputClass =
        'mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-avaa-dark placeholder-avaa-muted focus:outline-none focus:ring-2 focus:ring-avaa-primary/40 focus:border-avaa-primary transition';

    return (
        <AuthLayout title="Confirm Password" subtitle="This is a secure area. Please confirm your password before continuing.">
            <Head title="Confirm Password" />

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-avaa-text">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={data.password}
                        className={inputClass}
                        autoFocus
                        placeholder="Enter your password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 rounded-lg bg-avaa-primary text-white font-semibold text-sm hover:bg-avaa-primary-hover focus:outline-none focus:ring-2 focus:ring-avaa-primary/50 focus:ring-offset-2 disabled:opacity-50 transition"
                >
                    {processing ? 'Confirming...' : 'Confirm'}
                </button>
            </form>
        </AuthLayout>
    );
}
