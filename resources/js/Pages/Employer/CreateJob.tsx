import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useRef, useEffect } from 'react';

/* ── Types ── */
interface Props {
    user: { first_name: string; last_name: string; email: string; role: string };
    profile: any;
    companyName: string;
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

/* ── Constants ── */
const SKILL_OPTIONS = ['JavaScript','TypeScript','Python','React','Vue','Angular','Node.js','Laravel','PHP','SQL','PostgreSQL','MySQL','Tailwind CSS','DevOps','Docker','AWS','UI/UX','Figma','Project Management','Data Analysis','Excel','GraphQL','REST API'];
const EMPLOYMENT_TYPES = ['Full-time','Part-time','Contract','Freelance','Internship'];
const WORK_ARRANGEMENTS = ['On-site','Remote','Hybrid'];
const EXPERIENCE_LEVELS = ['Entry Level','Mid Level','Senior Level','Lead','Manager','Executive'];
const CURRENCIES = ['USD','PHP','EUR','GBP','SGD','AUD'];
const STATUS_OPTIONS = ['active','inactive','draft'] as const;

const inp = "w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6D9886] focus:border-transparent transition-all placeholder-gray-400";
const lbl = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

const TABS = [
    {
        label: 'Job Details',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
    },
    {
        label: 'Description',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    },
    {
        label: 'Hiring Team',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    },
    {
        label: 'Screener Qs',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    },
    {
        label: 'Settings',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    },
];

export default function CreateJob({ user, profile, companyName }: Props) {
    const emptyForm: JobFormData = {
        title: '', company: companyName ?? '', location: '', salary_min: '', salary_max: '',
        salary_currency: 'USD', skills_required: [], description: '', responsibilities: '',
        qualifications: [], requirements: [], screener_questions: [],
        application_limit: '', status: 'active', employment_type: '',
        experience_level: '', industry: '', is_remote: false, deadline: '', work_arrangement: '',
    };

    const [form, setForm] = useState<JobFormData>(emptyForm);
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
        router.post(route('employer.jobs.store'), data as any, {
            preserveScroll: true,
            onSuccess: () => setSaving(false),
            onError: (errs: any) => { setErrors(errs); setSaving(false); },
            forceFormData: true,
        });
    };

