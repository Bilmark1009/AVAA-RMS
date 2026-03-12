import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useEffect, useRef } from 'react';

/* ── Types ── */
interface Candidate {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string | null;
    title?: string;
}

interface InterviewData {
    id: number;
    interviewer_name: string;
    interview_date: string;
    interview_time: string;
    interview_type: string;
    location_or_link?: string | null;
    notes?: string | null;
    status: string;
    candidate: Candidate;
    job: { id: number; title: string };
}

interface Stats {
    todays_total: number;
    upcoming: number;
    total_change?: string; 
    upcoming_change?: string;
}
interface StatCardProps {
    label: string;
    value: number | string;
    color: string;     // Now expects Tailwind classes like "bg-emerald-50 text-emerald-600"
    sub?: string;      // Optional: "Users currently active"
    icon?: React.ReactNode; // Optional: <IcoActiveUsers />
    badge?: string;    // Optional: "+12%"
}

interface Props {
    interviews: InterviewData[];
    stats: Stats;
}

/* ── Helpers ── */
const AVATAR_COLORS = ['bg-avaa-dark', 'bg-teal-700', 'bg-emerald-700', 'bg-slate-600', 'bg-cyan-700', 'bg-stone-600'];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function getInitials(first: string, last: string) { return `${(first[0] ?? '')}${(last[0] ?? '')}`.toUpperCase(); }

