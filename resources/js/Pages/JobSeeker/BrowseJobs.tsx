import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import JobSeekerOnboarding from '@/Components/Modals/JobSeekerOnboarding';
import ImageInitialsFallback from '@/Components/ImageInitialsFallback';
import { useState, useEffect, useRef } from 'react';

/* ── Types ── */
interface JobListing {
    id: number;
    title: string;
    location: string;
    company: string;
    logo_url?: string | null;
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
    application_status?: string | null;
    industry?: string | null;
}

interface Props {
    jobs: JobListing[];
    savedJobIds: number[];
    filters: { search?: string; date_posted?: string; skills?: string[]; companies?: string[] };
    availableSkills: string[];
    availableCompanies: string[];
    profileComplete: boolean;
}

/* ── Helpers ── */
const AVATAR_COLORS = ['bg-[#3d6b6b]', 'bg-[#4a7c6f]', 'bg-[#5a6e7e]', 'bg-[#4e5f6d]', 'bg-[#3b7070]', 'bg-[#566474]'];
const getInitials = (name: string) => name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function formatSalary(min?: number | null, max?: number | null, currency = 'USD') {
    if (!min && !max) return null;
    const sym = currency === 'PHP' ? '₱' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    const fmt = (n: number) => {
        const num = Number(n);
        return num >= 1000 ? `${sym}${Math.round(num / 1000)}k` : `${sym}${num.toLocaleString()}`;
    };
    if (min && max) return `${fmt(min)}-${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max!)}`;
}

