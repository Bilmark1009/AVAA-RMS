import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ImageInitialsFallback from '@/Components/ImageInitialsFallback';
import { useState, useEffect } from 'react';

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
    responsibilities?: string | string[];
    qualifications?: string | string[];
    requirements?: string | string[];
    project_timeline?: string;
    application_process?: string;
    onboarding_process?: string;
    screener_questions?: string[];
    experience_level?: string | null;
    is_remote?: boolean;
    has_applied?: boolean;
    industry?: string | null;
    deadline?: string | null;
    work_arrangement?: string | null;
}

interface HiringTeamMember {
    id: number;
    name: string;
    title: string;          // company name or 'Recruiter'
    avatar?: string | null;
    email: string;
    phone?: string | null;
    company?: string | null;
    industry?: string | null;
    company_size?: string | null;
    location?: string | null;
    company_website?: string | null;
    linkedin_url?: string | null;
    facebook_url?: string | null;
    twitter_url?: string | null;
}

interface SimilarJob {
    id: number; title: string; company: string; location: string;
    logo_url?: string | null;
    salary_min?: number | null; salary_max?: number | null; salary_currency?: string; is_remote?: boolean;
}

interface Props {
    job: JobListing;
    hiringTeam?: HiringTeamMember[];
    similarJobs?: SimilarJob[];
    isSaved?: boolean;
    hasApplied?: boolean;
    source?: 'saved' | 'browse';
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
    if (min && max) return `${fmt(min)}–${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max!)}`;
}

/** Normalise a field that may arrive as a string or string[] into a clean array */
function toLines(value?: string | string[] | null): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(s => String(s).trim()).filter(Boolean);
    return value.split('\n').map(s => s.trim()).filter(Boolean);
}

/* ── Section heading ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="text-base font-bold text-avaa-dark mb-3">{children}</h3>;
}

/* ── Bullet list ── */
function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-gray-600">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-avaa-teal flex-shrink-0" />
                    {item}
                </li>
            ))}
        </ul>
    );
}

