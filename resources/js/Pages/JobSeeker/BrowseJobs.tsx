import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useEffect, useRef } from 'react';

/* ── Types ── */
interface JobListing {
    id: number;
    title: string;
    location: string;
    company: string;
    employment_type?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    salary_currency?: string;
    skills_required?: string[];
    posted_date: string;
    description?: string;
    experience_level?: string | null;
    is_remote?: boolean;
    has_applied?: boolean;
    industry?: string | null;
}

interface Props {
    jobs: JobListing[];
    savedJobIds: number[];
    filters: {
        search?: string;
        date_posted?: string;
        skills?: string[];
        companies?: string[];
    };
    availableSkills: string[];
    availableCompanies: string[];
}

/* ── Helpers ── */
const AVATAR_COLORS = [
    'bg-[#3d6b6b]', 'bg-[#4a7c6f]', 'bg-[#5a6e7e]',
    'bg-[#4e5f6d]', 'bg-[#3b7070]', 'bg-[#566474]',
];
const getInitials = (name: string) =>
    name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function formatSalary(min?: number | null, max?: number | null, currency = 'USD') {
    if (!min && !max) return null;
    const sym = currency === 'PHP' ? '₱' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    const fmt = (n: number) => n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n.toLocaleString()}`;
    if (min && max) return `${fmt(min)}-${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max!)}`;
}

/* ── Job Detail Modal ── */
function JobDetailModal({ job, saved, onClose, onSave, onApply }: {
    job: JobListing; saved: boolean;
    onClose: () => void; onSave: () => void; onApply: () => void;
}) {
    useEffect(() => {
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', esc);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="h-28 bg-gradient-to-r from-avaa-primary/80 via-avaa-teal to-emerald-400 rounded-t-2xl flex-shrink-0 relative">
                    <button onClick={onClose}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div className="px-6 -mt-10 flex items-end justify-between flex-shrink-0 relative z-10">
                    <div className={`w-20 h-20 rounded-2xl ${avatarColor(job.id)} flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white shadow-md`}>
                        {getInitials(job.company)}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <button onClick={onSave}
                            className={`p-2 rounded-xl border transition-all ${saved
                                ? 'bg-avaa-primary-light border-avaa-primary/30 text-avaa-teal'
                                : 'bg-white border-gray-200 text-gray-400 hover:border-avaa-primary/30 hover:text-avaa-teal hover:bg-avaa-primary-light'}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                            </svg>
                        </button>
                        <button onClick={onApply} disabled={job.has_applied}
                            className="px-5 py-2 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 shadow-sm">
                            {job.has_applied ? 'Applied ✓' : 'Apply Now'}
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 px-6 pb-6 pt-3">
                    <h2 className="text-xl font-bold text-avaa-dark">{job.company}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 mb-5">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z"/>
                            </svg>
                            {job.location}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {timeAgo(job.posted_date)}
                        </span>
                        {job.employment_type && (
                            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                {job.employment_type}
                            </span>
                        )}
                        {formatSalary(job.salary_min, job.salary_max, job.salary_currency) && (
                            <span className="px-2.5 py-0.5 bg-avaa-primary-light text-avaa-teal text-xs font-medium rounded-full">
                                {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                        <div>
                            <h4 className="text-sm font-bold text-avaa-dark mb-2">Position</h4>
                            <ul className="space-y-1.5">
                                <li className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-avaa-teal flex-shrink-0"/>
                                    {job.title}
                                </li>
                                {job.experience_level && (
                                    <li className="flex items-start gap-2 text-sm text-gray-600">
                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-avaa-teal flex-shrink-0"/>
                                        {job.experience_level}
                                    </li>
                                )}
                            </ul>
                        </div>
                        {job.skills_required && job.skills_required.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-avaa-dark mb-2">Tech Stack Requirements:</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {job.skills_required.map(s => (
                                        <span key={s} className="px-2.5 py-0.5 bg-avaa-primary-light text-avaa-teal text-xs font-semibold rounded-full border border-avaa-primary/20">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {job.description && (
                        <div>
                            <h4 className="text-sm font-bold text-avaa-dark mb-2">Description</h4>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0 rounded-b-2xl">
                    <button onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Job Card ── */
function JobCard({ job, saved, onSave, onApply, onView }: {
    job: JobListing; saved: boolean;
    onSave: () => void; onApply: () => void; onView: () => void;
}) {
    const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all flex flex-col gap-3">
            <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl ${avatarColor(job.id)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {getInitials(job.company)}
                </div>
                <div className="min-w-0 flex-1">
                    <button onClick={onView}
                        className="text-sm font-bold text-avaa-dark hover:text-avaa-teal transition-colors text-left leading-tight block w-full truncate">
                        {job.title}
                    </button>
                    <p className="text-xs text-gray-400 mt-0.5">{job.company}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z"/>
                    </svg>
                    {job.location}
                </span>
                <span className="flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {timeAgo(job.posted_date)}
                </span>
                {job.employment_type && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-full">
                        {job.employment_type}
                    </span>
                )}
            </div>

            {job.skills_required && job.skills_required.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {job.skills_required.slice(0, 4).map(s => (
                        <span key={s} className="text-[11px] px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                            {s}
                        </span>
                    ))}
                    {job.skills_required.length > 4 && (
                        <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                            +{job.skills_required.length - 4}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
                <div>
                    {salary ? (
                        <>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Salary Range</p>
                            <p className="text-sm font-extrabold text-avaa-dark">{salary}</p>
                        </>
                    ) : (
                        <p className="text-xs text-gray-400 italic">Salary not disclosed</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onSave}
                        className={`p-2 rounded-xl border transition-all ${saved
                            ? 'border-avaa-primary/30 bg-avaa-primary-light text-avaa-teal'
                            : 'border-gray-200 text-gray-400 hover:border-avaa-primary/30 hover:text-avaa-teal hover:bg-avaa-primary-light'}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                        </svg>
                    </button>
                    <button onClick={onApply} disabled={job.has_applied}
                        className="px-4 py-1.5 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap">
                        {job.has_applied ? 'Applied ✓' : 'Apply Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Sidebar Filter Pill ── */
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${active
                ? 'bg-avaa-primary text-white border-avaa-primary shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-avaa-primary/40 hover:text-avaa-teal'}`}>
            {label}
        </button>
    );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function BrowseJobs({ jobs, savedJobIds, filters, availableSkills, availableCompanies }: Props) {
    const [search, setSearch]                   = useState(filters.search ?? '');
    const [dateFilter, setDateFilter]           = useState(filters.date_posted ?? 'all');
    const [selectedSkills, setSelectedSkills]   = useState<string[]>(filters.skills ?? []);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>(filters.companies ?? []);
    const [saved, setSaved]                     = useState<Set<number>>(new Set(savedJobIds));
    const [viewJob, setViewJob]                 = useState<JobListing | null>(null);
    const isFirstRender                         = useRef(true);

    const pushFilters = (overrides: Record<string, any> = {}) => {
        const params: Record<string, any> = {
            ...(search               ? { search }                          : {}),
            ...(dateFilter !== 'all' ? { date_posted: dateFilter }         : {}),
            ...(selectedSkills.length    ? { skills: selectedSkills }      : {}),
            ...(selectedCompanies.length ? { companies: selectedCompanies } : {}),
            ...overrides,
        };
        router.get(route('job-seeker.jobs.browse'), params, { preserveState: true, replace: true });
    };

    useEffect(() => {
        const t = setTimeout(() => pushFilters(), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        pushFilters();
    }, [selectedSkills, selectedCompanies, dateFilter]);

    const toggleSave = (jobId: number) => {
        setSaved(prev => {
            const next = new Set(prev);
            if (next.has(jobId)) {
                next.delete(jobId);
                router.delete(route('job-seeker.jobs.unsave', jobId), { preserveScroll: true });
            } else {
                next.add(jobId);
                router.post(route('job-seeker.jobs.save', jobId), {}, { preserveScroll: true });
            }
            return next;
        });
    };

    const handleApply = (jobId: number) => {
        router.post(route('job-seeker.jobs.apply', jobId), {}, {
            preserveScroll: true,
            onSuccess: () => setViewJob(v => v?.id === jobId ? { ...v, has_applied: true } : v),
        });
    };

    const DATE_FILTERS = [
        { label: 'All Time',   value: 'all'   },
        { label: 'Today',      value: 'today' },
        { label: 'This Week',  value: 'week'  },
        { label: 'This Month', value: 'month' },
    ];

    return (
        <AppLayout
            pageTitle="Browse Jobs"
            pageSubtitle={`${jobs.length} open position${jobs.length !== 1 ? 's' : ''}`}
            activeNav="Browse Jobs"
        >
            <Head title="Browse Jobs" />

            {viewJob && (
                <JobDetailModal
                    job={viewJob}
                    saved={saved.has(viewJob.id)}
                    onClose={() => setViewJob(null)}
                    onSave={() => toggleSave(viewJob.id)}
                    onApply={() => handleApply(viewJob.id)}
                />
            )}

            <div className="mb-5">
                <h1 className="text-xl font-extrabold text-avaa-dark">Find Your Next Role</h1>
                <p className="text-sm text-avaa-muted mt-0.5">Browse open positions from top companies</p>
            </div>

            <div className="flex gap-6">

                {/* ── Sidebar ── */}
                <aside className="hidden lg:flex flex-col gap-5 w-52 flex-shrink-0">

                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400 flex-shrink-0">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search Jobs"
                            className="text-sm bg-transparent text-avaa-dark placeholder-gray-400 focus:outline-none w-full min-w-0" />
                        {search && (
                            <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        )}
                    </div>

                    <div>
                        <p className="text-xs font-bold text-avaa-dark mb-2.5">Date Posted</p>
                        <div className="flex flex-wrap gap-1.5">
                            {DATE_FILTERS.map(f => (
                                <FilterPill key={f.value} label={f.label}
                                    active={dateFilter === f.value}
                                    onClick={() => setDateFilter(f.value)} />
                            ))}
                        </div>
                    </div>

                    {availableSkills.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-avaa-dark mb-2.5">Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                                {availableSkills.map(s => (
                                    <FilterPill key={s} label={s}
                                        active={selectedSkills.includes(s)}
                                        onClick={() => setSelectedSkills(prev =>
                                            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
                                ))}
                            </div>
                        </div>
                    )}

                    {availableCompanies.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-avaa-dark mb-2.5">Company</p>
                            <div className="space-y-2">
                                {availableCompanies.map(c => (
                                    <label key={c} className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" checked={selectedCompanies.includes(c)}
                                            onChange={() => setSelectedCompanies(prev =>
                                                prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                                            className="w-3.5 h-3.5 rounded border-gray-300 accent-avaa-primary cursor-pointer" />
                                        <span className="text-sm text-gray-600 group-hover:text-avaa-dark transition-colors">{c}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* ── Job Grid ── */}
                <div className="flex-1 min-w-0">
                    {jobs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-avaa-primary-light flex items-center justify-center mx-auto mb-4 text-avaa-teal">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                            </div>
                            <p className="font-semibold text-avaa-dark mb-1">No jobs found</p>
                            <p className="text-sm text-avaa-muted">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {jobs.map(job => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    saved={saved.has(job.id)}
                                    onSave={() => toggleSave(job.id)}
                                    onApply={() => handleApply(job.id)}
                                    onView={() => setViewJob(job)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}