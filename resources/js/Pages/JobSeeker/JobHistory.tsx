import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { PageProps } from '@/types';

interface Placement {
    id: number;
    job_title: string;
    company: {
        name: string;
        initials: string;
        logo_url?: string | null;
    };
    start_date: string | null;
    end_date: string | null;
    duration: string | null;
    location: string | null;
    is_remote: boolean;
}

interface Props extends PageProps {
    currentPosition: Placement | null;
    pastPlacements: Placement[];
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="text-gray-400">{icon}</span>
            <span className="truncate">{children}</span>
        </span>
    );
}

function CompanyAvatar({ company }: { company: Placement['company'] }) {
    if (company.logo_url) {
        return (
            <img
                src={company.logo_url}
                alt={`${company.name} logo`}
                className="w-12 h-12 rounded-xl object-cover border border-gray-200 bg-white flex-shrink-0"
                loading="lazy"
            />
        );
    }

    return (
        <div className="w-12 h-12 rounded-xl bg-[#2f5f5f] text-white font-extrabold flex items-center justify-center flex-shrink-0">
            {company.initials}
        </div>
    );
}

function PlacementCard({ placement, variant }: { placement: Placement; variant: 'current' | 'past' }) {
    const pill = variant === 'current'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-slate-50 text-slate-600 border-slate-200';

    const pillLabel = variant === 'current' ? 'CURRENT POSITION' : 'PAST PLACEMENT';

    return (
        <div className={[
            'bg-white border rounded-2xl px-5 sm:px-6 py-5',
            variant === 'current' ? 'border-avaa-primary/40' : 'border-gray-200',
        ].join(' ')}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <CompanyAvatar company={placement.company} />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pill}`}>
                            {pillLabel}
                        </span>
                    </div>

                    <p className="mt-1 text-sm font-extrabold text-avaa-dark truncate">{placement.job_title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{placement.company.name}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                        {placement.start_date && (
                            <Meta icon={
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                            }>
                                Started {placement.start_date}
                            </Meta>
                        )}

                        {placement.duration && (
                            <Meta icon={
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12a9 9 0 11-3-6.7" /><polyline points="21 3 21 9 15 9" />
                                </svg>
                            }>
                                {placement.duration}
                            </Meta>
                        )}

                        {placement.is_remote && (
                            <Meta icon={
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                            }>
                                Remote
                            </Meta>
                        )}

                        {placement.location && (
                            <Meta icon={
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z" />
                                </svg>
                            }>
                                {placement.location}
                            </Meta>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function JobHistory({ currentPosition, pastPlacements }: Props) {
    return (
        <AppLayout>
            <Head title="Job History" />

            <div className="w-full max-w-none">
                <div className="mb-5">
                    <h1 className="text-xl font-extrabold text-avaa-dark">Job History</h1>
                    <p className="text-sm text-gray-500 mt-1">Your digital record of successful placements and past work through AVAA</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
                    <div className="space-y-6">
                        <section>
                            {currentPosition ? (
                                <PlacementCard placement={currentPosition} variant="current" />
                            ) : (
                                <div className="border border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-500">
                                    No current position yet.
                                </div>
                            )}
                        </section>

                        <section>
                            <h2 className="text-lg font-extrabold text-avaa-dark mb-4">Past Placements</h2>

                            {pastPlacements.length === 0 ? (
                                <div className="border border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-500">
                                    No past placements yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pastPlacements.map(p => (
                                        <PlacementCard key={p.id} placement={p} variant="past" />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

