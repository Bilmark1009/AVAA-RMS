import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
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
    has_applied?: boolean;
    application_status?: string | null;
    industry?: string | null;
}

interface Props {
    user: { name: string; email: string; role: string };
    savedJobs: JobListing[];
    filters: { search?: string; date_posted?: string; skills?: string[]; companies?: string[] };
    availableSkills: string[];
    availableCompanies: string[];
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
    const fmt = (n: number) => n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n.toLocaleString()}`;
    if (min && max) return `${fmt(min)}-${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max!)}`;
}

/* ─────────────────────────────────────────
   SAVED JOB CARD
───────────────────────────────────────── */
function SavedJobCard({ job, onApply, onView }: {
    job: JobListing; onApply: () => void; onView: () => void;
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
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-gray-300 transition-all flex flex-col gap-4">

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
                    <button onClick={onView}
                        className="text-[15px] font-bold text-avaa-dark hover:text-avaa-teal transition-colors text-left leading-snug block w-full whitespace-normal break-words">
                        {job.title}
                    </button>
                    <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
                </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z" />
                    </svg>
                    {job.location}
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

            {/* Skills */}
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

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                <div>
                    {salary ? (
                        <>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Salary Range</p>
                            <p className="text-base font-extrabold text-avaa-dark">{salary}</p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Salary not disclosed</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onView}
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:border-avaa-primary hover:text-avaa-teal text-sm font-semibold rounded-xl transition-colors whitespace-nowrap">
                        View Details
                    </button>
                    <button onClick={onApply} disabled={isApplied}
                        className="px-4 py-2 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap">
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

/* ── Filter Pill ── */
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

/* ── Drawer Filter Section ── */
function DrawerFilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs font-bold text-avaa-dark uppercase tracking-wider mb-3">{title}</p>
            {children}
        </div>
    );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function SavedJobs({ user, savedJobs, filters, availableSkills, availableCompanies }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [dateFilter, setDateFilter] = useState(filters.date_posted ?? 'all');
    const [selectedSkills, setSelectedSkills] = useState<string[]>(filters.skills ?? []);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>(filters.companies ?? []);
    const [jobs, setJobs] = useState<JobListing[]>(savedJobs);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const isFirstRender = useRef(true);
    const isFirstRenderSearch = useRef(true);

    useEffect(() => { setJobs(savedJobs); }, [savedJobs]);

    const pushFilters = () => {
        router.get(route('job-seeker.jobs.saved'), {
            ...(search ? { search } : {}),
            ...(dateFilter !== 'all' ? { date_posted: dateFilter } : {}),
            ...(selectedSkills.length ? { skills: selectedSkills } : {}),
            ...(selectedCompanies.length ? { companies: selectedCompanies } : {}),
        }, { preserveState: true, replace: true });
    };

    useEffect(() => {
        if (isFirstRenderSearch.current) { isFirstRenderSearch.current = false; return; }
        const t = setTimeout(pushFilters, 400);
        return () => clearTimeout(t);
    }, [search]);
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        pushFilters();
    }, [selectedSkills, selectedCompanies, dateFilter]);

    const handleApply = (jobId: number) => {
        router.post(route('job-seeker.jobs.apply', jobId), {}, {
            preserveScroll: true,
            onSuccess: () => setJobs(prev => prev.map(j => j.id === jobId ? { ...j, has_applied: true } : j)),
        });
    };

    const handleView = (jobId: number) =>
        router.visit(route('job-seeker.jobs.show', { job: jobId, from: 'saved' }));

    const DATE_FILTERS = [
        { label: 'All Time', value: 'all' }, { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' }, { label: 'This Month', value: 'month' },
    ];

    const activeFilterCount =
        (dateFilter !== 'all' ? 1 : 0) +
        selectedSkills.length +
        selectedCompanies.length;

    return (
        <AppLayout activeNav="Saved Jobs" pageTitle="Saved Jobs">
            <Head title="Saved Jobs" />

            {/* ── Mobile Filter Drawer ── */}
            {/* Backdrop */}
            <div
                className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer panel */}
            <div
                className={`lg:hidden fixed top-0 left-0 z-50 h-full w-[85vw] max-w-xs bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    drawerOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-avaa-teal">
                            <line x1="4" y1="6" x2="20" y2="6" />
                            <line x1="8" y1="12" x2="20" y2="12" />
                            <line x1="12" y1="18" x2="20" y2="18" />
                        </svg>
                        <span className="text-base font-bold text-avaa-dark">Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-avaa-primary text-white text-xs font-bold rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setDrawerOpen(false)}
                        className="p-2 rounded-lg text-gray-400 hover:text-avaa-dark hover:bg-gray-100 transition-colors"
                        aria-label="Close filters"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Drawer body */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                    {/* Date Posted */}
                    <DrawerFilterSection title="Date Posted">
                        <div className="flex flex-wrap gap-2">
                            {DATE_FILTERS.map(f => (
                                <FilterPill key={f.value} label={f.label} active={dateFilter === f.value}
                                    onClick={() => setDateFilter(f.value)} />
                            ))}
                        </div>
                    </DrawerFilterSection>

                    {/* Skills */}
                    {availableSkills.length > 0 && (
                        <DrawerFilterSection title="Skills">
                            <div className="flex flex-wrap gap-2">
                                {availableSkills.map(s => (
                                    <FilterPill key={s} label={s} active={selectedSkills.includes(s)}
                                        onClick={() => setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
                                ))}
                            </div>
                        </DrawerFilterSection>
                    )}

                    {/* Company */}
                    {availableCompanies.length > 0 && (
                        <DrawerFilterSection title="Company">
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
                        </DrawerFilterSection>
                    )}
                </div>

                {/* Drawer footer */}
                {activeFilterCount > 0 && (
                    <div className="px-5 py-4 border-t border-gray-100">
                        <button
                            onClick={() => {
                                setDateFilter('all');
                                setSelectedSkills([]);
                                setSelectedCompanies([]);
                            }}
                            className="w-full py-2.5 text-sm font-semibold text-avaa-teal border border-avaa-primary/30 rounded-xl hover:bg-avaa-primary-light transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Page heading */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-avaa-dark">Saved Jobs</h1>
                <p className="text-sm sm:text-base text-avaa-muted mt-2">Browse the jobs you've saved.</p>
            </div>

            {/* ── Mobile top bar: search + filter trigger (hidden on lg+) ── */}
            <div className="lg:hidden mb-5 flex items-center gap-3">
                {/* Search */}
                <div className="flex-1 flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 h-11 shadow-sm focus-within:ring-2 focus-within:ring-avaa-primary/20 focus-within:border-avaa-primary transition-all">
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
                {/* Filter drawer trigger */}
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="relative flex-shrink-0 flex items-center gap-2 px-4 h-11 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-700 hover:border-avaa-primary/40 hover:text-avaa-teal transition-colors"
                    aria-label="Open filters"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="8" y1="12" x2="20" y2="12" />
                        <line x1="12" y1="18" x2="20" y2="18" />
                    </svg>
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-avaa-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            <div className="flex gap-8 min-w-0 overflow-x-hidden">

                {/* ── Sidebar (desktop) ── */}
                <aside className="hidden lg:flex flex-col gap-7 w-72 flex-shrink-0">

                    {/* Search */}
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
                    <div>
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
                            <div className="flex flex-wrap gap-2">
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
                <div className="flex-1 min-w-0">
                    {jobs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-20 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-avaa-primary-light flex items-center justify-center mx-auto mb-5 text-avaa-teal">
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                </svg>
                            </div>
                            <p className="text-lg font-semibold text-avaa-dark mb-1">No saved jobs yet</p>
                            <p className="text-base text-avaa-muted mb-6">Save jobs while browsing to find them here later.</p>
                            <button onClick={() => router.visit(route('job-seeker.jobs.browse'))}
                                className="px-6 py-2.5 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors">
                                Browse Jobs
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {jobs.map(job => (
                                <SavedJobCard key={job.id} job={job}
                                    onApply={() => handleApply(job.id)}
                                    onView={() => handleView(job.id)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}