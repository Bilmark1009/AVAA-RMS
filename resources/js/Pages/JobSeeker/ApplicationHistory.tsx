import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ImageInitialsFallback from '@/Components/ImageInitialsFallback';
import Modal from '@/Components/Modal';
import type { PageProps } from '@/types';
import { useEffect, useMemo, useState } from 'react';

type Stage = 'pending' | 'interviewing' | 'withdrawn' | 'rejected' | string;

interface ApplicationItem {
    id: number;
    status: string;
    stage: Stage;
    applied_at: string | null;
    updated_at?: string | null;
    reviewed_at?: string | null;
    time_ago: string | null;
    can_withdraw: boolean;
    reviewer_notes?: string | null;
    rejection_reason?: string | null;
    interview?: {
        status: string | null;
        interview_type: string | null;
        interviewer_name: string | null;
        location_or_link: string | null;
        notes: string | null;
        date: string | null;
        date_label: string | null;
        time: string | null;
        time_label: string | null;
    } | null;
    job: null | {
        id: number;
        title: string;
        location: string;
        is_remote: boolean;
        employment_type: string | null;
        description?: string | null;
        industry?: string | null;
        experience_level?: string | null;
        skills_required?: string[];
        salary_min?: number | null;
        salary_max?: number | null;
        salary_currency?: string | null;
    };
    company: {
        name: string;
        initials: string;
        logo_url?: string | null;
        size?: string | null;
    };
}

interface Props extends PageProps {
    applications: ApplicationItem[];
}

const statusPill = (stage: Stage) => {
    const s = (stage || '').toString().toLowerCase();
    if (s === 'interviewing') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'withdrawn') return 'bg-slate-50 text-slate-600 border-slate-200';
    if (s === 'rejected') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
};

const statusLabel = (stage: Stage) => {
    const s = (stage || '').toString().toLowerCase();
    if (s === 'interviewing') return 'For Interview';
    if (s === 'pending') return 'Pending';
    if (s === 'withdrawn') return 'Withdrawn';
    if (s === 'rejected') return 'Rejected';
    if (s === 'contract_ended') return 'Contract Ended';
    return (stage || 'Unknown').toString();
};

const formatDisplayDate = (value?: string | null) => {
    if (!value) return 'Not available';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not available';

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatSalaryRange = (job: ApplicationItem['job']) => {
    if (!job) return 'Not specified';

    const currency = job.salary_currency || 'USD';
    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);

    const hasMin = typeof job.salary_min === 'number';
    const hasMax = typeof job.salary_max === 'number';

    if (hasMin && hasMax) return `${formatCurrency(job.salary_min as number)} - ${formatCurrency(job.salary_max as number)} / yr`;
    if (hasMin) return `${formatCurrency(job.salary_min as number)}+ / yr`;
    if (hasMax) return `Up to ${formatCurrency(job.salary_max as number)} / yr`;

    return 'Not specified';
};

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="text-gray-400">{icon}</span>
            <span className="truncate">{children}</span>
        </span>
    );
}