const STATUS_CFG: Record<string, { dot: string; text: string; bg: string; label: string }> = {
    active: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Active' },
    completed: { dot: 'bg-blue-400', text: 'text-blue-700', bg: 'bg-blue-50', label: 'Completed' },
    cancelled: { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-100', label: 'Cancelled' },
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
const IcoDots = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
    </svg>
);
const IcoCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IcoChevronDown = ({ open }: { open: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className={`transition-transform duration-200 ${open ? '-rotate-180' : ''}`}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);
const IcoTotal = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const IcoUpcoming = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

/* ══════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════ */
function StatCard({ label, value, color, sub, icon, badge }: StatCardProps) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                {/* Icon Container - using the color prop for the bg and text */}
                <div className={`p-2.5 rounded-xl ${color}`}>
                    {icon}
                </div>
                
                {/* Optional Badge */}
                {badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                        {badge}
                    </span>
                )}
            </div>
            
            <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{value}</h3>
                
                {/* Optional Sub-text */}
                {sub && (
                    <p className="text-[11px] text-gray-400 mt-1.5 font-medium leading-tight">
                        {sub}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   STATUS BADGE (display only)
══════════════════════════════════════════════ */
function InterviewStatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CFG[status] ?? STATUS_CFG.active;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

/* ══════════════════════════════════════════════
   EDIT INTERVIEW MODAL
══════════════════════════════════════════════ */
function EditModal({ interview, onClose }: { interview: InterviewData; onClose: () => void }) {
    const [form, setForm] = useState({
        interview_date: interview.interview_date,
        interview_time: interview.interview_time,
        interview_type: interview.interview_type,
        interviewer_name: interview.interviewer_name,
        location_or_link: interview.location_or_link ?? '',
        notes: interview.notes ?? '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', esc);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
    }, []);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
    const fullName = `${interview.candidate.first_name} ${interview.candidate.last_name}`;

    const handleSubmit = () => {
        setSaving(true);
        router.put(route('employer.interviews.update', { interview: interview.id }), form, {
            preserveScroll: true,
            onSuccess: () => { setSaving(false); onClose(); },
            onError: () => setSaving(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col">
                <div className="h-20 bg-gradient-to-r from-avaa-primary/80 via-avaa-teal to-emerald-400 rounded-t-2xl relative flex-shrink-0">
                    <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors z-10"><IcoX /></button>
                </div>

                <div className="px-6 -mt-8 flex items-end gap-3 flex-shrink-0 relative z-10 mb-3">
                    {interview.candidate.avatar ? (
                        <img src={interview.candidate.avatar} alt={fullName} className="w-16 h-16 rounded-2xl ring-4 ring-white object-cover shadow-md" />
                    ) : (
                        <div className={`w-16 h-16 rounded-2xl ring-4 ring-white ${avatarColor(interview.candidate.id)} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                            {getInitials(interview.candidate.first_name, interview.candidate.last_name)}
                        </div>
                    )}
                    <div className="pb-1">
                        <h2 className="text-base font-bold text-avaa-dark">{fullName}</h2>
                        <p className="text-sm text-gray-500">{interview.job.title}</p>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 px-6 pb-5 pt-2 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelClass}>Interview Date</label><input type="date" value={form.interview_date} onChange={e => set('interview_date', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Interview Time</label><input type="time" value={form.interview_time} onChange={e => set('interview_time', e.target.value)} className={inputClass} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelClass}>Interview Type</label>
                            <select value={form.interview_type} onChange={e => set('interview_type', e.target.value)} className={inputClass}>
                                {INTERVIEW_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div><label className={labelClass}>Interviewer</label><input value={form.interviewer_name} onChange={e => set('interviewer_name', e.target.value)} className={inputClass} /></div>
                    </div>
                    {(form.interview_type === 'Online Interview' || form.interview_type === 'In-Person') && (
                        <div>
                            <label className={labelClass}>{form.interview_type === 'Online Interview' ? 'Meeting Link' : 'Address'}</label>
                            <input value={form.location_or_link} onChange={e => set('location_or_link', e.target.value)} className={inputClass} />
                        </div>
                    )}
                    <div><label className={labelClass}>Notes</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className={`${inputClass} resize-none`} /></div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                        {saving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   OPTIONS MENU
══════════════════════════════════════════════ */
function InterviewOptions({ interview, onEdit }: { interview: InterviewData; onEdit: () => void }) {
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => {
            const target = e.target as Node;
            const menu = document.getElementById(`int-menu-${interview.id}`);
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
        <div className="relative inline-block">
            <button ref={btnRef} onClick={handleOpen} className="p-1.5 rounded-lg text-gray-400 hover:text-avaa-dark hover:bg-gray-100 transition-colors">
                <IcoDots />
            </button>
            {open && (
                <div id={`int-menu-${interview.id}`} style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
                    className="z-[9999] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[150px]">
                    <button onClick={() => { onEdit(); setOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Edit Interview
                    </button>
                    <div className="border-t border-gray-100" />
                    {Object.entries(STATUS_CFG).filter(([k]) => k !== interview.status).map(([k, c]) => (
                        <button key={k} onClick={() => {
                            router.patch(route('employer.interviews.status', { interview: interview.id }), { status: k }, { preserveScroll: true });
                            setOpen(false);
                        }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />Mark {c.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════
   JOB GROUP COMPONENT
══════════════════════════════════════════════ */
function JobGroup({
    jobTitle,
    interviews,
    onEdit
}: {
    jobTitle: string;
    interviews: InterviewData[];
    onEdit: (i: InterviewData) => void;
}) {
    const [open, setOpen] = useState(true);

    function formatTime(t: string) {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
    }

    const handlePass = (id: number) => {
        if (confirm("Are you sure you want to pass this applicant? They will be marked as hired and notified.")) {
            router.post(route('employer.interviews.pass', { interview: id }), {}, { preserveScroll: true });
        }
    };

    const handleFail = (id: number) => {
        if (confirm("Are you sure you want to fail this applicant? They will be notified via email.")) {
            router.post(route('employer.interviews.fail', { interview: id }), {}, { preserveScroll: true });
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4 shadow-sm">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-4 bg-gray-50/50 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-avaa-primary/10 text-avaa-primary flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>
                    </div>
                    <div className="text-left">
                        <h2 className="text-lg font-bold text-gray-900">{jobTitle}</h2>
                        <p className="text-sm text-gray-500 font-medium">{interviews.length} Scheduled Interviews</p>
                    </div>
                </div>
                <div className="text-gray-400">
                    <IcoChevronDown open={open} />
                </div>
            </button>

            {open && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest bg-white">Candidate</th>
                                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest bg-white">Date & Time</th>
                                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest bg-white">Interviewer</th>
                                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest bg-white">Status</th>
                                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest bg-white text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {interviews.map(i => {
                                const fullName = `${i.candidate.first_name} ${i.candidate.last_name}`;
                                const initials = getInitials(i.candidate.first_name, i.candidate.last_name);

                                return (
                                    <tr key={i.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {i.candidate.avatar ? (
                                                    <img src={i.candidate.avatar} alt={fullName} className="w-10 h-10 rounded-full object-cover shadow-sm flex-shrink-0" />
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-full shadow-sm ${avatarColor(i.candidate.id)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>{initials}</div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-base font-bold text-gray-900 truncate">{fullName}</p>
                                                    {i.candidate.title && <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider truncate mt-0.5">{i.candidate.title}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-base text-gray-700 font-semibold">{i.interview_date}</p>
                                            <p className="text-sm text-gray-500 font-medium mt-0.5">{formatTime(i.interview_time)}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100">
                                                <div className="w-5 h-5 rounded-full bg-avaa-dark flex flex-shrink-0 items-center justify-center text-[9px] font-bold text-white">
                                                    {i.interviewer_name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">{i.interviewer_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <InterviewStatusBadge status={i.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {i.status === 'active' && (
                                                    <>
                                                        <button
                                                            onClick={() => handlePass(i.id)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                            title="Pass Interview (Hire)"
                                                        >
                                                            <IcoCheck />
                                                        </button>
                                                        <button
                                                            onClick={() => handleFail(i.id)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                            title="Fail Interview"
                                                        >
                                                            <IcoX />
                                                        </button>
                                                    </>
                                                )}
                                                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                                <InterviewOptions interview={i} onEdit={() => onEdit(i)} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}


/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function Interviews({ interviews, stats }: Props) {
    const [editInterview, setEditInterview] = useState<InterviewData | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

    const filtered = interviews.filter(i => {
        const matchStatus = statusFilter === 'all' || i.status === statusFilter;
        const name = `${i.candidate.first_name} ${i.candidate.last_name}`.toLowerCase();
        const matchSearch = !search || name.includes(search.toLowerCase()) || i.job.title.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    // Group filtered interviews by Job Title
    const grouped = filtered.reduce((acc, curr) => {
        const key = curr.job.title;
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {} as Record<string, InterviewData[]>);

    return (
        <AppLayout pageTitle="Interview" pageSubtitle="Scheduled Interviews" activeNav="Interview">
            <Head title="Interviews" />

            {editInterview && <EditModal interview={editInterview} onClose={() => setEditInterview(null)} />}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Total Interviews"
                    value={stats.todays_total}
                    sub="Scheduled for today"
                    icon={<IcoTotal />} 
                    color="bg-blue-50 text-blue-600"
                    badge="Today"
                />
                <StatCard
                    label="Upcoming"
                    value={stats.upcoming}
                    sub="Pending sessions"
                    icon={<IcoUpcoming />}
                    color="bg-teal-50 text-teal-600"
                    badge="Next"
                />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5 shadow-sm flex-wrap">
                    {(['all', 'active', 'completed', 'cancelled'] as const).map(tab => (
                        <button key={tab} onClick={() => setStatusFilter(tab)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === tab
                                ? 'bg-avaa-dark text-white shadow-sm'
                                : 'text-gray-500 hover:text-avaa-dark hover:bg-gray-50'
                                }`}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-10 w-64 shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-400 flex-shrink-0">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search candidates or jobs..."
                        className="text-sm bg-transparent text-gray-900 placeholder-gray-400 font-medium focus:outline-none focus:ring-0 border-0 w-full"
                    />
                </div>
            </div>

            {/* Render Job Groups */}
            {Object.keys(grouped).length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200">
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <p className="text-gray-900 font-bold mb-1">No interviews found</p>
                        <p className="text-base text-gray-500 font-medium">Try adjusting your search or filters.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(grouped).map(([jobTitle, groupInterviews]) => (
                        <JobGroup
                            key={jobTitle}
                            jobTitle={jobTitle}
                            interviews={groupInterviews}
                            onEdit={(i) => setEditInterview(i)}
                        />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