/* ══════════════════════════════════════════════
   RECRUITER PROFILE MODAL
   Reuses the Employer Profile.tsx visual design
══════════════════════════════════════════════ */
function RecruiterProfileModal({
    member,
    onClose,
}: {
    member: HiringTeamMember;
    onClose: () => void;
}) {
    const initials = getInitials(member.name);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        /* ── Backdrop ── */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* ── Modal card ── */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

                {/* Gradient hero — mirrors Employer Profile.tsx */}
                <div className="h-28 bg-gradient-to-r from-avaa-primary/80 via-avaa-teal to-emerald-400 relative flex-shrink-0">
                    <div
                        className="absolute inset-0 opacity-20 z-0"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors z-10"
                        aria-label="Close"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 pb-6">
                    {/* Avatar row */}
                    <div className="flex items-end justify-between -mt-10 mb-4 relative z-10">
                        <ImageInitialsFallback
                            src={member.avatar}
                            alt={member.name}
                            initials={initials}
                            className={`w-20 h-20 rounded-2xl ring-4 ring-white overflow-hidden shadow-md ${member.avatar ? 'bg-white' : 'bg-avaa-dark'}`}
                            textClassName="text-white text-2xl font-bold flex items-center justify-center"
                        />
                        {/* Message CTA — opens in-app messaging */}
                        <button
                            onClick={() => router.post(route('messages.start'), { user_id: member.id })}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold transition-colors shadow-sm"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                            Message {member.name.split(' ')[0]}
                        </button>
                    </div>

                    {/* Name & company */}
                    <h2 className="text-xl font-bold text-avaa-dark leading-tight">{member.name}</h2>
                    {member.company && (
                        <p className="text-sm text-avaa-teal font-medium mt-0.5">
                            {member.company}
                            {member.industry ? ` · ${member.industry}` : ''}
                        </p>
                    )}

                    {/* Meta chips */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {member.location && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                                </svg>
                                {member.location}
                            </span>
                        )}
                        {member.company_size && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                </svg>
                                {member.company_size}
                            </span>
                        )}
                        {member.industry && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-avaa-teal bg-avaa-primary-light px-2.5 py-1 rounded-full font-semibold border border-avaa-primary/20">
                                {member.industry}
                            </span>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-4" />

                    {/* Contact details */}
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-sm">
                            <span className="w-7 h-7 rounded-lg bg-avaa-primary-light flex items-center justify-center text-avaa-teal flex-shrink-0">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,7 12,13 2,7" />
                                </svg>
                            </span>
                            <span className="text-gray-700 truncate">{member.email}</span>
                        </div>
                        {member.phone && (
                            <div className="flex items-center gap-3 text-sm">
                                <span className="w-7 h-7 rounded-lg bg-avaa-primary-light flex items-center justify-center text-avaa-teal flex-shrink-0">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.67 2.36a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.72-1.24a2 2 0 012.11-.45c.76.31 1.55.54 2.36.67A2 2 0 0122 16.92z" />
                                    </svg>
                                </span>
                                <span className="text-gray-700">{member.phone}</span>
                            </div>
                        )}
                        {member.company_website && (
                            <div className="flex items-center gap-3 text-sm">
                                <span className="w-7 h-7 rounded-lg bg-avaa-primary-light flex items-center justify-center text-avaa-teal flex-shrink-0">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                                    </svg>
                                </span>
                                <a href={member.company_website} target="_blank" rel="noreferrer" className="text-avaa-teal hover:underline truncate">{member.company_website}</a>
                            </div>
                        )}
                    </div>

                    {/* Social links */}
                    {(member.linkedin_url || member.facebook_url || member.twitter_url) && (
                        <div className="flex items-center gap-2 mt-4">
                            {member.linkedin_url && (
                                <a href={member.linkedin_url} target="_blank" rel="noreferrer"
                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-avaa-primary hover:text-avaa-teal transition-colors">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
                                        <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                                    </svg>
                                </a>
                            )}
                            {member.facebook_url && (
                                <a href={member.facebook_url} target="_blank" rel="noreferrer"
                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-avaa-primary hover:text-avaa-teal transition-colors">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                    </svg>
                                </a>
                            )}
                            {member.twitter_url && (
                                <a href={member.twitter_url} target="_blank" rel="noreferrer"
                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-avaa-primary hover:text-avaa-teal transition-colors">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
/* ══════════════════════════════════════════════
   REPORT JOB MODAL
══════════════════════════════════════════════ */
function ReportJobModal({
    job,
    onClose,
}: {
    job: JobListing;
    onClose: () => void;
}) {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setLoading(true);
        router.post(route('job-seeker.jobs.report', job.id), {
            reason,
            description,
        }, {
            onSuccess: () => {
                setSuccessMessage('Thank you! We have received your report.');
                setTimeout(() => {
                    setLoading(false);
                    onClose();
                }, 1500);
            },
            onError: (errors) => {
                console.error('Error reporting job:', errors);
                setLoading(false);
            },
        });
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !loading) onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose, loading]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-avaa-dark">Report This Job</h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors disabled:opacity-50"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="px-6 py-3 bg-green-50 border-b border-green-100 text-sm text-green-700 font-medium">
                        ✓ {successMessage}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Reason for Report
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={loading}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-avaa-primary/20 focus:border-avaa-primary disabled:opacity-50"
                        >
                            <option value="">Select a reason...</option>
                            <option value="spam">Spam or Scam</option>
                            <option value="inappropriate_behavior">Inappropriate Behavior</option>
                            <option value="suspicious_job">Suspicious Job</option>
                            <option value="identity_theft">Identity Theft</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Additional Details
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                            placeholder="Please provide any additional information..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-avaa-primary/20 focus:border-avaa-primary resize-none disabled:opacity-50"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!reason.trim() || loading}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors"
                        >
                            {loading ? 'Reporting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function JobDetail({
    job,
    hiringTeam = [],
    similarJobs = [],
    isSaved: initialSaved = false,
    hasApplied: initialApplied = false,
    source = 'browse',
}: Props) {
    const [saved, setSaved] = useState(initialSaved);
    const [applied, setApplied] = useState(initialApplied || job.has_applied || false);
    const [selectedRecruiter, setSelectedRecruiter] = useState<HiringTeamMember | null>(null);
    const [showReportModal, setShowReportModal] = useState(false);

    const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
    const responsibilities = toLines(job.responsibilities);
    const qualifications   = toLines(job.qualifications);
    const requirements     = toLines(job.requirements);
    const fromSavedJobs = source === 'saved';
    const backHref = fromSavedJobs
        ? route('job-seeker.jobs.saved')
        : route('job-seeker.jobs.browse');
    const backLabel = fromSavedJobs ? 'Saved Jobs' : 'Home';

    const handleApply = () => router.visit(route('job-seeker.jobs.apply.form', job.id));

    const handleShareJob = async () => {
        const jobUrl = window.location.href;
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(jobUrl);
            // Create a brief toast notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-green-500 shadow-lg z-[9999]';
            notification.textContent = '✓ Link copied to clipboard!';
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    };

    const toggleSave = () => {
        if (saved) {
            setSaved(false);
            router.delete(route('job-seeker.jobs.unsave', job.id), { preserveScroll: true });
        } else {
            setSaved(true);
            router.post(route('job-seeker.jobs.save', job.id), {}, { preserveScroll: true });
        }
    };

    return (
        <AppLayout activeNav={fromSavedJobs ? 'Saved Jobs' : 'Jobs'} pageTitle="Job Details">
            <Head title={job.title} />

            {/* Recruiter Profile Modal */}
            {selectedRecruiter && (
                <RecruiterProfileModal
                    member={selectedRecruiter}
                    onClose={() => setSelectedRecruiter(null)}
                />
            )}

            {/* Report Job Modal */}
            {showReportModal && (
                <ReportJobModal
                    job={job}
                    onClose={() => setShowReportModal(false)}
                />
            )}

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href={backHref} className="hover:text-avaa-teal transition-colors font-medium">
                    {backLabel}
                </Link>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
                <span className="text-avaa-teal font-semibold">Job Details</span>
            </nav>

            {/* Main layout: stack on mobile/tablet, side-by-side on large screens */}
            <div className="flex flex-col lg:flex-row gap-7 lg:items-start">

                {/* ══ Main content ══ */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                        {/* ── Header ── */}
                        <div className="p-5 sm:p-8 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
                                <ImageInitialsFallback
                                    src={job.logo_url}
                                    alt={`${job.company} logo`}
                                    initials={getInitials(job.company)}
                                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-gray-200 flex-shrink-0 overflow-hidden self-start ${job.logo_url ? 'bg-white' : avatarColor(job.id)}`}
                                    textClassName="text-white text-xl font-bold flex items-center justify-center"
                                />
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl sm:text-2xl font-extrabold text-avaa-dark leading-tight">{job.title}</h1>

                                    {/* Meta row */}
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-sm text-gray-500">
                                        <span className="font-semibold text-gray-700">{job.company}</span>
                                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="10" r="3" />
                                                <path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z" />
                                            </svg>
                                            {job.is_remote ? 'Remote' : job.location}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            {timeAgo(job.posted_date)}
                                        </span>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {job.employment_type && (
                                            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap">
                                                {job.employment_type}
                                            </span>
                                        )}
                                        {salary && (
                                            <span className="inline-flex items-center px-3 py-1 bg-avaa-primary-light text-avaa-teal text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap">
                                                {salary}
                                            </span>
                                        )}
                                        {job.experience_level && (
                                            <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 text-xs sm:text-sm font-semibold rounded-full border border-blue-100 whitespace-nowrap">
                                                {job.experience_level}
                                            </span>
                                        )}
                                        {job.work_arrangement && (
                                            <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-600 text-xs sm:text-sm font-semibold rounded-full border border-purple-100 whitespace-nowrap">
                                                {job.work_arrangement}
                                            </span>
                                        )}
                                        {job.industry && (
                                            <span className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-600 text-xs sm:text-sm font-semibold rounded-full border border-amber-100 whitespace-nowrap">
                                                {job.industry}
                                            </span>
                                        )}
                                        {job.deadline && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 text-xs sm:text-sm font-semibold rounded-full border border-red-100 whitespace-nowrap">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                Closes {job.deadline}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CTA buttons */}
                            <div className="flex flex-wrap items-center gap-3 mt-6">
                                <button
                                    onClick={handleApply}
                                    disabled={applied}
                                    className="flex-1 min-w-[140px] h-11 bg-avaa-primary hover:bg-avaa-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-[15px]"
                                >
                                    {applied ? 'Applied ✓' : 'Apply Now'}
                                </button>
                                <button
                                    onClick={toggleSave}
                                    className={`inline-flex items-center justify-center gap-2 px-5 h-11 rounded-xl border font-semibold text-sm transition-all whitespace-nowrap ${saved
                                            ? 'border-avaa-primary/30 bg-avaa-primary-light text-avaa-teal'
                                            : 'border-gray-200 text-gray-600 hover:border-avaa-primary/30 hover:text-avaa-teal hover:bg-avaa-primary-light'
                                        }`}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                    </svg>
                                    {saved ? 'Saved' : 'Save Job'}
                                </button>
                            </div>
                        </div>

                        {/* ── Body — ALL sections live here ── */}
                        <div className="p-8 space-y-8">

                            {/* Skills */}
                            {job.skills_required && job.skills_required.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {job.skills_required.map(s => (
                                        <span key={s} className="px-3 py-1.5 bg-avaa-primary-light text-avaa-teal text-sm font-semibold rounded-full border border-avaa-primary/20">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Job Description */}
                            {job.description && (
                                <div>
                                    <SectionTitle>Job Description</SectionTitle>
                                    <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line">
                                        {job.description}
                                    </p>
                                </div>
                            )}

                            {/* Responsibilities */}
                            {responsibilities.length > 0 && (
                                <div>
                                    <SectionTitle>Responsibilities</SectionTitle>
                                    <BulletList items={responsibilities} />
                                </div>
                            )}

                            {/* Qualifications */}
                            {qualifications.length > 0 && (
                                <div>
                                    <SectionTitle>Qualifications</SectionTitle>
                                    <BulletList items={qualifications} />
                                </div>
                            )}

                            {/* Requirements */}
                            {requirements.length > 0 && (
                                <div>
                                    <SectionTitle>Requirements</SectionTitle>
                                    <BulletList items={requirements} />
                                </div>
                            )}

                            {/* Project Timeline */}
                            {job.project_timeline && (
                                <div>
                                    <SectionTitle>Project Timeline</SectionTitle>
                                    <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        {job.project_timeline}
                                    </p>
                                </div>
                            )}

                            {/* Application Process */}
                            {job.application_process && (
                                <div>
                                    <SectionTitle>Application Process</SectionTitle>
                                    <div className="relative border-l-2 border-dashed border-avaa-teal/30 ml-2 pl-6 py-1">
                                        <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line">
                                            {job.application_process}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Onboarding Process */}
                            {job.onboarding_process && (
                                <div>
                                    <SectionTitle>Onboarding Process</SectionTitle>
                                    <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl">
                                        <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
                                            {job.onboarding_process}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Screener Questions — read-only preview for job seekers */}
                            {job.screener_questions && job.screener_questions.length > 0 && (
                                <div>
                                    <SectionTitle>Application Questions</SectionTitle>
                                    <p className="text-sm text-gray-400 mb-3">
                                        You'll be asked to answer these questions when you apply.
                                    </p>
                                    <ol className="space-y-3">
                                        {job.screener_questions.map((q, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[15px] text-gray-600">
                                                <span className="w-6 h-6 rounded-full bg-avaa-primary-light text-avaa-teal text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    {i + 1}
                                                </span>
                                                {q}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                        </div>{/* end body */}











                        {/* ── Footer ── */}
                        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="hover:text-red-500 cursor-pointer transition-colors text-left font-medium"
                            >
                                Report this job posting
                            </button>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleShareJob}
                                    className="hover:text-avaa-teal transition-colors"
                                    title="Copy job link to share"
                                >
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="hover:text-red-400 transition-colors"
                                    title="Flag this job"
                                >
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                        <line x1="4" y1="22" x2="4" y2="15" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══ Right sidebar: below content on small screens, right column on large ══ */}
                <div className="w-full lg:w-72 flex flex-col gap-5 flex-shrink-0 mt-6 lg:mt-0">

                    {/* Job Overview card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="text-base font-bold text-avaa-dark mb-4">Job Overview</h3>
                        <div className="space-y-3">
                            {[
                                {
                                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
                                    label: 'Posted',
                                    value: new Date(job.posted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                },
                                job.deadline && {
                                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
                                    label: 'Deadline',
                                    value: job.deadline,
                                },
                                job.employment_type && {
                                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>,
                                    label: 'Job Type',
                                    value: job.employment_type,
                                },
                                job.experience_level && {
                                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
                                    label: 'Experience',
                                    value: job.experience_level,
                                },
                                job.work_arrangement && {
                                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
                                    label: 'Arrangement',
                                    value: job.work_arrangement,
                                },
                                job.industry && {
                                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>,
                                    label: 'Industry',
                                    value: job.industry,
                                },
                                salary && {
                                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
                                    label: 'Salary',
                                    value: salary,
                                },
                            ].filter(Boolean).map((item: any) => (
                                <div key={item.label} className="flex items-center gap-3">
                                    <span className="text-avaa-teal flex-shrink-0">{item.icon}</span>
                                    <div className="flex items-center justify-between flex-1 min-w-0">
                                        <span className="text-sm text-gray-500 flex-shrink-0">{item.label}</span>
                                        <span className="text-sm font-semibold text-gray-800 text-right truncate ml-2">{item.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ══ Contact Us / Hiring Team card ══ */}
                    {hiringTeam.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-avaa-dark">Contact Us</h3>
                                <span className="text-[11px] font-semibold text-avaa-teal bg-avaa-primary-light px-2 py-0.5 rounded-full border border-avaa-primary/20">
                                    {hiringTeam.length} {hiringTeam.length === 1 ? 'recruiter' : 'recruiters'}
                                </span>
                            </div>

                            <div className="space-y-1">
                                {hiringTeam.map((member, idx) => (
                                    <button
                                        key={member.id}
                                        onClick={() => setSelectedRecruiter(member)}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-avaa-primary-light group transition-colors text-left"
                                    >
                                        <ImageInitialsFallback
                                            src={member.avatar}
                                            alt={member.name}
                                            initials={getInitials(member.name)}
                                            className={`w-10 h-10 rounded-full flex-shrink-0 overflow-hidden ${member.avatar ? 'bg-white border border-gray-200' : avatarColor(idx)}`}
                                            textClassName="text-white text-sm font-bold flex items-center justify-center"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-avaa-dark group-hover:text-avaa-teal transition-colors truncate">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {member.company ?? member.title}
                                            </p>
                                        </div>
                                        {/* Arrow indicator */}
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-300 group-hover:text-avaa-teal transition-colors flex-shrink-0">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </button>
                                ))}
                            </div>

                            {/* Hint footer */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-avaa-teal flex-shrink-0 mt-0.5">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <p className="text-[11px] text-gray-400 leading-relaxed">
                                    Click any recruiter to view their profile and send a message.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Similar Jobs */}
                    {similarJobs.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h3 className="text-base font-bold text-avaa-dark mb-5">Similar Jobs</h3>
                            <div className="space-y-5">
                                {similarJobs.slice(0, 3).map(sj => {
                                    const sjSalary = formatSalary(sj.salary_min, sj.salary_max, sj.salary_currency);
                                    return (
                                        <div key={sj.id} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                                            <div className="flex items-start gap-3">
                                                <ImageInitialsFallback
                                                    src={sj.logo_url}
                                                    alt={`${sj.company} logo`}
                                                    initials={getInitials(sj.company)}
                                                    className={`w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden ${sj.logo_url ? 'bg-white' : avatarColor(sj.id)}`}
                                                    textClassName="text-white text-xs font-bold flex items-center justify-center"
                                                />
                                                <div className="min-w-0">
                                                    <button
                                                        onClick={() =>
                                                            router.visit(route('job-seeker.jobs.show', {
                                                                job: sj.id,
                                                                ...(fromSavedJobs ? { from: 'saved' } : {}),
                                                            }))
                                                        }
                                                        className="text-[15px] font-semibold text-avaa-dark hover:text-avaa-teal transition-colors text-left block leading-snug"
                                                    >
                                                        {sj.title}
                                                    </button>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {sj.company} · {sj.is_remote ? 'Remote' : sj.location}
                                                    </p>
                                                    {sjSalary && (
                                                        <p className="text-sm font-semibold text-avaa-teal mt-1">{sjSalary}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => router.visit(backHref)}
                                className="w-full mt-5 h-10 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-avaa-primary-light hover:text-avaa-teal hover:border-avaa-primary/30 transition-all"
                            >
                                View All
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}