    const filteredSkills = SKILL_OPTIONS.filter(s => !form.skills_required.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase()));

    return (
        <AppLayout pageTitle="Post New Job" pageSubtitle="Fill in the details to create a new job listing." activeNav="Manage Jobs">
            <Head title="Post New Job" />

            <div className="min-h-0">
                {/* Page header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <button
                        onClick={() => router.visit(route('employer.jobs.index'))}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        <span className="hidden sm:inline">Back to Manage Jobs</span>
                        <span className="sm:hidden">Back</span>
                    </button>
                </div>

                {/* Form card — scrollable on mobile, fixed height on desktop */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col min-h-0 max-h-[85vh] sm:max-h-[calc(100vh-160px)] sm:min-h-[calc(100vh-160px)]">
                    {/* Card header */}
                    <div className="h-12 sm:h-14 bg-gradient-to-r from-[#6D9886] to-[#4a7360] flex items-center px-4 sm:px-6 justify-between flex-shrink-0">
                        <h2 className="text-white font-bold text-sm sm:text-base flex items-center gap-2 truncate">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Post New Job
                        </h2>
                        <span className="text-white/70 text-xs font-medium flex-shrink-0 ml-2">Step {tab + 1} of {TABS.length}</span>
                    </div>

                    {/* Mobile: horizontal tab bar */}
                    <div className="sm:hidden flex-shrink-0 overflow-x-auto border-b border-gray-100 bg-gray-50/80">
                        <div className="flex gap-0.5 p-2 min-w-max">
                            {TABS.map((t, i) => (
                                <button key={i} onClick={() => setTab(i)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${tab === i ? 'bg-[#6D9886] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}>
                                    <span className="flex-shrink-0">{t.icon}</span>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-1 min-h-0 flex-col sm:flex-row">
                        {/* Desktop: Vertical Tab Nav */}
                        <div className="hidden sm:flex w-44 flex-shrink-0 bg-gray-50 border-r border-gray-100 py-4 px-2 flex-col gap-1 overflow-hidden">
                            {TABS.map((t, i) => (
                                <button key={i} onClick={() => setTab(i)}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all w-full ${tab === i ? 'bg-[#6D9886] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}>
                                    <span className="flex-shrink-0">{t.icon}</span>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content — scrollbar is inside this div */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0 min-h-0">
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <select value={form.salary_currency} onChange={e => set('salary_currency', e.target.value)}
                                                className="rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-xs px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6D9886] w-full sm:w-16">
                                                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                                            </select>
                                            <div className="flex gap-2">
                                                <input value={form.salary_min} onChange={e => set('salary_min', e.target.value)} type="number" className={`${inp} flex-1 min-w-0`} placeholder="Min" min="0"/>
                                                <input value={form.salary_max} onChange={e => set('salary_max', e.target.value)} type="number" className={`${inp} flex-1 min-w-0`} placeholder="Max" min="0"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                                    onFocus={() => setSkillDropOpen(true)}
                                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                                                    placeholder="Search or type a skill..." className={`${inp} flex-1 min-w-0`}/>
                                                <button type="button" onClick={() => addSkill(skillInput)}
                                                    className="px-3 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-xs font-semibold rounded-xl transition-colors flex-shrink-0">Add</button>
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
                                        <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                            <input value={qualInput} onChange={e => setQualInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList('qualifications', qualInput, () => setQualInput('')); } }}
                                                placeholder="Add qualification..." className={`${inp} flex-1 min-w-0`}/>
                                            <button type="button" onClick={() => addToList('qualifications', qualInput, () => setQualInput(''))}
                                                className="px-3 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-xs font-semibold rounded-xl transition-colors flex-shrink-0">+ Add</button>
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
                                        <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                            <input value={reqInput} onChange={e => setReqInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList('requirements', reqInput, () => setReqInput('')); } }}
                                                placeholder="Add requirement..." className={`${inp} flex-1 min-w-0`}/>
                                            <button type="button" onClick={() => addToList('requirements', reqInput, () => setReqInput(''))}
                                                className="px-3 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-xs font-semibold rounded-xl transition-colors flex-shrink-0">+ Add</button>
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
                                        <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                            <input value={qInput} onChange={e => setQInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList('screener_questions', qInput, () => setQInput('')); } }}
                                                placeholder="e.g. Do you have experience with Figma?" className={`${inp} flex-1 min-w-0`}/>
                                            <button type="button" onClick={() => addToList('screener_questions', qInput, () => setQInput(''))}
                                                className="px-3 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-xs font-semibold rounded-xl transition-colors flex-shrink-0">+ Add</button>
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0 bg-gray-50/50">
                        <div className="flex gap-1.5 justify-center sm:justify-start order-2 sm:order-1">
                            {TABS.map((_, i) => (
                                <button key={i} onClick={() => setTab(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${tab === i ? 'bg-[#6D9886] w-5' : 'bg-gray-200 hover:bg-gray-300'}`}
                                    aria-label={`Step ${i + 1}`}/>
                            ))}
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2 order-1 sm:order-2">
                            <button
                                onClick={() => router.visit(route('employer.jobs.index'))}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            {tab > 0 && (
                                <button onClick={() => setTab(t => t - 1)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Back</button>
                            )}
                            {tab < TABS.length - 1 ? (
                                <button onClick={() => setTab(t => t + 1)} className="px-5 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-sm font-semibold rounded-xl transition-colors">Next</button>
                            ) : (
                                <button onClick={handleSubmit} disabled={saving}
                                    className="px-5 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]">
                                    {saving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                    Create Job
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
