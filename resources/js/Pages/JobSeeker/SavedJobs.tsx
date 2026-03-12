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
                <div className={`w-14 h-14 rounded-full ${avatarColor(job.id)} flex items-center justify-center text-white text-base font-bold flex-shrink-0`}>
                    {getInitials(job.company)}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                    <button onClick={onView}
                        className="text-[15px] font-bold text-avaa-dark hover:text-avaa-teal transition-colors text-left leading-snug block w-full truncate">
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

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function SavedJobs({ user, savedJobs, filters, availableSkills, availableCompanies }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [dateFilter, setDateFilter] = useState(filters.date_posted ?? 'all');
    const [selectedSkills, setSelectedSkills] = useState<string[]>(filters.skills ?? []);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>(filters.companies ?? []);
    const [jobs, setJobs] = useState<JobListing[]>(savedJobs);
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

    const handleView = (jobId: number) => router.visit(route('job-seeker.jobs.show', jobId));

    const DATE_FILTERS = [
        { label: 'All Time', value: 'all' }, { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' }, { label: 'This Month', value: 'month' },
    ];

    return (
        <AppLayout activeNav="Saved Jobs" pageTitle="Saved Jobs">
            <Head title="Saved Jobs" />

            {/* Page heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-avaa-dark">Saved Jobs</h1>
                <p className="text-base text-avaa-muted mt-2">Browse the jobs you've saved.</p>
            </div>

            <div className="flex gap-8">

                {/* ── Sidebar ── */}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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