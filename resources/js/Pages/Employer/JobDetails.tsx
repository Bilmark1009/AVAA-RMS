import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useRef, useEffect } from 'react';
import ImageInitialsFallback from '@/Components/ImageInitialsFallback';

/* ── Types ── */
interface JobListing {
    id: number;
    title: string;
    location: string;
    company: string;
    status: 'active' | 'inactive' | 'draft';
    applications_count: number;
    posted_date: string;
    description?: string;
    employment_type?: string;
    salary_min?: number | null;
    salary_max?: number | null;
    salary_currency?: string;
    salary_type?: string | null;
    skills_required?: string[];
    experience_level?: string;
    is_remote?: boolean;
    deadline?: string | null;
    industry?: string;
    application_limit?: number | null;
    responsibilities?: string[];   // ← changed: was string, now string[]
    qualifications?: string[];
    requirements?: string[];
    screener_questions?: string[];
    work_arrangement?: string;
    views_count?: number;
    clicks_count?: number;
    logo_url?: string | null;
    hiring_team?: { id: number | null; name: string; role: string; status: string; avatar?: string | null; email?: string }[];
}

interface Props {
    user: { first_name: string; last_name: string; email: string; role: string };
    profile: any;
    job: JobListing;
    isVerified: boolean;
    isOwner?: boolean;
}

