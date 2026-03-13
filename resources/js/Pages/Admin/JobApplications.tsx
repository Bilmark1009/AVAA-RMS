import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import ImageInitialsFallback from '@/Components/ImageInitialsFallback';

/* ── Types ── */
interface WorkExp {
    id: number;
    job_title: string;
    company: string;
    employment_type?: string;
    location?: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    description?: string;
}

interface Profile {
    professional_title?: string;
    current_job_title?: string;
    current_company?: string;
    city?: string;
    state?: string;
    country?: string;
    skills?: string[];
    certifications?: string[];
    about?: string;
    resume_path?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    highest_education?: string;
}

interface AppUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    profile?: Profile | null;
    work_experiences?: WorkExp[];
}

interface Application {
    id: number;
    status: string;
    cover_letter?: string | null;
    resume_path?: string | null;
    application_data?: Record<string, any> | null;
    created_at: string;
    user: AppUser;
}

interface JobInfo {
    id: number;
    title: string;
    company: string;
    location: string;
    employment_type?: string;
    posted_date: string;
}

interface Props { job: JobInfo; applications: Application[] }

/* ── Helpers ── */
const AVATAR_COLORS = ['bg-[#3d9e9e]', 'bg-slate-700', 'bg-emerald-700', 'bg-slate-600', 'bg-cyan-700', 'bg-stone-600'];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function getInitials(first: string, last: string) { return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase(); }

const STATUS_CFG: Record<string, { dot: string; text: string; bg: string; label: string }> = {
    pending: { dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', label: 'Pending' },
    approved: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Approved' },
    rejected: { dot: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50', label: 'Rejected' },
};

/* ── Icons ── */
const IcoChevLeft = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const IcoX = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const IcoFile = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
);
const IcoEye = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const IcoLinkedin = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);
const IcoGlobe = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
);
const IcoBriefcase2 = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IcoMapPin2 = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z" />
    </svg>
);
const IcoMail = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22 6 12 13 2 6" />
    </svg>
);
const IcoPhone = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.18 19.79 19.79 0 01.0 .54 2 2 0 012 .0 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9a16 16 0 006.29 6.29l1.36-1.36a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
);

