import { Head, router } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';

interface Props {
    googleName: string;
    googleEmail: string;
    googleAvatar: string;
}

export default function GoogleRoleSelection({ googleName, googleEmail, googleAvatar }: Props) {
    const selectRole = (role: 'employer' | 'job_seeker') => {
        router.post(route('auth.google.role.store'), { role });
    };

    return (
        <>
            <Head title="Choose Your Role" />
            <AuthLayout
                title="One last step!"
                subtitle="Choose how you want to use the platform"
            >
                {/* Google user info */}
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6">
                    <img
                        src={googleAvatar}
                        alt={googleName}
                        className="w-10 h-10 rounded-full"
                        referrerPolicy="no-referrer"
                    />
                    <div>
                        <p className="text-sm font-semibold text-avaa-dark">{googleName}</p>
                        <p className="text-xs text-avaa-muted">{googleEmail}</p>
                    </div>
                    <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified by Google
                    </span>
                </div>

                {/* Role Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Employer */}
                    <button
                        type="button"
                        onClick={() => selectRole('employer')}
                        className="group text-left bg-white border-2 border-gray-200 hover:border-avaa-primary rounded-2xl p-6 transition-all duration-200 hover:shadow-md focus:outline-none focus:border-avaa-primary"
                    >
                        <div className="w-12 h-12 bg-avaa-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-avaa-primary/20 transition-colors">
                            <svg className="w-6 h-6 text-avaa-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-avaa-dark mb-1">I Want to Hire</h3>
                        <p className="text-xs text-avaa-muted leading-relaxed">
                            Post jobs and find the best talent for your company
                        </p>
                        <span className="mt-4 inline-block text-xs font-medium text-avaa-primary group-hover:underline">
                            Continue as Employer →
                        </span>
                    </button>

                    {/* Job Seeker */}
                    <button
                        type="button"
                        onClick={() => selectRole('job_seeker')}
                        className="group text-left bg-white border-2 border-gray-200 hover:border-avaa-primary rounded-2xl p-6 transition-all duration-200 hover:shadow-md focus:outline-none focus:border-avaa-primary"
                    >
                        <div className="w-12 h-12 bg-avaa-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-avaa-primary/20 transition-colors">
                            <svg className="w-6 h-6 text-avaa-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-avaa-dark mb-1">I'm Job Seeking</h3>
                        <p className="text-xs text-avaa-muted leading-relaxed">
                            Find your dream job and grow your career
                        </p>
                        <span className="mt-4 inline-block text-xs font-medium text-avaa-primary group-hover:underline">
                            Continue as Job Seeker →
                        </span>
                    </button>
                </div>

                <p className="mt-6 text-center text-xs text-avaa-muted">
                    Wrong account?{' '}
                    <a href="/auth/google" className="text-avaa-primary hover:underline font-medium">
                        Sign in with a different Google account
                    </a>
                </p>
            </AuthLayout>
        </>
    );
}