/* ─────────────────────────────────────────
   JOB CARD
   Card padding: 24px | Avatar: 56px | Title: 16px bold
   Meta text: 14px | Skill pills: 12px | Buttons: 14px/36px tall
───────────────────────────────────────── */
function JobCard({ job, saved, onSave, onApply, onView }: {
    job: JobListing; saved: boolean;
    onSave: () => void; onApply: () => void; onView: () => void;
}) {
    const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
    const status = (job.application_status || '').toLowerCase();
    const isRejected = status === 'rejected';
    const isEnded = status === 'contract_ended';
    const isApplied = Boolean(job.has_applied);

    const applyLabel = isRejected
        ? 'Rejected'
        : isEnded
            ? 'Ended'
            : isApplied
                ? 'Applied ✓'
                : 'Apply Now';

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-gray-300 transition-all flex flex-col gap-4 min-w-0 overflow-hidden">

            {/* Avatar + title */}
            <div className="flex items-start gap-4">
                <ImageInitialsFallback
                    src={job.logo_url}
                    alt={`${job.company} logo`}
                    initials={getInitials(job.company)}
                    className={`w-14 h-14 rounded-full border border-gray-200 flex-shrink-0 overflow-hidden ${job.logo_url ? 'bg-white' : avatarColor(job.id)}`}
                    textClassName="text-white text-base font-bold flex items-center justify-center"
                />
                <div className="min-w-0 flex-1 pt-0.5">
                    <h3 className="text-[15px] font-bold text-avaa-dark leading-snug">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
                </div>
            </div>

            {/* Location / time / type badge */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z" />
                    </svg>
                    {job.is_remote ? 'Remote' : job.location}
                </span>
                <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    {timeAgo(job.posted_date)}
                </span>
                {job.employment_type && (
                    <span className="px-3 py-1 bg-avaa-primary-light text-avaa-teal text-xs font-semibold rounded-full">
                        {job.employment_type}
                    </span>
                )}
            </div>

            {/* Skill pills */}
            {job.skills_required && job.skills_required.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {job.skills_required.slice(0, 4).map(s => (
                        <span key={s} className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">{s}</span>
                    ))}
                    {job.skills_required.length > 4 && (
                        <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">+{job.skills_required.length - 4}</span>
                    )}
                </div>
            )}

            {/* Footer: salary + actions — stack on small screens, row on md+; actions wrap */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-gray-100 mt-auto">
                <div className="min-w-0 flex-shrink-0">
                    {salary ? (
                        <>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Salary Range</p>
                            <p className="text-base font-extrabold text-avaa-dark">{salary}</p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Salary not disclosed</p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1 justify-end">
                    <button onClick={onSave}
                        className={`p-2.5 rounded-xl border transition-all flex-shrink-0 ${saved
                            ? 'border-avaa-primary/30 bg-avaa-primary-light text-avaa-teal'
                            : 'border-gray-200 text-gray-400 hover:border-avaa-primary/30 hover:text-avaa-teal hover:bg-avaa-primary-light'}`}
                        aria-label={saved ? 'Unsave job' : 'Save job'}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                        </svg>
                    </button>
                    <button onClick={onView}
                        className="px-3 py-2 sm:px-4 border border-gray-300 text-gray-700 hover:border-avaa-primary hover:text-avaa-teal text-sm font-semibold rounded-xl transition-colors min-w-0">
                        View Details
                    </button>
                    <button onClick={onApply} disabled={isApplied}
                        className="px-3 py-2 sm:px-4 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-w-0">
                        <span className="inline-flex items-center gap-1.5">
                            {applyLabel}
                            {isRejected && (
                                <span aria-hidden="true" className="text-[12px] leading-none">✘</span>
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Filter Pill — 14px text, 36px tall ── */
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${active
                ? 'bg-avaa-primary text-white border-avaa-primary shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-avaa-primary/40 hover:text-avaa-teal'}`}>
            {label}
        </button>
    );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function BrowseJobs({ jobs, savedJobIds, filters, availableSkills, availableCompanies, profileComplete }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [dateFilter, setDateFilter] = useState(filters.date_posted ?? 'all');
    const [selectedSkills, setSelectedSkills] = useState<string[]>(filters.skills ?? []);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>(filters.companies ?? []);
    const [saved, setSaved] = useState<Set<number>>(new Set(savedJobIds));
    const isFirstRender = useRef(true);
    const isFirstRenderSearch = useRef(true);

    const pushFilters = (overrides: Record<string, any> = {}) => {
        const params: Record<string, any> = {
            ...(search ? { search } : {}),
            ...(dateFilter !== 'all' ? { date_posted: dateFilter } : {}),
            ...(selectedSkills.length ? { skills: selectedSkills } : {}),
            ...(selectedCompanies.length ? { companies: selectedCompanies } : {}),
            ...overrides,
        };
        router.get(route('job-seeker.jobs.browse'), params, { preserveState: true, replace: true });
    };

    useEffect(() => {
        if (isFirstRenderSearch.current) { isFirstRenderSearch.current = false; return; }
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
            if (next.has(jobId)) { next.delete(jobId); router.delete(route('job-seeker.jobs.unsave', jobId), { preserveScroll: true }); }
            else { next.add(jobId); router.post(route('job-seeker.jobs.save', jobId), {}, { preserveScroll: true }); }
            return next;
        });
    };

    const handleApply = (jobId: number) => router.visit(route('job-seeker.jobs.apply', jobId));
    const handleView = (jobId: number) => router.visit(route('job-seeker.jobs.show', jobId));

    const DATE_FILTERS = [
        { label: 'All Time', value: 'all' }, { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' }, { label: 'This Month', value: 'month' },
    ];

    return (
        <>
            {!profileComplete && <JobSeekerOnboarding />}
            <AppLayout activeNav="Jobs" pageTitle="Browse Jobs">
                <Head title="Browse Jobs" />

                {/* Page heading */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-avaa-dark">Find Your Next Role</h1>
                    <p className="text-sm sm:text-base text-avaa-muted mt-2">Browse open positions from top companies</p>
                </div>

                {/* Mobile search + date filters (visible when sidebar hidden) */}
                <div className="lg:hidden mb-6 space-y-4">
                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 h-11 shadow-sm focus-within:ring-2 focus-within:ring-avaa-primary/20 focus-within:border-avaa-primary transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400 flex-shrink-0">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Jobs"
                            className="text-sm border-none focus:ring-0 p-0 bg-transparent text-avaa-dark placeholder-gray-400 focus:outline-none w-full min-w-0" />
                        {search && (
                            <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-avaa-dark mb-2">Date Posted</p>
                        <div className="flex flex-wrap gap-2">
                            {DATE_FILTERS.map(f => (
                                <FilterPill key={f.value} label={f.label} active={dateFilter === f.value} onClick={() => setDateFilter(f.value)} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-8 min-w-0 overflow-x-hidden w-full max-w-full">

                    {/* ── Sidebar — 288px wide; hide on smaller screens ── */}
                    <aside className="hidden lg:flex flex-col gap-7 w-72 flex-shrink-0 min-w-0 overflow-hidden">

                        {/* Search — 44px tall standard input */}
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 h-11 shadow-sm focus-within:ring-2 focus-within:ring-avaa-primary/20 focus-within:border-avaa-primary transition-all">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400 flex-shrink-0">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Jobs"
                                className="text-sm border-none focus:ring-0 p-0 bg-transparent text-avaa-dark placeholder-gray-400 focus:outline-none w-full" />
                            {search && (
                                <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Date Posted */}
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-avaa-dark mb-3">Date Posted</p>
                            <div className="flex flex-wrap gap-2">
                                {DATE_FILTERS.map(f => (
                                    <FilterPill key={f.value} label={f.label} active={dateFilter === f.value} onClick={() => setDateFilter(f.value)} />
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        {availableSkills.length > 0 && (
                            <div>
                                <p className="text-sm font-bold text-avaa-dark mb-3">Skills</p>
                                <div className="flex flex-wrap gap-2 items-stretch">
                                    {availableSkills.map(s => (
                                        <FilterPill key={s} label={s} active={selectedSkills.includes(s)}
                                            onClick={() => setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Company */}
                        {availableCompanies.length > 0 && (
                            <div>
                                <p className="text-sm font-bold text-avaa-dark mb-3">Company</p>
                                <div className="space-y-3">
                                    {availableCompanies.map(c => (
                                        <label key={c} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" checked={selectedCompanies.includes(c)}
                                                onChange={() => setSelectedCompanies(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                                                className="w-4 h-4 rounded border-gray-300 accent-avaa-primary cursor-pointer" />
                                            <span className="text-sm text-gray-600 group-hover:text-avaa-dark transition-colors">{c}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* ── Job Grid ── */}
                    <div className="flex-1 min-w-0 w-full max-w-full overflow-hidden">
                        {jobs.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-20 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-avaa-primary-light flex items-center justify-center mx-auto mb-5 text-avaa-teal">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                </div>
                                <p className="text-lg font-semibold text-avaa-dark mb-1">No jobs found</p>
                                <p className="text-base text-avaa-muted">Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-[repeat(2,minmax(0,1fr))] gap-5 w-full max-w-full">
                                {jobs.map(job => (
                                    <JobCard key={job.id} job={job} saved={saved.has(job.id)}
                                        onSave={() => toggleSave(job.id)}
                                        onApply={() => handleApply(job.id)}
                                        onView={() => handleView(job.id)} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}