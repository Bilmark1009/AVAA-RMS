import { Head } from '@inertiajs/react';
import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import JobSeekerOnboarding from '@/Components/Modals/JobSeekerOnboarding';
import { PageProps } from '@/types';

interface Props extends PageProps {
    profile: any;
    profileComplete: boolean;
    appliedCount: number;
    savedCount: number;
}

function StatCard({ label, value, sub, accent }: {
    label: string; value: string | number; sub?: string; accent?: boolean;
}) {
    return (
        <div className={`rounded-2xl border p-5 hover:shadow-sm transition-shadow
            ${accent ? 'bg-avaa-primary-light border-avaa-primary/20' : 'bg-white border-gray-200'}`}>
            <p className="text-sm text-avaa-muted font-medium mb-2">{label}</p>
            <p className={`text-3xl font-extrabold tracking-tight ${accent ? 'text-avaa-teal' : 'text-avaa-dark'}`}>
                {value}
            </p>
            {sub && <p className="text-xs text-avaa-muted mt-1">{sub}</p>}
        </div>
    );
}

export default function JobSeekerDashboard({ profile, profileComplete, appliedCount, savedCount }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const completeness = profile?.profile_completeness ?? 0;

    return (
        <>
            <Head title="Job Seeker Dashboard" />
            {!profileComplete && <JobSeekerOnboarding />}

            <AppLayout
                pageTitle="Dashboard"
                pageSubtitle={`Welcome back, ${user?.name}!`}
                activeNav="Dashboard"
            >
                {/* Profile completion nudge */}
                {profileComplete && completeness < 100 && (
                    <div className="mb-6 px-4 py-3.5 bg-avaa-primary-light border border-avaa-primary/25 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-2 h-2 rounded-full bg-avaa-primary animate-pulse flex-shrink-0" />
                            <p className="text-sm text-avaa-teal font-medium">
                                Your profile is <strong>{completeness}%</strong> complete. Finish it to get better job matches.
                            </p>
                        </div>
                        <Link href={route('job-seeker.profile.edit')}
                            className="flex-shrink-0 text-xs font-semibold text-white bg-avaa-primary px-4 py-2 rounded-xl hover:bg-avaa-primary-hover transition-colors">
                            Complete Profile
                        </Link>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <StatCard label="Profile Strength" value={`${completeness}%`} sub="Keep improving it" accent />
                    <StatCard label="Jobs Applied" value={appliedCount} sub="Applications sent" />
                    <StatCard label="Saved Jobs" value={savedCount} sub="In your wishlist" />
                </div>

                {/* Profile strength bar */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-avaa-dark">Profile Completeness</p>
                        <span className="text-sm font-bold text-avaa-teal">{completeness}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-avaa-primary transition-all duration-500"
                            style={{ width: `${completeness}%` }} />
                    </div>
                    <p className="text-xs text-avaa-muted mt-2">
                        {completeness === 100
                            ? 'Your profile is complete! Employers can find you easily.'
                            : 'Add more details to reach 100% and stand out to employers.'}
                    </p>
                </div>

                {/* Browse CTA */}
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-avaa-primary-light flex items-center justify-center mx-auto mb-4 text-avaa-teal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                    <p className="text-avaa-muted text-sm mb-4">
                        Browse jobs to see recommendations tailored to your profile here!
                    </p>
                    <Link href={route('job-seeker.jobs.browse')}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-avaa-primary hover:bg-avaa-primary-hover transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        Browse Jobs
                    </Link>
                </div>
            </AppLayout>
        </>
    );
}