/* ── Helpers ── */
function getInitials(title: string) {
    return title.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
const AVATAR_COLORS = ['bg-avaa-dark', 'bg-teal-700', 'bg-emerald-700', 'bg-slate-600', 'bg-cyan-700', 'bg-stone-600'];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

/* ── Delete Confirmation Modal ── */
function DeleteJobModal({
    jobTitle,
    onConfirm,
    onCancel,
    isDeleting,
}: {
    jobTitle: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
}) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            aria-labelledby="delete-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-modal-in">
                {/* Red accent top bar */}
                <div className="h-1 w-full bg-gradient-to-r from-red-400 to-red-500" />

                <div className="p-6">
                    {/* Icon + heading */}
                    <div className="flex items-start gap-4 mb-5">
                        <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                            <svg
                                width="20" height="20" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                className="text-red-500"
                            >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                        </div>
                        <div>
                            <h2 id="delete-modal-title" className="text-base font-bold text-gray-900 leading-snug">
                                Delete Job Listing?
                            </h2>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                You're about to permanently delete{' '}
                                <span className="font-semibold text-gray-700">"{jobTitle}"</span>.
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    {/* Warning box */}
                    <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-6">
                        <ul className="space-y-1.5">
                            {[
                                'All applications linked to this job will be removed.',
                                'Scheduled interviews may be affected.',
                                'This listing will no longer appear to job seekers.',
                            ].map(warning => (
                                <li key={warning} className="flex items-start gap-2 text-xs text-red-600">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {warning}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            disabled={isDeleting}
                            className="flex-1 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
                        >
                            {isDeleting ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
                                    </svg>
                                    Deleting…
                                </>
                            ) : (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                    </svg>
                                    Yes, Delete Job
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes modal-in {
                    from { opacity: 0; transform: scale(0.96) translateY(8px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-in { animation: modal-in 0.18s ease-out both; }
            `}</style>
        </div>
    );
}

/* ── Section Card ── */
function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
                <span className="text-[#6D9886] flex-shrink-0">{icon}</span>
                <span className="min-w-0 break-words">{title}</span>
            </h3>
            {children}
        </div>
    );
}

/* ── List Items ── */
function CheckItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-2.5 text-sm text-gray-600">
            <svg className="w-4 h-4 text-[#6D9886] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            {text}
        </li>
    );
}
function ArrowItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-2.5 text-sm text-gray-600">
            <svg className="w-4 h-4 text-[#6D9886] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></svg>
            {text}
        </li>
    );
}

/* ── Status Badge ── */
function StatusBadge({ status, jobId, editable = true }: { status: JobListing['status']; jobId: number; editable?: boolean }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!editable) return;
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [editable]);
    const cfg = {
        active: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Active' },
        inactive: { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', label: 'Inactive' },
        draft: { dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Draft' },
    }[status];

    if (!editable) {
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
            </span>
        );
    }

    return (
        <div ref={ref} className="relative inline-block">
            <button onClick={() => setOpen(o => !o)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-60"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {open && (
                <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[110px]">
                    {(['active', 'inactive', 'draft'] as const).filter(s => s !== status).map(s => {
                        const c = { active: { dot: 'bg-emerald-500', label: 'Active' }, inactive: { dot: 'bg-gray-400', label: 'Inactive' }, draft: { dot: 'bg-amber-400', label: 'Draft' } }[s];
                        return (
                            <button key={s} onClick={() => { router.patch(route('employer.jobs.status', jobId), { status: s }, { preserveScroll: true }); setOpen(false); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{c.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function JobDetails({ user, profile, job, isVerified }: Props) {
    const appLimit = job.application_limit ?? 0;
    const appCount = job.applications_count ?? 0;
    const appPct = appLimit > 0 ? Math.min(100, Math.round((appCount / appLimit) * 100)) : 0;
    const spotsLeft = appLimit > 0 ? Math.max(0, appLimit - appCount) : null;

    /* ── Delete state ── */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting]           = useState(false);
    const [linkCopied, setLinkCopied]           = useState(false);

    const handleShareJob = async () => {
        // Generate a clean shareable URL using the named route
        const jobUrl = route('shared.job.show', { job: job.id });
        const fullUrl = new URL(jobUrl, window.location.origin).toString();
        try {
            await navigator.clipboard.writeText(fullUrl);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 3000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = fullUrl;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 3000);
        }
    };

    function handleDeleteConfirm() {
        setIsDeleting(true);
        router.delete(route('employer.jobs.destroy', job.id), {
            onSuccess: () => {
                setIsDeleting(false);
                setShowDeleteModal(false);
            },
            onError: () => {
                setIsDeleting(false);
                setShowDeleteModal(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }

    return (
        <AppLayout pageTitle="Job Management" pageSubtitle="Monitor and manage job postings." activeNav="Manage Jobs">
            <Head title={`${job.title} — Job Details`} />

            {/* Link Copied Toast */}
            {linkCopied && (
                <div className="fixed top-4 right-4 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-green-500 shadow-lg z-[9999] animate-fade-in">
                    ✓ Link copied to clipboard!
                </div>
            )}

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <DeleteJobModal
                    jobTitle={job.title}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setShowDeleteModal(false)}
                    isDeleting={isDeleting}
                />
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-5 overflow-x-auto min-w-0">
                <button onClick={() => router.visit(route('employer.jobs.index'))} className="hover:text-[#6D9886] transition-colors font-medium flex-shrink-0">Job</button>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                <span className="text-gray-700 font-semibold truncate">Job Details</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-start">
                {/* ── Left: Main content ── */}
                <div className="flex-1 min-w-0 space-y-4">

                    {/* Header card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                                <ImageInitialsFallback
                                    src={job.logo_url}
                                    alt={`${job.company} logo`}
                                    initials={getInitials(job.company || job.title)}
                                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 shadow-sm ${job.logo_url ? 'bg-white border border-gray-200' : avatarColor(job.id)}`}
                                    textClassName="text-white text-lg sm:text-xl font-bold flex items-center justify-center"
                                />
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight break-words">{job.title}</h1>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-400">
                                        <span className="font-medium text-gray-600">{job.company}</span>
                                        <span className="flex items-center gap-1 flex-shrink-0">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z"/></svg>
                                            <span className="truncate">{job.location}</span>
                                        </span>
                                        <span className="flex items-center gap-1 flex-shrink-0">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                            {timeAgo(job.posted_date)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => router.visit(route('employer.jobs.edit', job.id))}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex-shrink-0 w-full sm:w-auto">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Edit Job
                            </button>
                        </div>

                        {/* Tag row */}
                        <div className="flex flex-wrap items-center gap-2 gap-y-1.5">
                            {job.employment_type && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                    {job.employment_type}
                                </span>
                            )}
                            {(job.salary_min || job.salary_max) && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#6D9886]/10 text-[#4a7360] border border-[#6D9886]/20">
                                    {job.salary_currency ?? 'USD'} {job.salary_min ? Number(job.salary_min).toLocaleString() : '—'}
                                    {job.salary_max ? `k–${Number(job.salary_max).toLocaleString()}k` : '+'}
                                </span>
                            )}
                            {job.salary_type && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                    {job.salary_type === 'one-time' ? 'One-time / Full Payment' : job.salary_type.charAt(0).toUpperCase() + job.salary_type.slice(1)}
                                </span>
                            )}
                            {job.work_arrangement && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                    {job.work_arrangement}
                                </span>
                            )}
                            <StatusBadge status={job.status} jobId={job.id} editable={false} />
                        </div>

                        {/* View Applicants CTA */}
                        <button onClick={() => router.visit(route('employer.jobs.applications', job.id))}
                            className="mt-5 w-full py-3 bg-[#6D9886] hover:bg-[#5a8371] text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                            View Applicants ({job.applications_count})
                        </button>
                    </div>

                    {/* Job Description */}
                    {job.description && (
                        <SectionCard
                            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}
                            title="Job Description"
                        >
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                        </SectionCard>
                    )}

                    {/* Key Responsibilities — now renders as a bullet list */}
                    {job.responsibilities && job.responsibilities.length > 0 && (
                        <SectionCard
                            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>}
                            title="Key Responsibilities"
                        >
                            <ul className="space-y-2">
                                {job.responsibilities.map((r, i) => <CheckItem key={i} text={r} />)}
                            </ul>
                        </SectionCard>
                    )}

                    {/* Qualifications */}
                    {job.qualifications && job.qualifications.length > 0 && (
                        <SectionCard
                            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
                            title="Qualifications"
                        >
                            <ul className="space-y-2">
                                {job.qualifications.map((q, i) => <CheckItem key={i} text={q} />)}
                            </ul>
                        </SectionCard>
                    )}

                    {/* Requirements */}
                    {job.requirements && job.requirements.length > 0 && (
                        <SectionCard
                            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>}
                            title="Requirements"
                        >
                            <ul className="space-y-2">
                                {job.requirements.map((r, i) => <ArrowItem key={i} text={r} />)}
                            </ul>
                        </SectionCard>
                    )}

                    {/* Skills Required */}
                    {job.skills_required && job.skills_required.length > 0 && (
                        <SectionCard
                            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
                            title="Skills Required"
                        >
                            <div className="flex flex-wrap gap-2">
                                {job.skills_required.map(s => (
                                    <span key={s} className="px-3 py-1.5 bg-[#6D9886]/10 text-[#4a7360] text-xs font-semibold rounded-full border border-[#6D9886]/20">{s}</span>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Work Arrangement */}
                    {job.work_arrangement && (
                        <SectionCard
                            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}
                            title="Work Arrangement"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-gray-500 w-24 flex-shrink-0">Arrangement</span>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                                        {job.work_arrangement}
                                    </span>
                                </div>
                                {job.location && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-xs font-semibold text-gray-500 w-24 flex-shrink-0 pt-0.5">Details</span>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {job.work_arrangement === 'Hybrid' && `Combination of remote and on-site work at ${job.location}.`}
                                            {job.work_arrangement === 'Remote' && 'Fully remote position — work from anywhere.'}
                                            {job.work_arrangement === 'On-site' && `On-site at ${job.location}.`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    )}

                    {/* Screener Questions */}
                    {job.screener_questions && job.screener_questions.length > 0 && (
                        <SectionCard
                            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
                            title="Screener Questions"
                        >
                            <ol className="space-y-2 mb-3">
                                {job.screener_questions.map((q, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                                        <span className="w-5 h-5 rounded-full bg-[#6D9886]/15 text-[#4a7360] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                        {q}
                                    </li>
                                ))}
                            </ol>
                            <p className="text-xs text-gray-400 italic">These questions are shown to applicants during application submission.</p>
                        </SectionCard>
                    )}

                    {/* Footer actions */}
                    <div className="flex justify-end gap-3 py-2 px-1">
                        <button onClick={handleShareJob} title="Copy link to clipboard" className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                        </button>
                    </div>
                </div>

                {/* ── Right: Sidebar ── */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-4 lg:max-w-[16rem]">

                    {/* Meet the Hiring Team */}
                    {job.hiring_team && job.hiring_team.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Meet the Hiring Team</h3>
                            <div className="space-y-3">
                                {job.hiring_team.map((member, i) => {
                                    const statusCfg: Record<string, { dot: string; text: string; bg: string; label: string }> = {
                                        owner:    { dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', label: 'Owner' },
                                        accepted: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Accepted' },
                                        pending:  { dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', label: 'Pending' },
                                        declined: { dot: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50', label: 'Declined' },
                                    };
                                    const cfg = statusCfg[member.status] ?? statusCfg.pending;
                                    return (
                                        <div key={member.id ?? `owner-${i}`} className="flex items-center gap-3">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-[#6D9886] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                    {member.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{member.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{member.role}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                {cfg.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Job Insights */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Job Insights</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Applicants', value: job.applications_count },
                                ...(job.salary_max ? [{ label: 'Budget', value: `${job.salary_currency ?? 'USD'} ${Number(job.salary_max).toLocaleString()}` }] : []),
                                ...(job.views_count !== undefined ? [{ label: 'Views', value: job.views_count.toLocaleString() }] : []),
                                ...(job.clicks_count !== undefined ? [{ label: 'Clicks', value: job.clicks_count.toLocaleString() }] : []),
                                ...(job.deadline ? [{ label: 'Expires', value: job.deadline }] : []),
                                ...(job.industry ? [{ label: 'Industry', value: job.industry }] : []),
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">{item.label}</span>
                                    <span className="text-sm font-semibold text-gray-800">{item.value}</span>
                                </div>
                            ))}
                            {/* Status row with badge */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Status</span>
                                <StatusBadge status={job.status} jobId={job.id} />
                            </div>
                        </div>
                    </div>

                    {/* Application Limit */}
                    {appLimit > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Application Limit</h3>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                                <span>Applications</span>
                                <span className="font-semibold text-gray-700">{appCount} / {appLimit}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${appPct >= 90 ? 'bg-red-400' : appPct >= 70 ? 'bg-amber-400' : 'bg-[#6D9886]'}`}
                                    style={{ width: `${appPct}%` }}
                                />
                            </div>
                            {spotsLeft !== null && (
                                <p className="text-xs text-gray-400 mt-1.5">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining</p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                                onClick={() => router.post(route('employer.jobs.duplicate', job.id))}
                                className="py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center"
                            >
                                Duplicate Job
                            </button>
                            <button
                                onClick={() => router.post(route('employer.jobs.repost', job.id))}
                                className="py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center"
                            >
                                Repost
                            </button>
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="mt-2 w-full py-2.5 text-sm font-semibold text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
                        >
                            Delete Job
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}