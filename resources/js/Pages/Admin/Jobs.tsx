import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import ImageInitialsFallback from '@/Components/ImageInitialsFallback';

/* ── Types ── */
interface Job {
    id: number;
    title: string;
    company: string;
    logo_url?: string | null;
    location: string;
    employment_type: string;
    is_remote: boolean;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    status: string;
    skills_required: string[];
    industry: string | null;
    applications_count: number;
    created_at: string;
}

interface Paginator {
    data: Job[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    jobs: Paginator;
    filters: { search: string; type: string };
}

/* ── Helpers ── */
function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatSalary(min: number | null, max: number | null, currency: string) {
    if (!min && !max) return null;
    const fmt = (v: number) => {
        const num = Number(v);
        if (num >= 1000) return `${currency} ${(num / 1000).toFixed(0)}k`;
        return `${currency} ${num.toFixed(0)}`;
    };
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
}

const AVATAR_BG = ['bg-[#3d9e9e]', 'bg-slate-700', 'bg-emerald-600', 'bg-violet-600', 'bg-rose-500', 'bg-amber-600'];

/* ── Icons ── */
const IcoSearch = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IcoMapPin = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z" />
    </svg>
);
const IcoClock = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const IcoUsers = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);
const IcoBriefcase = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="12" /><line x1="12" y1="16" x2="12" y2="16" />
    </svg>
);
const IcoArrow = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, string> = {
        active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        inactive: 'bg-gray-100 text-gray-500 border-gray-200',
        draft: 'bg-amber-50 text-amber-700 border-amber-100',
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg[status] ?? cfg.inactive}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500' : status === 'draft' ? 'bg-amber-400' : 'bg-gray-400'}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

/* ── Job Card ── */
function JobCard({ job }: { job: Job }) {
    const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
    const bgIdx = job.id % AVATAR_BG.length;
    const initials = job.company.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <Link
            href={route('admin.jobs.show', job.id)}
            className="group bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#3d9e9e]/40 hover:shadow-md hover:shadow-[#3d9e9e]/5 transition-all block"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-3">
                    <ImageInitialsFallback
                        src={job.logo_url}
                        alt={job.company}
                        initials={initials}
                        className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ${job.logo_url ? 'bg-white border border-gray-200' : AVATAR_BG[bgIdx]}`}
                        imgClassName="w-full h-full object-cover"
                        textClassName="text-white text-sm font-bold flex items-center justify-center"
                    />
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#3d9e9e] transition-colors leading-tight">{job.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{job.company}</p>
                    </div>
                </div>
                <StatusBadge status={job.status} />
            </div>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-3 mb-3">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                    <IcoMapPin />{job.is_remote ? 'Remote' : job.location}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                    <IcoClock /> {timeAgo(job.created_at)}
                </span>
                {job.employment_type && (
                    <span className="px-2 py-0.5 rounded-full bg-[#e8f4f4] text-[#3d9e9e] text-xs font-semibold">
                        {job.employment_type}
                    </span>
                )}
            </div>

            {/* Skills (top 3) */}
            {job.skills_required.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {job.skills_required.slice(0, 3).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 text-xs">{s}</span>
                    ))}
                    {job.skills_required.length > 3 && (
                        <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-400 text-xs">+{job.skills_required.length - 3}</span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <IcoUsers />{job.applications_count} applicant{job.applications_count !== 1 ? 's' : ''}
                </div>
                {salary && <span className="text-xs font-semibold text-gray-700">{salary}</span>}
                <span className="text-gray-300 group-hover:text-[#3d9e9e] transition-colors"><IcoArrow /></span>
            </div>
        </Link>
    );
}

/* ── Main Page ── */
export default function AdminJobs({ jobs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [type, setType] = useState(filters.type ?? 'all');

    const applyFilters = (overrides: Partial<{ search: string; type: string }>) => {
        router.get(route('admin.jobs.index'), {
            search: overrides.search ?? search,
            type: overrides.type ?? type,
        }, { preserveState: true, replace: true });
    };

    const handleTab = (t: string) => { setType(t); applyFilters({ type: t }); };

    const TYPE_TABS = [
        { key: 'all', label: 'All' },
        { key: 'full-time', label: 'Full Time' },
        { key: 'part-time', label: 'Part Time' },
        { key: 'contract', label: 'Contract' },
        { key: 'remote', label: 'Remote' },
    ];

    return (
        <>
            <Head title="Job Management – Admin" />
            <AppLayout pageTitle="Job Management" pageSubtitle="Monitor and manage job postings." activeNav="Jobs">

                {/* ── Toolbar ── */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    {/* Type tabs */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5 flex-wrap">
                        {TYPE_TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => handleTab(tab.key)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all
                                    ${type === tab.key ? 'bg-avaa-dark text-white shadow-sm' : 'text-gray-500 hover:text-avaa-dark hover:bg-gray-50'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <form onSubmit={e => { e.preventDefault(); applyFilters({}); }}
                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-10 w-64 shadow-sm">
                        <span className="text-gray-400 flex-shrink-0"><IcoSearch /></span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search jobs..."
                            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none border-0 w-full"
                        />
                    </form>
                </div>

                {/* ── Summary ── */}
                <p className="text-xs text-gray-400 mb-4">
                    Showing <span className="font-semibold text-gray-700">{jobs.total}</span> job posting{jobs.total !== 1 ? 's' : ''}
                </p>

                {/* ── Grid ── */}
                {jobs.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 py-24 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#e8f4f4] flex items-center justify-center text-[#3d9e9e] mb-4">
                            <IcoBriefcase />
                        </div>
                        <p className="text-base font-bold text-gray-800 mb-1">No jobs found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {jobs.data.map(job => <JobCard key={job.id} job={job} />)}
                    </div>
                )}

                {/* ── Pagination ── */}
                {jobs.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            Page {jobs.current_page} of {jobs.last_page}
                        </p>
                        <div className="flex items-center gap-1">
                            {jobs.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                                        ${link.active ? 'bg-[#3d9e9e] text-white' : link.url ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

            </AppLayout>
        </>
    );
}
