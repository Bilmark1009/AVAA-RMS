import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useEffect, useRef } from 'react';

/* ── Types ── */
interface JobInfo {
    id: number;
    title: string;
    company: string;
    location: string;
    employment_type?: string;
    posted_date: string;
}

interface ApplicationUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    profile?: {
        professional_title?: string;
        current_job_title?: string;
        current_company?: string;
        city?: string;
        state?: string;
        country?: string;
        skills?: string[];
        resume_path?: string;
    } | null;
}

interface Application {
    id: number;
    status: string;
    cover_letter?: string | null;
    resume_path?: string | null;
    application_data?: Record<string, any> | null;
    created_at: string;
    user: ApplicationUser;
}

interface Props {
    job: JobInfo;
    applications: Application[];
    employerAddress?: string | null;
}

/* ── Helpers ── */
const AVATAR_COLORS = ['bg-avaa-dark', 'bg-teal-700', 'bg-emerald-700', 'bg-slate-600', 'bg-cyan-700', 'bg-stone-600'];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function getInitials(first: string, last: string) { return `${(first[0] ?? '')}${(last[0] ?? '')}`.toUpperCase(); }
function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const STATUS_CFG: Record<string, { dot: string; text: string; bg: string; label: string }> = {
    pending: { dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', label: 'Pending' },
    approved: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Approved' },
    rejected: { dot: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50', label: 'Rejected' },
};

const INTERVIEW_TYPES = ['Online Interview', 'In-Person', 'Phone'];
const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:border-transparent transition-all placeholder-gray-400";
const labelClass = "block text-sm font-semibold text-gray-600 mb-1.5";

/* ── Icons ── */
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
const IcoDots = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
    </svg>
);

/* ══════════════════════════════════════════════
   REJECT MODAL
══════════════════════════════════════════════ */
function RejectModal({ app, jobId, onClose }: { app: Application; jobId: number; onClose: () => void }) {
    const [reason, setReason] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', esc);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
    }, []);

    const fullName = `${app.user.first_name} ${app.user.last_name}`;

    const handleSubmit = () => {
        if (!reason.trim()) return;
        setSending(true);
        router.post(route('employer.jobs.applications.reject', { job: jobId, application: app.id }), {
            rejection_reason: reason,
        }, {
            preserveScroll: true,
            onSuccess: () => { setSending(false); onClose(); },
            onError: () => setSending(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
                {/* Header */}
                <div className="h-20 bg-gradient-to-r from-avaa-primary/80 via-avaa-teal to-emerald-400 rounded-t-2xl relative flex-shrink-0">
                    <button onClick={onClose}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors z-10">
                        <IcoX />
                    </button>
                </div>

                {/* Avatar + Name */}
                <div className="px-6 -mt-8 flex items-end gap-3 flex-shrink-0 relative z-10 mb-3">
                    {app.user.avatar ? (
                        <img src={app.user.avatar} alt={fullName} className="w-16 h-16 rounded-2xl ring-4 ring-white object-cover shadow-md" />
                    ) : (
                        <div className={`w-16 h-16 rounded-2xl ring-4 ring-white ${avatarColor(app.user.id)} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                            {getInitials(app.user.first_name, app.user.last_name)}
                        </div>
                    )}
                    <div className="pb-1">
                        <h2 className="text-lg font-bold text-avaa-dark">{fullName}</h2>
                        <p className="text-sm text-gray-500">{app.user.email}</p>
                    </div>
                </div>

                <div className="px-6 pb-5 pt-2">
                    <label className={labelClass}>Reason for Rejection</label>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={4}
                        className={`${inputClass} resize-none`}
                        placeholder="Please provide a reason for rejecting this application..."
                    />
                    <p className="text-[10px] text-gray-400 mt-1">This will be emailed to the applicant.</p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-2xl">
                    <button onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        Close
                    </button>
                    <button onClick={handleSubmit} disabled={sending || !reason.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                        {sending && (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        Send Rejection
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   APPROVE / SCHEDULE INTERVIEW MODAL
══════════════════════════════════════════════ */
function ApproveModal({ app, jobId, employerAddress, onClose }: {
    app: Application; jobId: number; employerAddress?: string | null; onClose: () => void;
}) {
    const [form, setForm] = useState({
        interview_date: '',
        interview_time: '',
        interview_type: 'Online Interview',
        interviewer_name: '',
        location_or_link: '',
        notes: '',
    });
    const [sending, setSending] = useState(false);

    // Pre-fill location when switching to In-Person
    useEffect(() => {
        if (form.interview_type === 'In-Person' && employerAddress && !form.location_or_link) {
            setForm(f => ({ ...f, location_or_link: employerAddress }));
        } else if (form.interview_type !== 'In-Person' && form.location_or_link === employerAddress) {
            setForm(f => ({ ...f, location_or_link: '' }));
        }
    }, [form.interview_type]);

    useEffect(() => {
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', esc);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
    }, []);

    const fullName = `${app.user.first_name} ${app.user.last_name}`;
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = () => {
        if (!form.interview_date || !form.interview_time || !form.interviewer_name.trim()) return;
        setSending(true);
        router.post(route('employer.jobs.applications.approve', { job: jobId, application: app.id }), form, {
            preserveScroll: true,
            onSuccess: () => { setSending(false); onClose(); },
            onError: () => setSending(false),
        });
    };

    const showLink = form.interview_type === 'Online Interview';
    const showAddress = form.interview_type === 'In-Person';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="h-20 bg-gradient-to-r from-avaa-primary/80 via-avaa-teal to-emerald-400 rounded-t-2xl relative flex-shrink-0">
                    <button onClick={onClose}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors z-10">
                        <IcoX />
                    </button>
                </div>

                {/* Avatar + Name */}
                <div className="px-6 -mt-8 flex items-end gap-3 flex-shrink-0 relative z-10 mb-3">
                    {app.user.avatar ? (
                        <img src={app.user.avatar} alt={fullName} className="w-16 h-16 rounded-2xl ring-4 ring-white object-cover shadow-md" />
                    ) : (
                        <div className={`w-16 h-16 rounded-2xl ring-4 ring-white ${avatarColor(app.user.id)} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                            {getInitials(app.user.first_name, app.user.last_name)}
                        </div>
                    )}
                    <div className="pb-1">
                        <h2 className="text-lg font-bold text-avaa-dark">{fullName}</h2>
                        <p className="text-sm text-gray-500">{app.user.email}</p>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 px-6 pb-5 pt-2 space-y-4">
                    {/* Date + Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Interview Date</label>
                            <input type="date" value={form.interview_date} onChange={e => set('interview_date', e.target.value)}
                                min={new Date().toISOString().split('T')[0]} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Interview Time</label>
                            <input type="time" value={form.interview_time} onChange={e => set('interview_time', e.target.value)} className={inputClass} />
                        </div>
                    </div>

                    {/* Type + Interviewer */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Interview Type</label>
                            <select value={form.interview_type} onChange={e => set('interview_type', e.target.value)} className={inputClass}>
                                {INTERVIEW_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Interviewer</label>
                            <input value={form.interviewer_name} onChange={e => set('interviewer_name', e.target.value)}
                                className={inputClass} placeholder="e.g. John Smith" />
                        </div>
                    </div>

                    {/* Conditional: GMeet link or Address */}
                    {showLink && (
                        <div>
                            <label className={labelClass}>Google Meet / Zoom Link</label>
                            <input value={form.location_or_link} onChange={e => set('location_or_link', e.target.value)}
                                className={inputClass} placeholder="https://meet.google.com/..." />
                        </div>
                    )}
                    {showAddress && (
                        <div>
                            <label className={labelClass}>Interview Address</label>
                            <input value={form.location_or_link} onChange={e => set('location_or_link', e.target.value)}
                                className={inputClass} placeholder="Office address" />
                            {employerAddress && (
                                <p className="text-[10px] text-gray-400 mt-1">Pre-filled from your company address. You can edit it.</p>
                            )}
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className={labelClass}>Notes (optional)</label>
                        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                            rows={3} className={`${inputClass} resize-none`} placeholder="Any additional instructions..." />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-2xl">
                    <button onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        Close
                    </button>
                    <button onClick={handleSubmit}
                        disabled={sending || !form.interview_date || !form.interview_time || !form.interviewer_name.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                        {sending && (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        Approve & Schedule
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   STATUS BADGE (opens reject/approve modals)
══════════════════════════════════════════════ */
function AppStatusBadge({ status, jobId, appId, onReject, onApprove }: {
    status: string; jobId: number; appId: number;
    onReject: () => void; onApprove: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;

    return (
        <div ref={ref} className="relative inline-block">
            <button onClick={() => setOpen(o => !o)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} hover:shadow-sm transition-all`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-60">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {open && (
                <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[140px]">
                    {status !== 'approved' && (
                        <button onClick={() => { onApprove(); setOpen(false); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Approve
                        </button>
                    )}
                    {status !== 'rejected' && (
                        <button onClick={() => { onReject(); setOpen(false); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />Reject
                        </button>
                    )}
                    {status !== 'pending' && (
                        <button onClick={() => {
                            router.patch(route('employer.jobs.applications.status', { job: jobId, application: appId }), { status: 'pending' }, { preserveScroll: true });
                            setOpen(false);
                        }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Pending
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════
   APPLICANT DETAIL MODAL
══════════════════════════════════════════════ */
function ApplicantModal({ app, jobId, onClose, onReject, onApprove }: {
    app: Application; jobId: number; onClose: () => void;
    onReject: () => void; onApprove: () => void;
}) {
    useEffect(() => {
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', esc);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
    }, []);

    const u = app.user;
    const ad = app.application_data;
    const fullName = (ad?.full_name) ?? `${u.first_name} ${u.last_name}`;
    const initials = getInitials(u.first_name, u.last_name);
    const resumePath = (app.resume_path) ?? (u.profile?.resume_path) ?? (ad?.existing_resume);
    const resumeName = resumePath ? resumePath.split('/').pop() : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="h-24 bg-gradient-to-r from-avaa-primary/80 via-avaa-teal to-emerald-400 rounded-t-2xl flex-shrink-0 relative">
                    <button onClick={onClose}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors z-10">
                        <IcoX />
                    </button>
                </div>

                <div className="px-6 -mt-10 flex items-end gap-4 flex-shrink-0 relative z-10 mb-2">
                    {u.avatar ? (
                        <img src={u.avatar} alt={fullName} className="w-20 h-20 rounded-2xl ring-4 ring-white object-cover shadow-md" />
                    ) : (
                        <div className={`w-20 h-20 rounded-2xl ring-4 ring-white ${avatarColor(u.id)} flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
                            {initials}
                        </div>
                    )}
                    <div className="pb-1">
                        <h2 className="text-lg font-bold text-avaa-dark">{fullName}</h2>
                        <AppStatusBadge status={app.status} jobId={jobId} appId={app.id} onReject={onReject} onApprove={onApprove} />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 px-6 pb-6 pt-2 space-y-5">
                    {/* Section 1: Personal Info */}
                    <div className="border border-gray-100 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-6 h-6 rounded-lg bg-avaa-primary-light text-avaa-teal flex items-center justify-center text-xs font-bold">1</span>
                            <h4 className="text-sm font-bold text-avaa-dark">Personal Information</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Full Name</p><p className="text-sm font-semibold text-avaa-dark mt-0.5">{fullName}</p></div>
                            <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Email</p><p className="text-sm font-semibold text-avaa-dark mt-0.5">{(ad?.email) ?? u.email}</p></div>
                            <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Phone Number</p><p className="text-sm font-semibold text-avaa-dark mt-0.5">{(ad?.phone) ?? (u.phone) ?? '—'}</p></div>
                            <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Location</p><p className="text-sm font-semibold text-avaa-dark mt-0.5">{((ad?.location) ?? [u.profile?.city, u.profile?.state, u.profile?.country].filter(Boolean).join(', ')) || '—'}</p></div>
                        </div>
                    </div>

                    {/* Section 2: Professional Experience */}
                    <div className="border border-gray-100 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-6 h-6 rounded-lg bg-avaa-primary-light text-avaa-teal flex items-center justify-center text-xs font-bold">2</span>
                            <h4 className="text-sm font-bold text-avaa-dark">Professional Experience</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Current Job Title</p><p className="text-sm font-semibold text-avaa-dark mt-0.5">{(ad?.current_job_title) ?? (u.profile?.current_job_title) ?? '—'}</p></div>
                            <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Company</p><p className="text-sm font-semibold text-avaa-dark mt-0.5">{(ad?.current_company) ?? (u.profile?.current_company) ?? '—'}</p></div>
                        </div>

                        {((ad?.skills?.length) ?? (u.profile?.skills?.length) ?? 0) > 0 && (
                            <div className="mt-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Skills & Expertise</p>
                                <div className="flex flex-wrap gap-2">
                                    {((ad?.skills) ?? (u.profile?.skills) ?? []).map((s: string) => (
                                        <span key={s} className="px-3 py-1 bg-avaa-primary-light text-avaa-teal text-xs font-semibold rounded-full border border-avaa-primary/20">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {((ad?.cover_letter) ?? app.cover_letter) && (
                            <div className="mt-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Why are you a good fit?</p>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{(ad?.cover_letter) ?? app.cover_letter}</p>
                            </div>
                        )}
                    </div>

                    {/* Section 3: Resume */}
                    <div className="border border-gray-100 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-6 h-6 rounded-lg bg-avaa-primary-light text-avaa-teal flex items-center justify-center text-xs font-bold">3</span>
                            <h4 className="text-sm font-bold text-avaa-dark">Resume</h4>
                        </div>
                        {resumePath ? (
                            <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3">
                                <div className="w-9 h-9 rounded-xl bg-avaa-primary-light text-avaa-teal flex items-center justify-center flex-shrink-0"><IcoFile /></div>
                                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-avaa-dark truncate">{(resumeName) ?? 'Resume'}</p></div>
                                <a href={resumePath} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-avaa-teal transition-colors p-1"><IcoEye /></a>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No resume attached.</p>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Close</button>
                    {app.status === 'pending' && (
                        <>
                            <button onClick={onReject} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors">Reject</button>
                            <button onClick={onApprove} className="px-5 py-2 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors">Approve</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   OPTIONS MENU
══════════════════════════════════════════════ */
function OptionsMenu({ app, jobId, onView, onReject, onApprove }: {
    app: Application; jobId: number; onView: () => void;
    onReject: () => void; onApprove: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => {
            const target = e.target as Node;
            const menu = document.getElementById(`app-menu-${app.id}`);
            if (menu && !menu.contains(target) && btnRef.current && !btnRef.current.contains(target)) setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    const handleOpen = () => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setMenuPos({ top: rect.bottom + window.scrollY + 4, right: window.innerWidth - rect.right - window.scrollX });
        }
        setOpen(o => !o);
    };

    return (
        <>
            <button ref={btnRef} onClick={handleOpen} className="p-1.5 rounded-lg text-gray-400 hover:text-avaa-dark hover:bg-gray-100 transition-colors"><IcoDots /></button>
            {open && (
                <div id={`app-menu-${app.id}`} style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
                    className="z-[9999] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[150px]">
                    <button onClick={() => { onView(); setOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><IcoEye /> View</button>
                    <div className="border-t border-gray-100" />
                    {app.status !== 'approved' && (
                        <button onClick={() => { onApprove(); setOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Approve
                        </button>
                    )}
                    {app.status !== 'rejected' && (
                        <button onClick={() => { onReject(); setOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />Reject
                        </button>
                    )}
                </div>
            )}
        </>
    );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function JobApplications({ job, applications, employerAddress }: Props) {
    const [viewApp, setViewApp] = useState<Application | null>(null);
    const [rejectApp, setRejectApp] = useState<Application | null>(null);
    const [approveApp, setApproveApp] = useState<Application | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [search, setSearch] = useState('');

    const filtered = applications.filter(a => {
        const matchFilter = filter === 'all' || a.status === filter;
        const name = `${a.user.first_name} ${a.user.last_name}`.toLowerCase();
        const matchSearch = !search || name.includes(search.toLowerCase()) || a.user.email.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const counts = {
        all: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
    };

    return (
        <AppLayout pageTitle="Applicants"
            pageSubtitle={`${applications.length} Applicant${applications.length !== 1 ? 's' : ''}`}
            activeNav="Manage Jobs">
            <Head title={`Applicants - ${job.title}`} />

            {viewApp && (
                <ApplicantModal app={viewApp} jobId={job.id} onClose={() => setViewApp(null)}
                    onReject={() => { setRejectApp(viewApp); setViewApp(null); }}
                    onApprove={() => { setApproveApp(viewApp); setViewApp(null); }} />
            )}
            {rejectApp && <RejectModal app={rejectApp} jobId={job.id} onClose={() => setRejectApp(null)} />}
            {approveApp && <ApproveModal app={approveApp} jobId={job.id} employerAddress={employerAddress} onClose={() => setApproveApp(null)} />}

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
                <Link href={route('employer.dashboard')} className="hover:text-avaa-teal transition-colors font-medium">Dashboard</Link>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                <Link href={route('employer.jobs.index')} className="hover:text-avaa-teal transition-colors font-medium">Manage Jobs</Link>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                <span className="text-avaa-dark font-medium">Applicants</span>
            </nav>

            {/* Job Info Card */}
            <div className="bg-white border border-gray-200 rounded-2xl mb-5">
                <div className="h-20 bg-gradient-to-r from-avaa-primary/80 via-avaa-teal to-emerald-400 relative rounded-t-2xl">
                    <div className="absolute inset-0 opacity-20 rounded-t-2xl" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>
                <div className="px-6 pb-5 -mt-8 relative z-10">
                    <div className="flex items-end justify-between">
                        <div className="flex items-end gap-4">
                            <div className={`w-16 h-16 rounded-2xl ring-4 ring-white ${avatarColor(job.id)} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                                {job.company.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="pb-0.5">
                                <h2 className="text-xl font-bold text-avaa-dark">{job.title}</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z" /></svg>
                                        {job.location}
                                    </span>
                                    <span className="text-xs text-gray-400">{timeAgo(job.posted_date)}</span>
                                    {job.employment_type && <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{job.employment_type}</span>}
                                </div>
                            </div>
                        </div>
                        <Link href={route('employer.jobs.index')} className="flex items-center gap-1.5 text-xs font-semibold text-avaa-muted hover:text-avaa-teal transition-colors mb-1">
                            View all Jobs
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5 shadow-sm flex-wrap">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                        <button key={tab} onClick={() => setFilter(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === tab ? 'bg-avaa-dark text-white shadow-sm' : 'text-gray-500 hover:text-avaa-dark hover:bg-gray-50'}`}>
                            {tab}
                            <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{counts[tab]}</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-10 w-64 shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-400 flex-shrink-0"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicants..." className="text-sm bg-transparent text-gray-900 placeholder-gray-400 font-medium focus:outline-none focus:ring-0 border-0 w-full" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Name</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Curriculum Vitae</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Date Applied</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5}>
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-avaa-primary-light flex items-center justify-center text-avaa-teal mb-4">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                        </div>
                                        <p className="text-avaa-dark font-semibold mb-1">No applicants found</p>
                                        <p className="text-sm text-avaa-muted">{applications.length === 0 ? 'No one has applied to this job yet.' : 'No applicants match your filters.'}</p>
                                    </div>
                                </td></tr>
                            ) : filtered.map(app => {
                                const fullName = `${app.user.first_name} ${app.user.last_name}`;
                                const initials = getInitials(app.user.first_name, app.user.last_name);
                                const subTitle = (app.application_data?.current_job_title) ?? (app.user.profile?.professional_title) ?? (app.user.profile?.current_job_title) ?? '';
                                const resumePath = (app.resume_path) ?? (app.user.profile?.resume_path);
                                const resumeName = resumePath ? resumePath.split('/').pop() : null;

                                return (
                                    <tr key={app.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {app.user.avatar ? (
                                                    <img src={app.user.avatar} alt={fullName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className={`w-9 h-9 rounded-full ${avatarColor(app.user.id)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{initials}</div>
                                                )}
                                                <div className="min-w-0">
                                                    <button onClick={() => setViewApp(app)} className="text-base font-semibold text-avaa-dark hover:text-avaa-teal transition-colors truncate block text-left">{fullName}</button>
                                                    {subTitle && <p className="text-sm text-avaa-muted truncate">{subTitle}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {resumePath ? (
                                                <a href={resumePath} target="_blank" rel="noreferrer" className="text-sm text-avaa-teal hover:underline truncate block max-w-[180px]">{resumeName}</a>
                                            ) : <span className="text-sm text-gray-400 italic">—</span>}
                                        </td>
                                        <td className="px-4 py-4"><span className="text-base text-gray-600">{app.created_at}</span></td>
                                        <td className="px-4 py-4">
                                            <AppStatusBadge status={app.status} jobId={job.id} appId={app.id}
                                                onReject={() => setRejectApp(app)} onApprove={() => setApproveApp(app)} />
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <OptionsMenu app={app} jobId={job.id} onView={() => setViewApp(app)}
                                                onReject={() => setRejectApp(app)} onApprove={() => setApproveApp(app)} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100">
                        <p className="text-sm text-avaa-muted">Showing <span className="font-semibold text-avaa-dark">{filtered.length}</span> of <span className="font-semibold text-avaa-dark">{applications.length}</span> applicants</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
