import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ImageInitialsFallback from '@/Components/ImageInitialsFallback';
import { useState, useRef, useEffect } from 'react';

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
    skills_required?: string[];
    experience_level?: string;
    is_remote?: boolean;
    deadline?: string | null;
    industry?: string;
}
interface Props {
    user: { first_name: string; last_name: string; email: string; role: string };
    profile: any; jobs: JobListing[]; isVerified: boolean;
}
interface JobFormData {
    title: string; company: string; location: string;
    salary_min: string; salary_max: string; salary_currency: string;
    skills_required: string[]; description: string; application_limit: string;
    status: 'active' | 'inactive' | 'draft';
    employment_type: string; experience_level: string;
    industry: string; is_remote: boolean; deadline: string;
    responsibilities: string; qualifications: string[];
    requirements: string[]; screener_questions: string[];
    work_arrangement: string;
}

/* ── Helpers ── */
function getInitials(title: string) {
    return title.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
const AVATAR_COLORS = [
    'bg-avaa-dark', 'bg-teal-700', 'bg-emerald-700',
    'bg-slate-600', 'bg-cyan-700', 'bg-stone-600',
];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function formatDate(dateStr: string) { return new Date(dateStr).toISOString().slice(0, 10); }
function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const SKILL_OPTIONS = ['JavaScript','TypeScript','Python','React','Vue','Angular','Node.js','Laravel','PHP','SQL','PostgreSQL','MySQL','Tailwind CSS','DevOps','Docker','AWS','UI/UX','Figma','Project Management','Data Analysis','Excel','GraphQL','REST API'];
const EMPLOYMENT_TYPES = ['Full-time','Part-time','Contract','Freelance','Internship'];
const WORK_ARRANGEMENTS = ['On-site','Remote','Hybrid'];
const EXPERIENCE_LEVELS = ['Entry Level','Mid Level','Senior Level','Lead','Manager','Executive'];
const CURRENCIES = ['USD','PHP','EUR','GBP','SGD','AUD'];
const STATUS_OPTIONS = ['active','inactive','draft'] as const;

const inp = "w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6D9886] focus:border-transparent transition-all placeholder-gray-400";
const lbl = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

/* ── Close Icon ── */
const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

/* ══════════════════════════════════════════════
   VIEW JOB MODAL
══════════════════════════════════════════════ */
function ViewJobModal({ job, onClose, onEdit }: { job: JobListing; onClose: () => void; onEdit: () => void }) {
    useEffect(() => {
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', esc);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
    }, []);

    const statusCfg = {
        active: { bg: 'bg-emerald-100 text-emerald-700', label: 'Active' },
        inactive: { bg: 'bg-gray-100 text-gray-600', label: 'Inactive' },
        draft: { bg: 'bg-amber-100 text-amber-700', label: 'Draft' },
    }[job.status];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="h-24 bg-gradient-to-r from-[#6D9886] via-[#5a8371] to-[#4a7360] flex-shrink-0 relative">
                    <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors z-10">
                        <XIcon/>
                    </button>
                </div>

                {/*
                    FIX: avatar row sits OUTSIDE the scrollable area so it's never
                    cut off. The -mt-14 pulls it up over the gradient header.
                */}
                <div className="px-6 -mt-14 flex items-end justify-between flex-shrink-0 relative z-10">
                    <div className={`w-20 h-20 rounded-2xl ${avatarColor(job.id)} flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white shadow-md`}>
                        {getInitials(job.company || job.title)}
                    </div>
                    <button onClick={onEdit}
                        className="mb-1 px-4 py-1.5 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                        Edit
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Main content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z"/></svg>
                                {job.location}
                            </span>
                            {job.employment_type && <span className="text-xs bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full text-gray-600">{job.employment_type}</span>}
                            {job.is_remote && <span className="text-xs bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full text-blue-600">Remote</span>}
                            {job.experience_level && <span className="text-xs bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full text-purple-600">{job.experience_level}</span>}
                            {(job.salary_min || job.salary_max) && (
                                <span className="text-xs bg-[#6D9886]/10 border border-[#6D9886]/20 px-2.5 py-1 rounded-full text-[#4a7360] font-medium">
                                    {job.salary_currency ?? 'USD'} {job.salary_min ? Number(job.salary_min).toLocaleString() : '—'}
                                    {job.salary_max ? ` – ${Number(job.salary_max).toLocaleString()}` : '+'}
                                </span>
                            )}
                        </div>

                        <button onClick={() => router.visit(route('employer.jobs.applications', job.id))}
                            className="mt-4 w-full py-2.5 bg-[#6D9886] hover:bg-[#5a8371] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                            View Applicants ({job.applications_count})
                        </button>

                        {job.description && (
                            <div className="mt-5">
                                <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#6D9886]"/>About the Job
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                            </div>
                        )}

                        {job.skills_required && job.skills_required.length > 0 && (
                            <div className="mt-5">
                                <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#6D9886]"/>Skills Required
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {job.skills_required.map(s => (
                                        <span key={s} className="px-2.5 py-1 bg-[#6D9886]/10 text-[#4a7360] text-xs font-semibold rounded-full border border-[#6D9886]/20">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right panel - Job Insights */}
                    <div className="w-48 flex-shrink-0 border-l border-gray-100 bg-gray-50/60 p-4 overflow-y-auto">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Job Insights</h4>
                        <div className="space-y-3">
                            {[
                                { label: 'Applicants', value: job.applications_count },
                                { label: 'Status', value: statusCfg.label },
                                { label: 'Posted', value: timeAgo(job.posted_date) },
                                ...(job.deadline ? [{ label: 'Expires', value: job.deadline }] : []),
                                ...(job.industry ? [{ label: 'Industry', value: job.industry }] : []),
                            ].map(item => (
                                <div key={item.label} className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-gray-400 font-semibold uppercase">{item.label}</span>
                                    <span className="text-sm font-semibold text-gray-700">{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                            <button onClick={onClose} className="w-full text-xs py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors font-medium">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   CREATE / EDIT JOB MODAL — 5-tab vertical nav
══════════════════════════════════════════════ */
function JobFormModal({ mode, job, companyName, onClose }: {
    mode: 'create' | 'edit'; job?: JobListing; companyName?: string; onClose: () => void;
}) {
    const emptyForm: JobFormData = {
        title: '', company: companyName ?? '', location: '', salary_min: '', salary_max: '',
        salary_currency: 'USD', skills_required: [], description: '', responsibilities: '',
        qualifications: [], requirements: [], screener_questions: [],
        application_limit: '', status: 'active', employment_type: '',
        experience_level: '', industry: '', is_remote: false, deadline: '', work_arrangement: '',
    };
    const [form, setForm] = useState<JobFormData>(() => job ? {
        ...emptyForm,
        title: job.title ?? '', company: job.company ?? companyName ?? '',
        location: job.location ?? '', salary_min: job.salary_min ? String(job.salary_min) : '',
        salary_max: job.salary_max ? String(job.salary_max) : '',
        salary_currency: job.salary_currency ?? 'USD', skills_required: job.skills_required ?? [],
        description: job.description ?? '', status: job.status ?? 'active',
        employment_type: job.employment_type ?? '', experience_level: job.experience_level ?? '',
        industry: job.industry ?? '', is_remote: job.is_remote ?? false, deadline: job.deadline ?? '',
    } : emptyForm);

    const [tab, setTab] = useState(0);
    const [skillInput, setSkillInput] = useState('');
    const [skillDropOpen, setSkillDropOpen] = useState(false);
    const [qualInput, setQualInput] = useState('');
    const [reqInput, setReqInput] = useState('');
    const [qInput, setQInput] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const skillRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', esc);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
    }, []);
    useEffect(() => {
        const click = (e: MouseEvent) => {
            if (skillRef.current && !skillRef.current.contains(e.target as Node)) setSkillDropOpen(false);
        };
        document.addEventListener('mousedown', click);
        return () => document.removeEventListener('mousedown', click);
    }, []);

    const set = (k: keyof JobFormData, v: any) => {
        setForm(f => ({ ...f, [k]: v }));
        setErrors(e => { const n = { ...e }; delete n[k]; return n; });
    };
    const addSkill = (s: string) => {
        const t = s.trim();
        if (t && !form.skills_required.includes(t)) set('skills_required', [...form.skills_required, t]);
        setSkillInput('');
    };
    const addToList = (field: 'qualifications' | 'requirements' | 'screener_questions', val: string, clearFn: () => void) => {
        const t = val.trim();
        if (t) { set(field, [...(form[field] as string[]), t]); clearFn(); }
    };
    const removeFromList = (field: 'qualifications' | 'requirements' | 'screener_questions', i: number) => {
        set(field, (form[field] as string[]).filter((_, idx) => idx !== i));
    };
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
    };
    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.title.trim()) e.title = 'Job title is required.';
        if (!form.location.trim()) e.location = 'Location is required.';
        if (!form.description.trim()) e.description = 'Description is required.';
        if (!form.employment_type) e.employment_type = 'Employment type is required.';
        return e;
    };
    const handleSubmit = () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); setTab(0); return; }
        setSaving(true);
        const data = new FormData();
        data.append('title', form.title); data.append('company', form.company);
        data.append('location', form.location); data.append('description', form.description);
        data.append('responsibilities', form.responsibilities);
        data.append('employment_type', form.employment_type);
        data.append('salary_currency', form.salary_currency);
        data.append('experience_level', form.experience_level);
        data.append('industry', form.industry); data.append('status', form.status);
        data.append('work_arrangement', form.work_arrangement);
        if (form.salary_min) data.append('salary_min', form.salary_min);
        if (form.salary_max) data.append('salary_max', form.salary_max);
        if (form.application_limit) data.append('application_limit', form.application_limit);
        if (form.deadline) data.append('deadline', form.deadline);
        data.append('is_remote', form.is_remote ? '1' : '0');
        form.skills_required.forEach((s, i) => data.append(`skills_required[${i}]`, s));
        form.qualifications.forEach((q, i) => data.append(`qualifications[${i}]`, q));
        form.requirements.forEach((r, i) => data.append(`requirements[${i}]`, r));
        form.screener_questions.forEach((q, i) => data.append(`screener_questions[${i}]`, q));
        if (logoFile) data.append('logo', logoFile);
        const opts = {
            preserveScroll: true,
            onSuccess: () => { setSaving(false); onClose(); },
            onError: (errs: any) => { setErrors(errs); setSaving(false); },
            forceFormData: true,
        };
        if (mode === 'edit' && job) {
            data.append('_method', 'put');
            router.post(route('employer.jobs.update', job.id), data as any, opts);
        } else {
            router.post(route('employer.jobs.store'), data as any, opts);
        }
    };

    const filteredSkills = SKILL_OPTIONS.filter(s => !form.skills_required.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase()));

    const TABS = [
        { label: 'Job Details', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg> },
        { label: 'Description', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
        { label: 'Hiring Team', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
        { label: 'Screener Qs', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
        { label: 'Settings', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
                {/* Modal header */}
                <div className="h-12 bg-gradient-to-r from-[#6D9886] to-[#4a7360] flex-shrink-0 flex items-center px-5 justify-between">
                    <h2 className="text-white font-bold text-sm">{mode === 'create' ? '+ Post New Job' : 'Edit Job Listing'}</h2>
                    <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"><XIcon/></button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Vertical Tab Nav */}
                    <div className="w-40 flex-shrink-0 bg-gray-50 border-r border-gray-100 py-4 px-2 flex flex-col gap-1">
                        {TABS.map((t, i) => (
                            <button key={i} onClick={() => setTab(i)}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all w-full ${tab === i ? 'bg-[#6D9886] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}>
                                <span className="flex-shrink-0">{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-5">
                        {/* Tab 0: Job Details */}
                        {tab === 0 && (
                            <div className="space-y-4">
                                {/* Logo upload */}
                                <label className="relative group cursor-pointer block">
                                    <div className="w-full h-20 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group-hover:border-[#6D9886]/50 transition-all">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2"/>
                                        ) : (
                                            <div className="flex items-center gap-3 text-gray-400">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                                <span className="text-xs font-medium">Upload Company Logo (JPG, PNG)</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange}/>
                                </label>

                                <div>
                                    <label className={lbl}>Job Title *</label>
                                    <input value={form.title} onChange={e => set('title', e.target.value)} className={inp} placeholder="e.g. Senior Frontend Developer"/>
                                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={lbl}>Company</label>
                                        <input value={form.company} onChange={e => set('company', e.target.value)} className={inp} placeholder="Company name"/>
                                    </div>
                                    <div>
                                        <label className={lbl}>Location *</label>
                                        <input value={form.location} onChange={e => set('location', e.target.value)} className={inp} placeholder="e.g. Manila, PH"/>
                                        {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Salary Range</label>
                                    <div className="flex gap-2">
                                        <select value={form.salary_currency} onChange={e => set('salary_currency', e.target.value)}
                                            className="rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-xs px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6D9886] w-16">
                                            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                        <input value={form.salary_min} onChange={e => set('salary_min', e.target.value)} type="number" className={`${inp} flex-1`} placeholder="Min" min="0"/>
                                        <input value={form.salary_max} onChange={e => set('salary_max', e.target.value)} type="number" className={`${inp} flex-1`} placeholder="Max" min="0"/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={lbl}>Employment Type *</label>
                                        <select value={form.employment_type} onChange={e => set('employment_type', e.target.value)} className={inp}>
                                            <option value="">Select type</option>
                                            {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        {errors.employment_type && <p className="text-xs text-red-500 mt-1">{errors.employment_type}</p>}
                                    </div>
                                    <div>
                                        <label className={lbl}>Work Arrangement</label>
                                        <select value={form.work_arrangement} onChange={e => set('work_arrangement', e.target.value)} className={inp}>
                                            <option value="">Select</option>
                                            {WORK_ARRANGEMENTS.map(w => <option key={w} value={w}>{w}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Experience Level</label>
                                    <select value={form.experience_level} onChange={e => set('experience_level', e.target.value)} className={inp}>
                                        <option value="">Select level</option>
                                        {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                {/* Skills */}
                                <div ref={skillRef}>
                                    <label className={lbl}>Skills / Tags</label>
                                    <div className="relative">
                                        <div className="flex gap-2">
                                            <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                                onFocus={() => setSkillDropOpen(true)}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                                                placeholder="Search or type a skill..." className={`${inp} flex-1`}/>
                                            <button type="button" onClick={() => addSkill(skillInput)}
                                                className="px-3 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-xs font-semibold rounded-xl transition-colors">Add</button>
                                        </div>
                                        {skillDropOpen && filteredSkills.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg max-h-32 overflow-y-auto">
                                                {filteredSkills.slice(0, 6).map(s => (
                                                    <button key={s} type="button" onClick={() => { addSkill(s); setSkillDropOpen(false); }}
                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-[#6D9886]/10 hover:text-[#4a7360] transition-colors text-left">+ {s}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {form.skills_required.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {form.skills_required.map(s => (
                                                <span key={s} className="inline-flex items-center gap-1 bg-[#6D9886]/10 text-[#4a7360] text-xs font-medium px-2.5 py-1 rounded-full border border-[#6D9886]/20">
                                                    {s}
                                                    <button type="button" onClick={() => set('skills_required', form.skills_required.filter(x => x !== s))} className="hover:text-red-500 transition-colors leading-none ml-0.5">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 1: Description & Qualifications */}
                        {tab === 1 && (
                            <div className="space-y-5">
                                <div>
                                    <label className={lbl}>Job Summary *</label>
                                    <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                        rows={5} className={`${inp} resize-none`} placeholder="Describe the role and what the candidate will do..."/>
                                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                                </div>
                                <div>
                                    <label className={lbl}>Key Responsibilities</label>
                                    <textarea value={form.responsibilities} onChange={e => set('responsibilities', e.target.value)}
                                        rows={3} className={`${inp} resize-none`} placeholder="List primary duties..."/>
                                </div>
                                {/* Qualifications list */}
                                <div>
                                    <label className={lbl}>Qualifications</label>
                                    <div className="flex gap-2 mb-2">
                                        <input value={qualInput} onChange={e => setQualInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList('qualifications', qualInput, () => setQualInput('')); } }}
                                            placeholder="Add qualification..." className={`${inp} flex-1`}/>
                                        <button type="button" onClick={() => addToList('qualifications', qualInput, () => setQualInput(''))}
                                            className="px-3 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-xs font-semibold rounded-xl transition-colors">+ Add</button>
                                    </div>
                                    {form.qualifications.length > 0 && (
                                        <ul className="space-y-1.5">
                                            {form.qualifications.map((q, i) => (
                                                <li key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 group">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#6D9886] flex-shrink-0"/>
                                                    <span className="text-sm text-gray-700 flex-1">{q}</span>
                                                    <button type="button" onClick={() => removeFromList('qualifications', i)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none">×</button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {/* Requirements list */}
                                <div>
                                    <label className={lbl}>Requirements</label>
                                    <div className="flex gap-2 mb-2">
                                        <input value={reqInput} onChange={e => setReqInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList('requirements', reqInput, () => setReqInput('')); } }}
                                            placeholder="Add requirement..." className={`${inp} flex-1`}/>
                                        <button type="button" onClick={() => addToList('requirements', reqInput, () => setReqInput(''))}
                                            className="px-3 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-xs font-semibold rounded-xl transition-colors">+ Add</button>
                                    </div>
                                    {form.requirements.length > 0 && (
                                        <ul className="space-y-1.5">
                                            {form.requirements.map((r, i) => (
                                                <li key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 group">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#6D9886] flex-shrink-0"/>
                                                    <span className="text-sm text-gray-700 flex-1">{r}</span>
                                                    <button type="button" onClick={() => removeFromList('requirements', i)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none">×</button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Hiring Team */}
                        {tab === 2 && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">Add recruiters or managers to this job's hiring team.</p>
                                <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center">
                                    <svg className="mx-auto mb-2 text-gray-300" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                                    <p className="text-xs text-gray-400">Hiring team management coming soon</p>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Screener Questions */}
                        {tab === 3 && (
                            <div className="space-y-4">
                                <div>
                                    <label className={lbl}>Screener Questions</label>
                                    <p className="text-xs text-gray-400 mb-3">Add custom questions for applicants to answer.</p>
                                    <div className="flex gap-2 mb-3">
                                        <input value={qInput} onChange={e => setQInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList('screener_questions', qInput, () => setQInput('')); } }}
                                            placeholder="e.g. Do you have experience with Figma?" className={`${inp} flex-1`}/>
                                        <button type="button" onClick={() => addToList('screener_questions', qInput, () => setQInput(''))}
                                            className="px-3 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-xs font-semibold rounded-xl transition-colors">+ Add</button>
                                    </div>
                                    {form.screener_questions.length > 0 ? (
                                        <ul className="space-y-2">
                                            {form.screener_questions.map((q, i) => (
                                                <li key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                                                    <span className="text-xs font-bold text-[#6D9886] flex-shrink-0 mt-0.5">Q{i + 1}.</span>
                                                    <span className="text-sm text-gray-700 flex-1">{q}</span>
                                                    <button type="button" onClick={() => removeFromList('screener_questions', i)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none">×</button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-6 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center">
                                            <p className="text-xs text-gray-400">No screener questions added yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 4: Settings */}
                        {tab === 4 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={lbl}>Application Limit</label>
                                        <input value={form.application_limit} onChange={e => set('application_limit', e.target.value)}
                                            type="number" className={inp} placeholder="e.g. 200" min="1"/>
                                    </div>
                                    <div>
                                        <label className={lbl}>Status</label>
                                        <select value={form.status} onChange={e => set('status', e.target.value as any)} className={inp}>
                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Expiry Date</label>
                                    <input value={form.deadline} onChange={e => set('deadline', e.target.value)} type="date" className={inp}/>
                                </div>
                                <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <input type="checkbox" id="is_remote" checked={form.is_remote}
                                        onChange={e => set('is_remote', e.target.checked)}
                                        className="w-4 h-4 rounded accent-[#6D9886] cursor-pointer"/>
                                    <label htmlFor="is_remote" className="text-sm text-gray-700 cursor-pointer select-none font-medium">Remote position</label>
                                </div>
                                <div>
                                    <label className={lbl}>Industry</label>
                                    <input value={form.industry} onChange={e => set('industry', e.target.value)} className={inp} placeholder="e.g. Technology"/>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50">
                    <div className="flex gap-1.5">
                        {TABS.map((_, i) => (
                            <button key={i} onClick={() => setTab(i)}
                                className={`w-2 h-2 rounded-full transition-all ${tab === i ? 'bg-[#6D9886] w-5' : 'bg-gray-200 hover:bg-gray-300'}`}/>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        {tab > 0 && (
                            <button onClick={() => setTab(t => t - 1)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Back</button>
                        )}
                        {tab < TABS.length - 1 ? (
                            <button onClick={() => setTab(t => t + 1)} className="px-5 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-sm font-semibold rounded-xl transition-colors">Next</button>
                        ) : (
                            <button onClick={handleSubmit} disabled={saving}
                                className="px-5 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                                {saving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                {mode === 'create' ? 'Create Job' : 'Save Changes'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Status Badge ── */
function StatusBadge({ status, jobId }: { status: JobListing['status']; jobId: number }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    const cfg = {
        active: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Active' },
        inactive: { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', label: 'Inactive' },
        draft: { dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Draft' },
    }[status];
    return (
        <div ref={ref} className="relative inline-block">
            <button onClick={() => setOpen(o => !o)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.text} hover:shadow-sm transition-all`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
                {cfg.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-60"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {open && (
                <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[110px]">
                    {(['active','inactive','draft'] as const).filter(s => s !== status).map(s => {
                        const c = { active: { dot: 'bg-emerald-500', label: 'Active' }, inactive: { dot: 'bg-gray-400', label: 'Inactive' }, draft: { dot: 'bg-amber-400', label: 'Draft' } }[s];
                        return (
                            <button key={s} onClick={() => { router.patch(route('employer.jobs.status', jobId), { status: s }, { preserveScroll: true }); setOpen(false); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}/>{c.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ── Options Menu (fixed-position portal) ── */
function OptionsMenu({ job, onView, onEdit }: { job: JobListing; onView: () => void; onEdit: () => void }) {
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => {
            const target = e.target as Node;
            const menu = document.getElementById(`options-menu-${job.id}`);
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
            <button ref={btnRef} onClick={handleOpen} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </button>
            {open && (
                <div id={`options-menu-${job.id}`} style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
                    className="z-[9999] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[150px]">
                    <button onClick={() => { onView(); setOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>View
                    </button>
                    <button onClick={() => { onEdit(); setOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit
                    </button>
                    <button onClick={() => { router.visit(route('employer.jobs.applications', job.id)); setOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>Applications
                    </button>
                    <div className="border-t border-gray-100"/>
                    <button onClick={() => { setOpen(false); if (confirm('Delete this job listing?')) router.delete(route('employer.jobs.destroy', job.id), { preserveScroll: true }); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>Delete
                    </button>
                </div>
            )}
        </>
    );
}

/* ── Job Card ── */
function JobCard({ job, onView, onEdit }: { job: JobListing; onView: () => void; onEdit: () => void }) {
    const statusCfg = {
        active: { bg: 'bg-emerald-100 text-emerald-700', label: 'Active' },
        inactive: { bg: 'bg-gray-100 text-gray-500', label: 'Inactive' },
        draft: { bg: 'bg-amber-100 text-amber-700', label: 'Draft' },
    }[job.status];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
            {/* Card top accent */}
            <div className="h-1.5 bg-gradient-to-r from-[#6D9886] to-[#4a7360]"/>
            <div className="p-5 flex-1 flex flex-col">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl ${avatarColor(job.id)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm`}>
                            {getInitials(job.company || job.title)}
                        </div>
                        <div className="min-w-0">
                            <button onClick={onView} className="text-sm font-bold text-gray-900 hover:text-[#6D9886] transition-colors truncate block text-left leading-tight line-clamp-2">
                                {job.title}
                            </button>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{job.company}</p>
                        </div>
                    </div>
                    <OptionsMenu job={job} onView={onView} onEdit={onEdit}/>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.bg}`}>{statusCfg.label}</span>
                    {job.employment_type && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{job.employment_type}</span>}
                    {job.is_remote && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">Remote</span>}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z"/></svg>
                        {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {timeAgo(job.posted_date)}
                    </span>
                </div>

                {(job.salary_min || job.salary_max) && (
                    <p className="text-sm font-semibold text-[#4a7360] mb-3">
                        {job.salary_currency ?? 'USD'} {job.salary_min ? Number(job.salary_min).toLocaleString() : '—'}
                        {job.salary_max ? ` – ${Number(job.salary_max).toLocaleString()}` : '+'}
                        <span className="text-xs text-gray-400 font-normal"> / year</span>
                    </p>
                )}

                <div className="flex-1"/>

                {/* Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <button onClick={() => router.visit(route('employer.jobs.applications', job.id))}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#6D9886] transition-colors">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                        {job.applications_count} Applicant{job.applications_count !== 1 ? 's' : ''}
                    </button>
                    <button onClick={onView} className="flex items-center gap-1 text-xs font-semibold text-[#6D9886] hover:text-[#4a7360] transition-colors">
                        View Details
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function ManageJobs({ user, profile, jobs, isVerified }: Props) {
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [search, setSearch] = useState('');
    const [viewJob, setViewJob] = useState<JobListing | null>(null);
    const [editJob, setEditJob] = useState<JobListing | null>(null);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_applicants'>('newest');

    const companyName = profile?.company_name ?? `${user.first_name} ${user.last_name}`;

    const filtered = jobs
        .filter(j => {
            const matchFilter = filter === 'all' || j.status === filter;
            const matchSearch = !search ||
                j.title.toLowerCase().includes(search.toLowerCase()) ||
                j.company.toLowerCase().includes(search.toLowerCase()) ||
                j.location.toLowerCase().includes(search.toLowerCase());
            return matchFilter && matchSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'most_applicants') return b.applications_count - a.applications_count;
            if (sortBy === 'oldest') return new Date(a.posted_date).getTime() - new Date(b.posted_date).getTime();
            return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime();
        });

    const counts = {
        all: jobs.length,
        active: jobs.filter(j => j.status === 'active').length,
        inactive: jobs.filter(j => j.status === 'inactive').length,
    };

    return (
        <AppLayout pageTitle="Job Management" pageSubtitle="Monitor and manage job postings." activeNav="Manage Jobs">
            <Head title="Manage Jobs"/>

            {viewJob && <ViewJobModal job={viewJob} onClose={() => setViewJob(null)} onEdit={() => { setEditJob(viewJob); setViewJob(null); }}/>}
            {editJob && <JobFormModal mode="edit" job={editJob} companyName={companyName} onClose={() => setEditJob(null)}/>}

            <div className="space-y-5">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Filter tabs */}
                    <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5 shadow-sm">
                        {(['all','active','inactive'] as const).map(tab => (
                            <button key={tab} onClick={() => setFilter(tab)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === tab ? 'bg-[#6D9886] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
                                {tab}
                                <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === tab ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>{counts[tab]}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-9 w-56 shadow-sm">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-400 flex-shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." className="text-xs bg-transparent text-gray-900 placeholder-gray-400 font-medium focus:outline-none w-full"/>
                        </div>
                        {/* Sort */}
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                            className="h-9 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#6D9886] shadow-sm">
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="most_applicants">Most Applicants</option>
                        </select>
                        {/* Add Job */}
                        <button onClick={() => isVerified && router.visit(route('employer.jobs.create'))} disabled={!isVerified}
                            title={!isVerified ? 'Requires verification' : undefined}
                            className="inline-flex items-center gap-1.5 px-4 h-9 bg-[#6D9886] hover:bg-[#5a8371] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm whitespace-nowrap">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add Job
                        </button>
                    </div>
                </div>

                {/* Table
                    FIX: removed overflow-x-auto from this wrapper and moved it to
                    an inner div so the fixed-position dropdown can escape the container.
                */}
                <div className="bg-white rounded-2xl border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest w-[35%]">User</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Company</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Applications</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Posted Date</th>
                                    <th className="px-4 py-3 w-12" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                                <div className="w-16 h-16 rounded-2xl bg-avaa-primary-light flex items-center justify-center text-avaa-teal mb-4">
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="2" y="7" width="20" height="14" rx="2" />
                                                        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                                                    </svg>
                                                </div>
                                                <p className="text-avaa-dark font-semibold mb-1">No job listings yet</p>
                                                <p className="text-sm text-avaa-muted mb-5">Post your first job to start receiving applications.</p>
                                                {isVerified && (
                                                    <button onClick={() => router.visit(route('employer.jobs.create'))}
                                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-avaa-primary text-white text-sm font-semibold rounded-xl hover:bg-avaa-primary-hover transition-colors">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                                        </svg>
                                                        Post New Job
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map(job => (
                                    <tr key={job.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(job.id)}`}>
                                                    {getInitials(job.title)}
                                                </div>
                                                <div className="min-w-0">
                                                    <button onClick={() => setViewJob(job)}
                                                        className="text-sm font-semibold text-avaa-dark hover:text-avaa-teal transition-colors truncate block text-left">
                                                        {job.title}
                                                    </button>
                                                    <p className="text-xs text-avaa-muted truncate">{job.location}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-700">{job.company}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={job.status} jobId={job.id} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <button onClick={() => router.visit(route('employer.jobs.applications', job.id))}
                                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-avaa-dark hover:text-avaa-teal transition-colors">
                                                {job.applications_count}
                                                {job.applications_count > 0 && (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-avaa-muted">
                                                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                                                    </svg>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-avaa-muted flex-shrink-0">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                {formatDate(job.posted_date)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <OptionsMenu job={job} onView={() => setViewJob(job)} onEdit={() => setEditJob(job)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filtered.length > 0 && (
                        <div className="px-5 py-3 border-t border-gray-100">
                            <p className="text-xs text-avaa-muted">
                                Showing <span className="font-semibold text-avaa-dark">{filtered.length}</span> of{' '}
                                <span className="font-semibold text-avaa-dark">{jobs.length}</span> jobs
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}