function SegmentedTabs({ value, onChange, tabs }: {
    value: string;
    onChange: (v: string) => void;
    tabs: { key: string; label: string }[];
}) {
    return (
        <div className="w-full sm:w-auto flex rounded-xl bg-gray-100 p-1 border border-gray-200 overflow-x-auto sm:overflow-visible">
            {tabs.map(t => (
                <button
                    key={t.key}
                    type="button"
                    onClick={() => onChange(t.key)}
                    className={[
                        'flex-shrink-0 whitespace-nowrap px-3 py-2 sm:px-4 text-xs font-semibold rounded-lg transition-all',
                        value === t.key
                            ? 'bg-avaa-primary text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700',
                    ].join(' ')}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}

function ApplicationCard({
    app,
    onView,
    onWithdraw,
}: {
    app: ApplicationItem;
    onView: (app: ApplicationItem) => void;
    onWithdraw: (app: ApplicationItem) => void;
}) {
    const canWithdraw = app.can_withdraw && ['pending', 'interviewing', 'approved'].includes((app.stage || '').toString().toLowerCase());

    return (
        <div className="bg-white border border-gray-200 rounded-2xl px-5 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4 min-w-0">
                <ImageInitialsFallback
                    src={app.company.logo_url}
                    alt={`${app.company.name} logo`}
                    initials={app.company.initials}
                    className={`w-12 h-12 rounded-xl border border-gray-200 flex-shrink-0 overflow-hidden ${app.company.logo_url ? 'bg-white' : 'bg-[#2f5f5f]'}`}
                    textClassName="text-white font-extrabold flex items-center justify-center"
                />

                <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-extrabold text-avaa-dark truncate">{app.job?.title ?? 'Job'}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusPill(app.stage)}`}>
                            {statusLabel(app.stage)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{app.company.name}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                        <MetaItem icon={
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                        }>
                            Applied {app.time_ago ?? ''}
                        </MetaItem>

                        {app.job?.location && (
                            <MetaItem icon={
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z" />
                                </svg>
                            }>
                                {app.job.location}
                            </MetaItem>
                        )}

                        {app.job?.is_remote && (
                            <MetaItem icon={
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                            }>
                                Remote
                            </MetaItem>
                        )}

                        {app.job?.employment_type && (
                            <MetaItem icon={
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                                </svg>
                            }>
                                {app.job.employment_type}
                            </MetaItem>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                <button
                    type="button"
                    onClick={() => onView(app)}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                    View Details
                </button>

                {canWithdraw && (
                    <button
                        type="button"
                        onClick={() => onWithdraw(app)}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                    >
                        Withdraw Application
                    </button>
                )}
            </div>
        </div>
    );
}

function DemoApplicationCard({
    app,
    onView,
    onWithdraw,
}: {
    app: ApplicationItem;
    onView: (app: ApplicationItem) => void;
    onWithdraw: (app: ApplicationItem) => void;
}) {
    const canWithdraw = app.can_withdraw && ['pending', 'interviewing', 'approved'].includes((app.stage || '').toString().toLowerCase());

    return (
        <div className="bg-white border border-gray-200 rounded-2xl px-5 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4 min-w-0">
                <ImageInitialsFallback
                    src={app.company.logo_url}
                    alt={`${app.company.name} logo`}
                    initials={app.company.initials}
                    className={`w-12 h-12 rounded-xl border border-gray-200 flex-shrink-0 overflow-hidden ${app.company.logo_url ? 'bg-white' : 'bg-[#2f5f5f]'}`}
                    textClassName="text-white font-extrabold flex items-center justify-center"
                />

                <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-extrabold text-avaa-dark truncate">{app.job?.title ?? 'Job'}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusPill(app.stage)}`}>
                            {statusLabel(app.stage)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{app.company.name}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                        <MetaItem icon={
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                        }>
                            Applied {app.time_ago ?? ''}
                        </MetaItem>

                        {app.job?.location && (
                            <MetaItem icon={
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z" />
                                </svg>
                            }>
                                {app.job.location}
                            </MetaItem>
                        )}

                        {app.job?.is_remote && (
                            <MetaItem icon={
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                            }>
                                Remote
                            </MetaItem>
                        )}

                        {app.job?.employment_type && (
                            <MetaItem icon={
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                                </svg>
                            }>
                                {app.job.employment_type}
                            </MetaItem>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                <button
                    type="button"
                    onClick={() => onView(app)}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                    View Details
                </button>

                {canWithdraw && (
                    <button
                        type="button"
                        onClick={() => onWithdraw(app)}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                    >
                        Withdraw Application
                    </button>
                )}
            </div>
        </div>
    );
}

const DEMO_APPLICATIONS: ApplicationItem[] = [
    {
        id: -1,
        status: 'pending',
        stage: 'interviewing',
        applied_at: null,
        time_ago: '3 days ago',
        can_withdraw: true,
        job: { id: -1, title: 'Senior Frontend Developer', location: '', is_remote: true, employment_type: 'Full-time' },
        company: { name: 'TechNova', initials: 'TN' },
    },
    {
        id: -2,
        status: 'pending',
        stage: 'pending',
        applied_at: null,
        time_ago: '1 week ago',
        can_withdraw: true,
        job: { id: -2, title: 'Backend Engineer', location: 'San Francisco, CA', is_remote: false, employment_type: 'Full-time' },
        company: { name: 'DataStream', initials: 'DS' },
    },
    {
        id: -3,
        status: 'withdrawn',
        stage: 'withdrawn',
        applied_at: null,
        time_ago: '1 month ago',
        can_withdraw: false,
        job: { id: -3, title: 'Marketing Specialist', location: 'Chicago, IL', is_remote: false, employment_type: 'Part-time' },
        company: { name: 'Growth Partners', initials: 'GP' },
    },
];

function DetailTabButton({ active, icon, label, onClick }: {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap flex-shrink-0',
                active ? 'border-avaa-primary text-avaa-dark' : 'border-transparent text-gray-400 hover:text-gray-600',
            ].join(' ')}
        >
            <span className={active ? 'text-avaa-primary' : 'text-gray-300'}>{icon}</span>
            {label}
        </button>
    );
}

function ApplicationDetailsModal({
    open,
    app,
    onClose,
}: {
    open: boolean;
    app: ApplicationItem | null;
    onClose: () => void;
}) {
    const [tab, setTab] = useState<'overview' | 'timeline' | 'job'>('overview');

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    useEffect(() => {
        if (open) setTab('overview');
    }, [open]);

    if (!open || !app) return null;

    const stage = (app.stage || '').toString().toLowerCase();
    const appliedDate = formatDisplayDate(app.applied_at);
    const updatedDate = formatDisplayDate(app.updated_at ?? app.reviewed_at ?? app.applied_at);
    const salaryRange = formatSalaryRange(app.job);
    const skills = app.job?.skills_required ?? [];
    const isPending = stage === 'pending';
    const isWithdrawn = stage === 'withdrawn';
    const isRejected = stage === 'rejected';
    const isInterviewing = stage === 'interviewing' && !!app.interview;

    const statusHeading = isInterviewing
        ? 'Interview Scheduled'
        : stage === 'pending'
            ? 'Application Pending'
            : stage === 'withdrawn'
                ? 'Application Withdrawn'
                : stage === 'rejected'
                    ? 'Application Rejected'
                    : stage === 'contract_ended'
                        ? 'Contract Ended'
                    : `${statusLabel(app.stage)} Status`;

    const statusSubHeading = isInterviewing
        ? `${app.interview?.date_label ?? 'Date TBD'}${app.interview?.time_label ? ` · ${app.interview.time_label}` : ''}`
        : stage === 'pending'
            ? 'Waiting for recruiter review.'
            : stage === 'withdrawn'
                ? 'This application has been withdrawn.'
                : stage === 'rejected'
                    ? 'Sorry, you have been rejected.'
                    : stage === 'contract_ended'
                        ? 'Your contract ended.'
                    : 'Status has been updated.';

    const messageAuthor = app.interview?.interviewer_name || app.company.name;
    const messageRole = app.interview?.interview_type || 'Hiring Team';
    const messageBody = isInterviewing
        ? (app.interview?.notes || 'Interview details have been shared. Please review the schedule and prepare accordingly.')
        : stage === 'withdrawn'
            ? 'Sorry, you have withdrawn your application. If this was a mistake or you wish to reapply, feel free to submit a new application to this job in the future.'
            : stage === 'rejected'
                ? 'We appreciate the time you invested in applying and encourage you to apply for future opportunities that match your skills.'
            : stage === 'contract_ended'
                ? 'Thank you for joining us. Good luck on your future journey!'
            : (app.reviewer_notes || app.rejection_reason || 'Your application is in progress. You will receive updates when the hiring team reviews it.');

    return (
        <div className="fixed inset-0 z-[80]">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="absolute inset-0 flex items-stretch sm:items-center justify-center p-0 sm:p-6">
                <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl bg-white sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="px-4 sm:px-6 py-4 flex items-start justify-between border-b border-gray-100 bg-white flex-shrink-0">
                        <div className="min-w-0">
                            <p className="text-lg font-extrabold text-avaa-dark truncate">{app.job?.title ?? 'Application Details'}</p>
                            <p className="text-sm text-gray-500 truncate">{app.company.name}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="ml-4 w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition flex items-center justify-center"
                            aria-label="Close"
                        >
                            <span className="text-xl leading-none">×</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="px-4 sm:px-6 pt-2 bg-white flex-shrink-0">
                        <div className="flex items-center gap-6 border-b border-gray-100 overflow-x-auto">
                            <DetailTabButton
                                active={tab === 'overview'}
                                onClick={() => setTab('overview')}
                                label="Overview"
                                icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" />
                                        <rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" />
                                    </svg>
                                }
                            />
                            <DetailTabButton
                                active={tab === 'timeline'}
                                onClick={() => setTab('timeline')}
                                label="Timeline"
                                icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M3 3v18h18" /><path d="M7 14l3-3 4 4 6-6" />
                                    </svg>
                                }
                            />
                            <DetailTabButton
                                active={tab === 'job'}
                                onClick={() => setTab('job')}
                                label="Job Details"
                                icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                                    </svg>
                                }
                            />
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-4 sm:px-6 py-5 flex-1 overflow-auto">
                        {tab === 'overview' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="border border-gray-200 rounded-xl p-4 text-center">
                                        <p className="text-xs text-gray-500">Applied</p>
                                        <p className="text-sm font-extrabold text-avaa-dark">{appliedDate}</p>
                                    </div>
                                    <div className="border border-gray-200 rounded-xl p-4 text-center">
                                        <p className="text-xs text-gray-500">Last Updated</p>
                                        <p className="text-sm font-extrabold text-avaa-dark">{updatedDate}</p>
                                    </div>
                                    <div className="border border-gray-200 rounded-xl p-4 text-center">
                                        <p className="text-xs text-gray-500">Salary Range</p>
                                        <p className="text-sm font-extrabold text-avaa-primary">{salaryRange}</p>
                                    </div>
                                </div>

                                <div className="border border-avaa-primary/40 bg-avaa-primary-light rounded-xl p-4 flex items-start gap-3">
                                    <div className={`w-9 h-9 rounded-lg bg-white border flex items-center justify-center flex-shrink-0 ${isWithdrawn || isRejected ? 'border-rose-300 text-rose-600' : 'border-avaa-primary/30 text-avaa-primary'}`}>
                                        {isWithdrawn ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="9" />
                                                <line x1="12" y1="7.5" x2="12" y2="13" />
                                                <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
                                            </svg>
                                        ) : isPending ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="9" />
                                                <polyline points="12 7 12 12 15 14" />
                                            </svg>
                                        ) : isRejected ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="9" />
                                                <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
                                                <line x1="15.5" y1="8.5" x2="8.5" y2="15.5" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500">{statusHeading}</p>
                                        <p className="text-sm font-bold text-avaa-dark">{statusSubHeading}</p>
                                        {isInterviewing && app.interview?.location_or_link && (
                                            <p className="text-xs text-gray-500 mt-1 truncate">{app.interview.location_or_link}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="border border-amber-100 bg-amber-50/50 rounded-xl p-4 flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white border border-amber-100 flex items-center justify-center flex-shrink-0">
                                        <div className="w-9 h-9 rounded-full bg-gray-200" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-extrabold text-avaa-dark">{messageAuthor}</p>
                                        <p className="text-xs text-gray-500 -mt-0.5">{messageRole}</p>
                                        <p className="text-sm text-gray-600 mt-2">
                                            {messageBody}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-extrabold text-avaa-dark mb-2">Required Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(skills.length ? skills : ['No skills listed']).map(s => (
                                            <span key={s} className="text-xs px-3 py-1 bg-avaa-primary-light text-avaa-dark rounded-full font-semibold border border-avaa-primary/20">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                                <line x1="8" y1="21" x2="16" y2="21" />
                                                <line x1="12" y1="17" x2="12" y2="21" />
                                            </svg>
                                        </span>
                                        {app.job?.is_remote ? 'Remote' : 'On-site'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                                            </svg>
                                        </span>
                                        {app.job?.employment_type || 'Employment type not specified'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </span>
                                        {app.company.size || 'Company size not specified'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === 'timeline' && (
                            <div className="py-12 text-center text-sm text-gray-500">
                                Applied: {appliedDate} · Last Updated: {updatedDate}
                                {isInterviewing && app.interview ? ` · Interview: ${app.interview.date_label ?? 'Date TBD'}${app.interview.time_label ? ` ${app.interview.time_label}` : ''}` : ''}
                            </div>
                        )}

                        {tab === 'job' && (
                            <div className="py-12 text-center text-sm text-gray-500">
                                {app.job?.description || 'No additional job details available.'}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 sm:px-6 pb-5 pt-2 bg-white border-t border-gray-100 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ApplicationHistory({ applications }: Props) {
    const [tab, setTab] = useState<'all' | 'pending' | 'interviewing' | 'withdrawn' | 'rejected'>('all');
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selected, setSelected] = useState<ApplicationItem | null>(null);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawTarget, setWithdrawTarget] = useState<ApplicationItem | null>(null);
    const [withdrawing, setWithdrawing] = useState(false);

    const filtered = useMemo(() => {
        const norm = (s: Stage) => (s || '').toString().toLowerCase();
        if (tab === 'all') return applications;
        if (tab === 'pending') return applications.filter(a => norm(a.stage) === 'pending');
        if (tab === 'interviewing') return applications.filter(a => norm(a.stage) === 'interviewing');
        if (tab === 'rejected') return applications.filter(a => norm(a.stage) === 'rejected');
        return applications.filter(a => norm(a.stage) === 'withdrawn');
    }, [applications, tab]);

    const openDetails = (app: ApplicationItem) => {
        setSelected(app);
        setDetailsOpen(true);
    };

    const closeDetails = () => {
        setDetailsOpen(false);
    };

    const requestWithdraw = (app: ApplicationItem) => {
        setWithdrawTarget(app);
        setWithdrawOpen(true);
    };

    const closeWithdraw = () => {
        if (withdrawing) return;
        setWithdrawOpen(false);
        setWithdrawTarget(null);
    };

    const confirmWithdraw = () => {
        if (!withdrawTarget || withdrawing) return;
        setWithdrawing(true);

        // Demo cards use negative IDs; keep their withdraw action local.
        if (withdrawTarget.id < 0) {
            router.visit(route('job-seeker.applications.index'), {
                preserveScroll: true,
                onFinish: () => {
                    setWithdrawing(false);
                    closeWithdraw();
                },
            });
            return;
        }

        router.patch(
            route('job-seeker.applications.withdraw', withdrawTarget.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setWithdrawing(false);
                    closeWithdraw();
                },
            }
        );
    };

    return (
        <AppLayout>
            <Head title="Application History" />

            <div className="w-full max-w-none">
                <div className="mb-5">
                    <h1 className="text-xl font-extrabold text-avaa-dark">Application History</h1>
                    <p className="text-sm text-gray-500 mt-1">Track your active applications and manage your recruitment pipeline</p>
                </div>

                <div className="mb-6">
                    <SegmentedTabs
                        value={tab}
                        onChange={(v) => setTab(v as any)}
                        tabs={[
                            { key: 'all', label: 'All' },
                            { key: 'pending', label: 'Pending' },
                            { key: 'interviewing', label: 'For Interview' },
                            { key: 'withdrawn', label: 'Withdrawn' },
                            { key: 'rejected', label: 'Rejected' },
                        ]}
                    />
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="space-y-4">
                        {filtered.length === 0 ? (
                            <div className="py-2 text-center">
                                <p className="text-sm text-gray-500">No applications found for this filter.</p>
                            </div>
                        ) : (
                            filtered.map(app => (
                                <ApplicationCard
                                    key={app.id}
                                    app={app}
                                    onView={openDetails}
                                    onWithdraw={requestWithdraw}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Withdraw confirmation modal */}
            <Modal show={withdrawOpen} onClose={closeWithdraw} maxWidth="md" closeable={!withdrawing}>
                <div className="p-6 sm:p-7">
                    <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>

                        <div className="min-w-0">
                            <h3 className="text-[15px] sm:text-base font-extrabold text-avaa-dark leading-snug">
                                Withdraw application?
                            </h3>
                            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                                This will immediately mark your application for{' '}
                                <span className="font-semibold text-avaa-dark">
                                    {withdrawTarget?.job?.title ?? 'this job'}
                                </span>{' '}
                                as withdrawn. This action can’t be undone.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={closeWithdraw}
                            disabled={withdrawing}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmWithdraw}
                            disabled={withdrawing}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-rose-600/15 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {withdrawing ? 'Withdrawing…' : 'Withdraw'}
                        </button>
                    </div>
                </div>
            </Modal>

            <ApplicationDetailsModal open={detailsOpen} app={selected} onClose={closeDetails} />
        </AppLayout>
    );
}

