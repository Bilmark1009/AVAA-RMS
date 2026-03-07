import { Head, Link } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';

export default function RoleSelection() {
    return (
        <AuthLayout title="Join AVAA" subtitle="Choose how you want to get started">
            <Head title="Join AVAA" />

            <div className="space-y-4">
                {/* Employer Card */}
                <Link
                    href={route('register.employer')}
                    className="group flex items-center gap-4 p-5 rounded-xl border-2 border-gray-100 hover:border-avaa-primary bg-white hover:bg-avaa-primary/5 transition-all duration-200"
                >
                    <div className="w-14 h-14 rounded-xl bg-avaa-dark flex items-center justify-center flex-shrink-0 group-hover:bg-avaa-dark-mid transition-colors">
                        <svg className="w-7 h-7 text-avaa-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-avaa-dark">I Want to Hire</h3>
                        <p className="text-sm text-avaa-muted mt-0.5">Post jobs and find the best talent</p>
                    </div>
                    <svg className="w-5 h-5 text-avaa-muted group-hover:text-avaa-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>

                {/* Job Seeker Card */}
                <Link
                    href={route('register.job-seeker')}
                    className="group flex items-center gap-4 p-5 rounded-xl border-2 border-gray-100 hover:border-avaa-primary bg-white hover:bg-avaa-primary/5 transition-all duration-200"
                >
                    <div className="w-14 h-14 rounded-xl bg-avaa-dark flex items-center justify-center flex-shrink-0 group-hover:bg-avaa-dark-mid transition-colors">
                        <svg className="w-7 h-7 text-avaa-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-avaa-dark">I'm Job Seeking</h3>
                        <p className="text-sm text-avaa-muted mt-0.5">Find your dream job and grow your career</p>
                    </div>
                    <svg className="w-5 h-5 text-avaa-muted group-hover:text-avaa-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            <p className="mt-8 text-center text-sm text-avaa-muted">
                Already have an account?{' '}
                <Link href={route('login')} className="text-avaa-primary font-semibold hover:text-avaa-primary-hover">
                    Log in
                </Link>
            </p>
        </AuthLayout>
    );
}