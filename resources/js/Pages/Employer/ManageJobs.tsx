import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
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
    profile: any;
    jobs: JobListing[];
    isVerified: boolean;
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

const SKILL_OPTIONS = [
    'JavaScript', 'TypeScript', 'Python', 'React', 'Vue', 'Angular',
    'Node.js', 'Laravel', 'PHP', 'SQL', 'PostgreSQL', 'MySQL',
    'Tailwind CSS', 'DevOps', 'Docker', 'AWS', 'UI/UX', 'Figma',
    'Project Management', 'Data Analysis', 'Excel', 'GraphQL', 'REST API',
];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Remote'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager', 'Executive'];
const CURRENCIES = ['USD', 'PHP', 'EUR', 'GBP', 'SGD', 'AUD'];
const STATUS_OPTIONS = ['active', 'inactive', 'draft'] as const;

const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-base px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:border-transparent transition-all placeholder-gray-400";
const labelClass = "block text-sm font-semibold text-gray-600 mb-1.5";

/* ══════════════════════════════════════════════
   VIEW JOB MODAL — FIX: modal scrolls internally,
   avatar no longer clipped at top
══════════════════════════════════════════════ */
function ViewJobModal({ job, onClose, onEdit }: {
    job: JobListing; onClose: () => void; onEdit: () => void;
}) {
    useEffect(() => {
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', esc);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/*
                FIX: removed overflow-hidden from the outer wrapper so the avatar
                that floats up (-mt-10) is never clipped. Clipping is handled per-zone.
            */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* Gradient header — fixed height, close button */}
                <div className="h-28 bg-gradient-to-r from-avaa-primary/80 via-avaa-teal to-emerald-400 rounded-t-2xl flex-shrink-0 relative">
                    <button onClick={onClose}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors z-10">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
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

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-6 pb-6 pt-3">
                    {/* Company name + meta */}
                    <h2 className="text-2xl font-bold text-avaa-dark">{job.company}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 mb-5">
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z" />
                            </svg>
                            {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-400">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            {timeAgo(job.posted_date)}
                        </span>
                        {job.employment_type && (
                            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                                {job.employment_type}
                            </span>
                        )}
                        {(job.salary_min || job.salary_max) && (
                            <span className="px-2.5 py-0.5 bg-avaa-primary-light text-avaa-teal text-sm font-medium rounded-full">
                                {job.salary_currency ?? 'USD'} {job.salary_min ? Number(job.salary_min).toLocaleString() : '—'}
                                {job.salary_max ? ` – ${Number(job.salary_max).toLocaleString()}` : '+'}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                        {/* Position */}
                        <div>
                            <h4 className="text-base font-bold text-avaa-dark mb-2">Position</h4>
                            <ul className="space-y-1.5">
                                <li className="flex items-start gap-2 text-base text-gray-600">
                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-avaa-teal flex-shrink-0" />{job.title}
                                </li>
                                {job.experience_level && (
                                    <li className="flex items-start gap-2 text-base text-gray-600">
                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-avaa-teal flex-shrink-0" />{job.experience_level}
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Tech Stack */}
                        {job.skills_required && job.skills_required.length > 0 && (
                            <div>
                                <h4 className="text-base font-bold text-avaa-dark mb-2">Tech Stack Requirements:</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {job.skills_required.map(s => (
                                        <span key={s} className="px-2.5 py-0.5 bg-avaa-primary-light text-avaa-teal text-sm font-semibold rounded-full border border-avaa-primary/20">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {job.description && (
                        <div className="mb-5">
                            <h4 className="text-base font-bold text-avaa-dark mb-2">Description</h4>
                            <div className="text-base text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex gap-6 pt-3 border-t border-gray-100">
                        <div>
                            <p className="text-xl font-extrabold text-avaa-dark">{job.applications_count}</p>
                            <p className="text-sm text-avaa-muted">Applications</p>
                        </div>
                        <div>
                            <p className="text-xl font-extrabold text-avaa-dark capitalize">{job.status}</p>
                            <p className="text-sm text-avaa-muted">Status</p>
                        </div>
                        {job.deadline && (
                            <div>
                                <p className="text-xl font-extrabold text-avaa-dark">{job.deadline}</p>
                                <p className="text-sm text-avaa-muted">Deadline</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0 rounded-b-2xl">
                    <button onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-avaa-dark border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   CREATE / EDIT JOB MODAL
══════════════════════════════════════════════ */
interface JobFormData {
    title: string; company: string; location: string;
    salary_min: string; salary_max: string; salary_currency: string;
    skills_required: string[]; description: string; application_limit: string;
    status: 'active' | 'inactive' | 'draft';
    employment_type: string; experience_level: string;
    industry: string; is_remote: boolean; deadline: string;
    responsibilities: string;
    qualifications: string;          
    project_timeline: string;        
    onboarding_process: string;
    
}

function JobFormModal({ mode, job, companyName, onClose }: {
    mode: 'create' | 'edit'; job?: JobListing; companyName?: string; onClose: () => void;
}) {
    const [form, setForm] = useState<JobFormData>(() =>
        job ? {
            title: job.title ?? '', company: job.company ?? companyName ?? '',
            location: job.location ?? '', salary_min: job.salary_min ? String(job.salary_min) : '',
            salary_max: job.salary_max ? String(job.salary_max) : '',
            salary_currency: job.salary_currency ?? 'USD', skills_required: job.skills_required ?? [],
            description: job.description ?? '', responsibilities: job.description ?? '',
            qualifications: '',      // Add this
            project_timeline: '',    // Add this
            onboarding_process: '',
            application_limit: '',
            status: job.status ?? 'active', employment_type: job.employment_type ?? '',
            experience_level: job.experience_level ?? '', industry: job.industry ?? '',
            is_remote: job.is_remote ?? false, deadline: job.deadline ?? '',
        } : {
            title: '', company: companyName ?? '', location: '', salary_min: '', salary_max: '',
            salary_currency: 'USD', skills_required: [], description: '', responsibilities: '',
            qualifications: '',      // Add this
            project_timeline: '',    // Add this
            onboarding_process: '',
            application_limit: '',
            status: 'active', employment_type: '', experience_level: '',
            industry: '', is_remote: false, deadline: '',
        }
    );

    const [skillInput, setSkillInput] = useState('');
    const [skillDropOpen, setSkillDropOpen] = useState(false);
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

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    }
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.title.trim()) e.title = 'Job title is required.';
        if (!form.location.trim()) e.location = 'Location is required.';
        if (!form.description.trim()) e.description = 'Description is required.';
        
        if (!form.employment_type) e.employment_type = 'Employment type is required.';
        return e;
    };

    // const handleSubmit = () => {
    //     const e = validate();
    //     if (Object.keys(e).length) { setErrors(e); return; }
    //     setSaving(true);
    //     const payload = {
    //         title: form.title, location: form.location, description: form.description,
    //         responsibilities: form.responsibilities,
    //         qualifications: form.qualifications,
    //         project_timeline: form.project_timeline,
    //         onboarding_process: form.onboarding_process,
    //         employment_type: form.employment_type, salary_min: form.salary_min || null,
    //         salary_max: form.salary_max || null, salary_currency: form.salary_currency,
    //         skills_required: form.skills_required, experience_level: form.experience_level,
    //         industry: form.industry, is_remote: form.is_remote,
    //         deadline: form.deadline || null, status: form.status,
    //         application_limit: form.application_limit || null,
    //     };
    //     const opts = {
    //         preserveScroll: true,
    //         onSuccess: () => { setSaving(false); onClose(); },
    //         onError: (errs: any) => { setErrors(errs); setSaving(false); },
    //     };
    //     mode === 'edit' && job
    //         ? router.put(route('employer.jobs.update', job.id), payload, opts)
    //         : router.post(route('employer.jobs.store'), payload, opts);
    // };

    const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);

    // 1. Initialize FormData
    const data = new FormData();
    
    // 2. Append all text fields
    data.append('title', form.title);
    data.append('company', form.company);
    data.append('location', form.location);
    data.append('description', form.description);
    data.append('responsibilities', form.responsibilities);
    data.append('qualifications', form.qualifications);
    data.append('project_timeline', form.project_timeline);
    data.append('onboarding_process', form.onboarding_process);
    data.append('employment_type', form.employment_type);
    data.append('salary_currency', form.salary_currency);
    data.append('experience_level', form.experience_level);
    data.append('industry', form.industry);
    data.append('status', form.status);
    
    // Handle nullable/conditional fields
    if (form.salary_min) data.append('salary_min', form.salary_min);
    if (form.salary_max) data.append('salary_max', form.salary_max);
    if (form.application_limit) data.append('application_limit', form.application_limit);
    if (form.deadline) data.append('deadline', form.deadline);
    
    // Booleans must be sent as strings '1' or '0' for Laravel to parse correctly from FormData
    data.append('is_remote', form.is_remote ? '1' : '0');

    // 3. Append the Array (Skills)
    form.skills_required.forEach((skill, index) => {
        data.append(`skills_required[${index}]`, skill);
    });

    // 4. Append the Logo File (Only if a new one was selected)
    if (logoFile) {
        data.append('logo', logoFile);
    }

    const opts = {
        preserveScroll: true,
        onSuccess: () => { setSaving(false); onClose(); },
        onError: (errs: any) => { setErrors(errs); setSaving(false); },
        forceFormData: true, // Ensures Inertia treats this as a file upload
    };

    // 5. Submit Logic
    if (mode === 'edit' && job) {
        // Special Laravel Trick: Use POST but spoof it as PUT so files work
        data.append('_method', 'put');
        router.post(route('employer.jobs.update', job.id), data as any, opts);
    } else {
        router.post(route('employer.jobs.store'), data as any, opts);
    }
};

    const filteredSkills = SKILL_OPTIONS.filter(s =>
        !form.skills_required.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col">

                <div className="h-14 bg-gradient-to-r from-avaa-primary/80 via-avaa-teal to-emerald-400 flex-shrink-0 relative flex items-center px-5">
                    <h2 className="text-white font-bold text-base">{mode === 'create' ? 'Post New Job' : 'Edit Job Listing'}</h2>
                    <button onClick={onClose}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                {/* ─── LOGO UPLOAD BLOCK ─── */}
                {/* Added pt-4 for top spacing and px-4 for responsiveness */}
                <div className="flex flex-col items-center pt-4 pb-6 w-full px-4 sm:px-6">
                    <label className="relative group cursor-pointer w-full max-w-md"> 
                        {/* Changed h-28 to aspect ratio for better responsiveness */}
                        <div className="w-full aspect-[3/1] sm:h-28 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group-hover:border-avaa-primary/50 transition-all shadow-sm">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-4" /> 
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="p-3 bg-white rounded-full shadow-sm border border-gray-100 mb-2">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                    </div>
                                    <span className="text-[13px] text-gray-400 font-semibold">Upload Company Logo</span>
                                    <span className="text-[10px] text-gray-300 mt-0.5 font-medium italic">Supports JPG, PNG</span>
                                </div>
                            )}
                            
                            {/* Change Logo Overlay */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-[1px]">
                                <span className="text-[11px] text-white font-bold uppercase tracking-wider bg-avaa-primary/80 px-4 py-2 rounded-xl shadow-lg">
                                    Upload Logo
                                </span>
                            </div>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </label>
                </div>

                <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4">
                    <div>
                        <label className={labelClass}>Job Title</label>
                        <input value={form.title} onChange={e => set('title', e.target.value)} className={inputClass} placeholder="Job Title" />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Company</label>
                            <input value={form.company} onChange={e => set('company', e.target.value)} className={inputClass} placeholder="Company" />
                        </div>
                        <div>
                            <label className={labelClass}>Location</label>
                            <input value={form.location} onChange={e => set('location', e.target.value)} className={inputClass} placeholder="Location" />
                            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Salary Range</label>
                            <div className="flex gap-1.5">
                                <select value={form.salary_currency} onChange={e => set('salary_currency', e.target.value)}
                                    className="rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-xs px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-avaa-primary w-16">
                                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                                <input value={form.salary_min} onChange={e => set('salary_min', e.target.value)}
                                    type="number" className={`${inputClass} flex-1`} placeholder="Min" min="0" />
                            </div>
                            <input value={form.salary_max} onChange={e => set('salary_max', e.target.value)}
                                type="number" className={`${inputClass} mt-1.5`} placeholder="Max (optional)" min="0" />
                        </div>
                        <div ref={skillRef}>
                            <label className={labelClass}>Skills Required</label>
                            <div className="relative">
                                <div onClick={() => setSkillDropOpen(o => !o)}
                                    className={`${inputClass} flex items-center justify-between cursor-pointer`}>
                                    <span className="text-gray-400">
                                        {form.skills_required.length > 0 ? `${form.skills_required.length} selected` : 'Skills Required'}
                                    </span>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                        className={`transition-transform ${skillDropOpen ? 'rotate-180' : ''}`}>
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                                {skillDropOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                        <div className="p-2 border-b border-gray-100">
                                            <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                                                placeholder="Search or type a skill..."
                                                className="w-full text-sm px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-avaa-primary"
                                                onClick={e => e.stopPropagation()} />
                                        </div>
                                        <div className="max-h-36 overflow-y-auto">
                                            {filteredSkills.slice(0, 8).map(s => (
                                                <button key={s} type="button" onClick={() => addSkill(s)}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-avaa-primary-light hover:text-avaa-teal transition-colors text-left">
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                    {s}
                                                </button>
                                            ))}
                                            {filteredSkills.length === 0 && skillInput && (
                                                <button type="button" onClick={() => addSkill(skillInput)}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-avaa-teal hover:bg-avaa-primary-light transition-colors">
                                                    + Add "{skillInput}"
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {form.skills_required.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {form.skills_required.map(s => (
                                        <span key={s} className="inline-flex items-center gap-1 bg-avaa-primary-light text-avaa-teal text-[11px] font-medium px-2 py-0.5 rounded-full">
                                            {s}
                                            <button type="button" onClick={() => set('skills_required', form.skills_required.filter(x => x !== s))}
                                                className="hover:text-red-500 transition-colors leading-none">×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Job Description</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)}
                            rows={4} className={`${inputClass} resize-none`} placeholder="Job Description" />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                    </div>
                        <div>
                            <label className={labelClass}>Key Responsibilities</label>
                            <textarea 
                                value={form.responsibilities} 
                                onChange={e => set('responsibilities', e.target.value)}
                                rows={4} 
                                className={`${inputClass} resize-none`} 
                                placeholder="List the primary duties and responsibilities..." 
                            />
                            {errors.responsibilities && (
                                <p className="text-xs text-red-500 mt-1">{errors.responsibilities}</p>
                            )}
                        </div>
                        {/* Ideal Qualifications */}
                            <div>
                                <label className={labelClass}>Ideal Qualifications</label>
                                <textarea 
                                    value={form.qualifications} 
                                    onChange={e => set('qualifications', e.target.value)}
                                    rows={4} 
                                    className={`${inputClass} resize-none`} 
                                    placeholder="What skills and experience should the perfect candidate have?" 
                                />
                                {errors.qualifications && (
                                    <p className="text-xs text-red-500 mt-1">{errors.qualifications}</p>
                                )}
                            </div>

                            {/* Project Timeline */}
                            <div>
                                <label className={labelClass}>Project Timeline</label>
                                <textarea 
                                    value={form.project_timeline} 
                                    onChange={e => set('project_timeline', e.target.value)}
                                    rows={3} 
                                    className={`${inputClass} resize-none`} 
                                    placeholder="e.g., Phase 1: Planning (2 weeks), Phase 2: Execution..." 
                                />
                                {errors.project_timeline && (
                                    <p className="text-xs text-red-500 mt-1">{errors.project_timeline}</p>
                                )}
                            </div>

                            {/* Application and Onboarding Process */}
                            <div>
                                <label className={labelClass}>Application and Onboarding Process</label>
                                <textarea 
                                    value={form.onboarding_process} 
                                    onChange={e => set('onboarding_process', e.target.value)}
                                    rows={3} 
                                    className={`${inputClass} resize-none`} 
                                    placeholder="Explain the steps from application to the first day..." 
                                />
                                {errors.onboarding_process && (
                                    <p className="text-xs text-red-500 mt-1">{errors.onboarding_process}</p>
                                )}
                            </div>


                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Application Limit</label>
                            <input value={form.application_limit} onChange={e => set('application_limit', e.target.value)}
                                type="number" className={inputClass} placeholder="1" min="1" />
                        </div>
                        <div>
                            <label className={labelClass}>Status</label>
                            <select value={form.status} onChange={e => set('status', e.target.value as any)} className={inputClass}>
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Employment Type</label>
                            <select value={form.employment_type} onChange={e => set('employment_type', e.target.value)} className={inputClass}>
                                <option value="">Select type</option>
                                {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            {errors.employment_type && <p className="text-xs text-red-500 mt-1">{errors.employment_type}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Experience Level</label>
                            <select value={form.experience_level} onChange={e => set('experience_level', e.target.value)} className={inputClass}>
                                <option value="">Select level</option>
                                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Deadline (optional)</label>
                            <input value={form.deadline} onChange={e => set('deadline', e.target.value)} type="date" className={inputClass} />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input type="checkbox" id="is_remote" checked={form.is_remote}
                                onChange={e => set('is_remote', e.target.checked)}
                                className="w-4 h-4 rounded accent-avaa-primary cursor-pointer" />
                            <label htmlFor="is_remote" className="text-sm text-gray-700 cursor-pointer select-none">Remote position</label>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
                    <button onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-avaa-dark border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        Close
                    </button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="px-5 py-2 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                        {saving && (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        {mode === 'create' ? 'Create Job' : 'Save Changes'}
                    </button>
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
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.text} hover:shadow-sm transition-all`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-60">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {open && (
                <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[120px]">
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

/* ── Options Menu ──
   FIX: rendered via a portal-like approach using fixed positioning so it
   escapes the overflow-x-auto table container and never gets clipped.
── */
function OptionsMenu({ job, onView, onEdit }: { job: JobListing; onView: () => void; onEdit: () => void }) {
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => {
            const target = e.target as Node;
            const menu = document.getElementById(`options-menu-${job.id}`);
            if (menu && !menu.contains(target) && btnRef.current && !btnRef.current.contains(target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    const handleOpen = () => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + window.scrollY + 4,
                right: window.innerWidth - rect.right - window.scrollX,
            });
        }
        setOpen(o => !o);
    };

    return (
        <>
            <button ref={btnRef} onClick={handleOpen}
                className="p-1.5 rounded-lg text-gray-400 hover:text-avaa-dark hover:bg-gray-100 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
            </button>

            {/* Rendered at the document root via fixed position — escapes all overflow containers */}
            {open && (
                <div
                    id={`options-menu-${job.id}`}
                    style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
                    className="z-[9999] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[150px]">
                    <button onClick={() => { onView(); setOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        View
                    </button>
                    <button onClick={() => { onEdit(); setOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                    </button>
                    <button onClick={() => { router.visit(route('employer.jobs.applications', job.id)); setOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                        </svg>
                        Applications
                    </button>
                    <div className="border-t border-gray-100" />
                    <button onClick={() => {
                        setOpen(false);
                        if (confirm('Delete this job listing?')) {
                            router.delete(route('employer.jobs.destroy', job.id), { preserveScroll: true });
                        }
                    }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                        Delete
                    </button>
                </div>
            )}
        </>
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
    const [showCreate, setShowCreate] = useState(false);

    const companyName = profile?.company_name ?? `${user.first_name} ${user.last_name}`;

    const filtered = jobs.filter(j => {
        const matchFilter = filter === 'all' || j.status === filter;
        const matchSearch = !search ||
            j.title.toLowerCase().includes(search.toLowerCase()) ||
            j.company.toLowerCase().includes(search.toLowerCase()) ||
            j.location.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const counts = {
        all: jobs.length,
        active: jobs.filter(j => j.status === 'active').length,
        inactive: jobs.filter(j => j.status === 'inactive').length,
    };

    return (
        <AppLayout pageTitle="Manage Jobs"
            pageSubtitle={`${counts.active} active listing${counts.active !== 1 ? 's' : ''}`}
            activeNav="Manage Jobs">
            <Head title="Manage Jobs" />

            {viewJob && (
                <ViewJobModal job={viewJob} onClose={() => setViewJob(null)}
                    onEdit={() => { setEditJob(viewJob); setViewJob(null); }} />
            )}
            {showCreate && (
                <JobFormModal mode="create" companyName={companyName} onClose={() => setShowCreate(false)} />
            )}
            {editJob && (
                <JobFormModal mode="edit" job={editJob} companyName={companyName} onClose={() => setEditJob(null)} />
            )}

            <div className="space-y-4">

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5 shadow-sm">
                        {(['all', 'active', 'inactive'] as const).map(tab => (
                            <button key={tab} onClick={() => setFilter(tab)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === tab
                                    ? 'bg-avaa-dark text-white shadow-sm'
                                    : 'text-gray-500 hover:text-avaa-dark hover:bg-gray-50'
                                    }`}>
                                {tab}
                                <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>{counts[tab]}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-10 w-64 shadow-sm">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-400 flex-shrink-0">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search jobs..."
                                className="text-sm bg-transparent text-gray-900 placeholder-gray-400 font-medium focus:outline-none focus:ring-0 border-0 w-full"
                            />
                        </div>
                        <button
                            onClick={() => isVerified && setShowCreate(true)}
                            disabled={!isVerified}
                            title={!isVerified ? 'Requires verification' : undefined}
                            className="inline-flex items-center gap-2 px-4 h-9 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
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
                                                    <button onClick={() => setShowCreate(true)}
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