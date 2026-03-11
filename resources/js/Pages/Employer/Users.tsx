import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';

/* ── Types ── */
interface Employee {
    id: number;
    status: string;
    application_data?: Record<string, any> | null;
    cover_letter?: string | null;
    resume_path?: string | null;
    created_at: string;
    candidate: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        phone?: string | null;
        avatar?: string | null;
        title?: string;
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
    };
    job: {
        id: number;
        title: string;
    };
    hired_at: string;
}

interface Props {
    employees: Employee[];
    activeCount: number;
}

/* ── Helpers ── */
const AVATAR_COLORS = ['bg-avaa-dark', 'bg-teal-700', 'bg-emerald-700', 'bg-slate-600', 'bg-cyan-700', 'bg-stone-600'];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function getInitials(first: string, last: string) { return `${(first[0] ?? '')}${(last[0] ?? '')}`.toUpperCase(); }

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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const IcoUserMinus = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="23" y1="11" x2="17" y2="11" />
    </svg>
);

/* ══════════════════════════════════════════════
   APPLICANT DETAIL MODAL
══════════════════════════════════════════════ */
function ApplicantModal({ employee, onClose }: { employee: Employee; onClose: () => void; }) {
    import('react').then(({ useEffect }) => {
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', esc);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
    });

    const u = employee.candidate;
    const ad = employee.application_data;
    const fullName = (ad?.full_name) ?? `${u.first_name} ${u.last_name}`;
    const initials = getInitials(u.first_name, u.last_name);
    const resumePath = (employee.resume_path) ?? (u.profile?.resume_path) ?? (ad?.existing_resume);
    const resumeName = resumePath ? resumePath.split('/').pop() : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="h-24 bg-gradient-to-r from-avaa-primary/80 via-avaa-teal to-emerald-400 rounded-t-2xl flex-shrink-0 relative">
                    <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors z-10"><IcoX /></button>
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
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active Employee
                        </span>
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

                        {((ad?.cover_letter) ?? employee.cover_letter) && (
                            <div className="mt-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Why are you a good fit?</p>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{(ad?.cover_letter) ?? employee.cover_letter}</p>
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

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end flex-shrink-0 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   END CONTRACT MODAL
══════════════════════════════════════════════ */
function EndContractModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
    const [saving, setSaving] = useState(false);
    const fullName = `${employee.candidate.first_name} ${employee.candidate.last_name}`;

    const handleConfirm = () => {
        setSaving(true);
        router.post(route('employer.users.end-contract', { application: employee.id }), {}, {
            preserveScroll: true,
            onSuccess: () => { setSaving(false); onClose(); },
            onError: () => setSaving(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col p-6 text-center">
                <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IcoUserMinus />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">End Contract?</h3>
                <p className="text-sm text-gray-500 mb-6 font-medium">
                    Are you sure you want to end the contract for <strong className="text-gray-800">{fullName}</strong>? This will remove them from your active employees list and notify them by email.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={handleConfirm} disabled={saving} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {saving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                        End Contract
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function Users({ employees, activeCount }: Props) {
    const [search, setSearch] = useState('');
    const [employeeToEnd, setEmployeeToEnd] = useState<Employee | null>(null);
    const [viewProfile, setViewProfile] = useState<Employee | null>(null);

    const filtered = employees.filter(e => {
        const name = `${e.candidate.first_name} ${e.candidate.last_name}`.toLowerCase();
        return !search || name.includes(search.toLowerCase()) || e.job.title.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <AppLayout pageTitle="Users" pageSubtitle={`${activeCount} Active Employees`} activeNav="Users">
            <Head title="Users" />

            {viewProfile && <ApplicantModal employee={viewProfile} onClose={() => setViewProfile(null)} />}
            {employeeToEnd && <EndContractModal employee={employeeToEnd} onClose={() => setEmployeeToEnd(null)} />}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div></div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-10 w-64 shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-400 flex-shrink-0">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search employees or roles..."
                        className="text-sm bg-transparent text-gray-900 placeholder-gray-400 font-medium focus:outline-none focus:ring-0 border-0 w-full"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest min-w-[250px]">Employee</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest min-w-[200px]">Role / Position</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Hired Date</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest min-w-[100px]">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest text-right min-w-[120px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="inline-flex w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center text-gray-300 mb-4 shadow-inner">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                        </div>
                                        <p className="text-base text-gray-900 font-bold mb-1">No employees found</p>
                                        <p className="text-sm text-gray-500 font-medium">It looks like no one has been hired yet or matched your search.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(emp => {
                                    const fullName = `${emp.candidate.first_name} ${emp.candidate.last_name}`;
                                    const initials = getInitials(emp.candidate.first_name, emp.candidate.last_name);

                                    return (
                                        <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {emp.candidate.avatar ? (
                                                        <img src={emp.candidate.avatar} alt={fullName} className="w-10 h-10 rounded-full object-cover shadow-sm flex-shrink-0" />
                                                    ) : (
                                                        <div className={`w-10 h-10 rounded-full shadow-sm ${avatarColor(emp.candidate.id)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>{initials}</div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-base font-bold text-gray-900 truncate">{fullName}</p>
                                                        <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{emp.candidate.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-base font-bold text-gray-800 truncate">{emp.job.title}</p>
                                                        {emp.candidate.title && <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-0.5 truncate">{emp.candidate.title}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-base font-semibold text-gray-700">{new Date(emp.hired_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                                    <button onClick={() => setViewProfile(emp)}
                                                        className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm">
                                                        <IcoEye /> Profile
                                                    </button>
                                                    <button onClick={() => setEmployeeToEnd(emp)}
                                                        className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                                        <IcoUserMinus /> End Contract
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
