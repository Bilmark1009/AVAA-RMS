import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import EmployerOnboarding from '@/Components/Modals/EmployerOnboarding';

interface Props {
    user: { name: string; email: string; role: string };
    profile: any;
    profileComplete: boolean;
    isVerified: boolean;
    needsPhone: boolean;  // ← added
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <p className="text-sm text-avaa-muted font-medium mb-2">{label}</p>
            <p className="text-3xl font-extrabold text-avaa-dark tracking-tight">{value}</p>
            {sub && <p className="text-xs text-avaa-muted mt-1">{sub}</p>}
        </div>
    );
}

export default function EmployerDashboard({ user, profile, profileComplete, isVerified, needsPhone }: Props) {  // ← destructured
    return (
        <>
            <Head title="Employer Dashboard" />
            {!profileComplete && <EmployerOnboarding needsPhone={needsPhone} />}  {/* ← prop passed */}

            <AppLayout
                pageTitle="Dashboard"
                pageSubtitle={`Welcome back, ${profile?.company_name ?? user.name}`}
                activeNav="Dashboard"
            >
                {/* Verification status banner */}
                {profileComplete && (
                    <div className={`mb-6 flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-sm
                        ${isVerified
                            ? 'bg-avaa-primary-light border-avaa-primary/30 text-avaa-teal'
                            : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                        {isVerified ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
                                </svg>
                                <span><strong>Verified Employer</strong> — You can now post jobs.</span>
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                                <span><strong>Pending Verification</strong> — Our admin team is reviewing your profile. You'll be notified once approved.</span>
                            </>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <StatCard label="Active Jobs" value={0} sub="Currently listed" />
                    <StatCard label="Total Applications" value={0} sub="Received so far" />
                    <StatCard label="Pending Review" value={0} sub="Awaiting action" />
                </div>

                {/* Empty state */}
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-avaa-primary-light flex items-center justify-center mx-auto mb-4 text-avaa-teal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" />
                            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                        </svg>
                    </div>
                    <p className="text-avaa-muted text-sm mb-4">No job listings yet. Post your first job to start receiving applications.</p>
                    <button
                        disabled={!isVerified}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-avaa-primary
                                   hover:bg-avaa-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        {isVerified ? 'Post New Job' : 'Post New Job (Requires Verification)'}
                    </button>
                </div>
            </AppLayout>
        </>
    );
}