/* ══════════════════════════════
   APPLICANT PROFILE SLIDE-OVER
══════════════════════════════ */
function ApplicantProfile({ app, onClose }: { app: Application; onClose: () => void }) {
    const u = app.user;
    const p = u.profile;
    const ad = app.application_data;
    const fullName = `${u.first_name} ${u.last_name}`;
    const title = p?.professional_title ?? p?.current_job_title ?? ad?.current_job_title ?? 'Job Seeker';
    const location = [p?.city, p?.state, p?.country].filter(Boolean).join(', ');
    const skills = p?.skills ?? ad?.skills ?? [];
    const certs = p?.certifications ?? [];
    const resumePath = app.resume_path ?? p?.resume_path ?? ad?.existing_resume;
    const about = p?.about ?? ad?.cover_letter;
    const coverLetter = app.cover_letter;
    const cfg = STATUS_CFG[app.status] ?? STATUS_CFG.pending;

    // ESC to close
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', h);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="flex-1 bg-black/40" onClick={onClose} />

            {/* Slide-over panel */}
            <div className="w-full max-w-2xl bg-white shadow-2xl overflow-y-auto flex flex-col">
                {/* Header banner */}
                <div className="h-28 bg-gradient-to-r from-[#3d9e9e]/80 via-[#3d9e9e] to-emerald-400 flex-shrink-0 relative">
                    <button onClick={onClose}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
                        <IcoX />
                    </button>
                </div>

                {/* Avatar + name */}
                <div className="px-6 -mt-12 flex items-end gap-4 mb-4 flex-shrink-0 relative z-10">
                    <ImageInitialsFallback
                        src={u.avatar}
                        alt={fullName}
                        initials={getInitials(u.first_name, u.last_name)}
                        className={`w-24 h-24 rounded-2xl ring-4 ring-white shadow-lg overflow-hidden ${u.avatar ? 'bg-white' : avatarColor(u.id)}`}
                        textClassName="text-white text-3xl font-bold flex items-center justify-center"
                    />
                    <div className="pb-1 flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">{fullName}</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{title}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} flex-shrink-0 mt-1`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contact info */}
                <div className="px-6 mb-4 flex flex-wrap gap-3">
                    {location && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <IcoMapPin2 />{location}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <IcoMail /><a href={`mailto:${u.email}`} className="hover:text-[#3d9e9e] transition-colors">{u.email}</a>
                    </span>
                    {u.phone && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-500"><IcoPhone />{u.phone}</span>
                    )}
                    {p?.linkedin_url && (
                        <a href={p.linkedin_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                            <IcoLinkedin />LinkedIn
                        </a>
                    )}
                    {p?.portfolio_url && (
                        <a href={p.portfolio_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs text-[#3d9e9e] hover:underline">
                            <IcoGlobe />Portfolio
                        </a>
                    )}
                </div>

                <div className="px-6 pb-8 space-y-5 flex-1">
                    {/* About */}
                    {about && (
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">About</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{about}</p>
                        </section>
                    )}

                    {/* Cover Letter */}
                    {coverLetter && (
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Cover Letter / Why a Good Fit</h3>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{coverLetter}</p>
                        </section>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Top Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((s: string) => (
                                    <span key={s} className="px-3 py-1 rounded-xl bg-[#e8f4f4] text-[#3d9e9e] text-xs font-semibold border border-[#3d9e9e]/15">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Work Experience */}
                    {(u.work_experiences ?? []).length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Experience</h3>
                            <ol className="relative border-l-2 border-gray-100 space-y-5 ml-2">
                                {(u.work_experiences ?? []).map(exp => (
                                    <li key={exp.id} className="pl-5 relative">
                                        <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#3d9e9e]/20 border-2 border-[#3d9e9e] flex items-center justify-center">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#3d9e9e]" />
                                        </span>
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{exp.job_title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                                                    <IcoBriefcase2 /> {exp.company}
                                                    {exp.employment_type && <span className="text-gray-300">·</span>}
                                                    {exp.employment_type}
                                                </p>
                                            </div>
                                            <span className="text-xs text-[#3d9e9e] font-semibold whitespace-nowrap">
                                                {exp.start_date} – {exp.end_date}
                                            </span>
                                        </div>
                                        {exp.description && (
                                            <p className="text-xs text-gray-500 mt-2 leading-relaxed whitespace-pre-line">{exp.description}</p>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </section>
                    )}

                    {/* Education */}
                    {(p?.highest_education) && (
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Education</h3>
                            <p className="text-sm font-semibold text-gray-700">{p.highest_education}</p>
                        </section>
                    )}

                    {/* Certifications */}
                    {certs.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Certifications</h3>
                            <div className="flex flex-wrap gap-2">
                                {certs.map(c => (
                                    <span key={c} className="px-3 py-1 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium">{c}</span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Resume */}
                    {resumePath && (
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Resume / CV</h3>
                            <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3">
                                <div className="w-9 h-9 rounded-xl bg-[#e8f4f4] text-[#3d9e9e] flex items-center justify-center flex-shrink-0">
                                    <IcoFile />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{resumePath.split('/').pop()}</p>
                                </div>
                                <a href={resumePath} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-[#3d9e9e] hover:text-[#347f7f] font-semibold transition-colors">
                                    <IcoEye /> View
                                </a>
                            </div>
                        </section>
                    )}

                    {/* Applied Date */}
                    <p className="text-xs text-gray-400 text-center pt-2">
                        Applied on {new Date(app.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════
   MAIN PAGE
══════════════════════════════ */
export default function AdminJobApplications({ job, applications }: Props) {
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [search, setSearch] = useState('');
    const [viewApp, setViewApp] = useState<Application | null>(null);

    const filtered = applications.filter(a => {
        const matchF = filter === 'all' || a.status === filter;
        const name = `${a.user.first_name} ${a.user.last_name}`.toLowerCase();
        const matchS = !search || name.includes(search.toLowerCase()) || a.user.email.toLowerCase().includes(search.toLowerCase());
        return matchF && matchS;
    });

    const counts = {
        all: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
    };

    return (
        <>
            <Head title={`Applicants – ${job.title}`} />
            <AppLayout pageTitle="Job Details" pageSubtitle="Monitor and manage job details." activeNav="Jobs">

                {/* Profile slide-over */}
                {viewApp && <ApplicantProfile app={viewApp} onClose={() => setViewApp(null)} />}

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
                    <Link href={route('admin.jobs.index')} className="hover:text-[#3d9e9e] transition-colors font-medium flex items-center gap-1">
                        <IcoChevLeft />Jobs
                    </Link>
                    <span>/</span>
                    <Link href={route('admin.jobs.show', job.id)} className="hover:text-[#3d9e9e] transition-colors font-medium">{job.title}</Link>
                    <span>/</span>
                    <span className="text-[#3d9e9e] font-semibold">Applicants</span>
                </nav>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                    {[
                        { label: 'Total', val: counts.all, color: 'text-[#3d9e9e]', bg: 'bg-[#e8f4f4]' },
                        { label: 'Approved', val: counts.approved, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                        { label: 'Pending', val: counts.pending, color: 'text-amber-700', bg: 'bg-amber-50' },
                    ].map(item => (
                        <div key={item.label} className={`${item.bg} rounded-2xl p-5`}>
                            <p className={`text-3xl font-bold ${item.color}`}>{item.val}</p>
                            <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                            <button key={tab} onClick={() => setFilter(tab)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all
                                    ${filter === tab ? 'bg-avaa-dark text-white shadow-sm' : 'text-gray-500 hover:text-avaa-dark hover:bg-gray-50'}`}>
                                {tab}
                                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold
                                    ${filter === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {counts[tab]}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-10 w-64 shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-400 flex-shrink-0">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search applicants..."
                            className="text-sm bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none w-full" />
                    </div>
                </div>

                {/* Title */}
                <div className="mb-3">
                    <h2 className="text-sm font-bold text-gray-800">Applicants for {job.title}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Review candidates who applied for this position.</p>
                </div>

                {/* List */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[#e8f4f4] flex items-center justify-center text-[#3d9e9e] mb-4">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                                </svg>
                            </div>
                            <p className="font-bold text-gray-800 mb-1">No applicants found</p>
                            <p className="text-sm text-gray-400">{applications.length === 0 ? 'No one has applied yet.' : 'No applicants match your filters.'}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filtered.map(app => {
                                const fullName = `${app.user.first_name} ${app.user.last_name}`;
                                const initials = getInitials(app.user.first_name, app.user.last_name);
                                const subTitle = app.user.profile?.professional_title
                                    ?? app.user.profile?.current_job_title
                                    ?? app.application_data?.current_job_title
                                    ?? '';
                                const cfg = STATUS_CFG[app.status] ?? STATUS_CFG.pending;

                                return (
                                    <button key={app.id} onClick={() => setViewApp(app)}
                                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors text-left">
                                        {/* Avatar */}
                                        <ImageInitialsFallback
                                            src={app.user.avatar}
                                            alt={fullName}
                                            initials={initials}
                                            className={`w-11 h-11 rounded-full flex-shrink-0 overflow-hidden ${app.user.avatar ? 'bg-white' : avatarColor(app.user.id)}`}
                                            textClassName="text-white text-sm font-bold flex items-center justify-center"
                                        />
                                        {/* Name + sub */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 leading-tight">{fullName}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                                                {subTitle ? `${subTitle} ` : ''}{app.user.email}
                                                {' · '}Applied {app.created_at}
                                            </p>
                                        </div>
                                        {/* Status */}
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                            {cfg.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {filtered.length > 0 && (
                        <div className="px-5 py-3 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of <span className="font-semibold text-gray-700">{applications.length}</span> applicants
                            </p>
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
