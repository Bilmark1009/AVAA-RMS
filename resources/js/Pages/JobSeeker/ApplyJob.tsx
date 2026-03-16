import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { FormEventHandler, useRef, useState, useCallback, DragEvent } from 'react';

/* ── Types ── */
interface JobInfo {
    id: number;
    title: string;
    company: string;
    location: string;
    employment_type?: string;
}

interface Prefill {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    linkedin_url: string;
    portfolio_url: string;
    current_job_title: string;
    current_company: string;
    years_of_experience: string;
    skills: string[];
    cover_letter: string;
    resume_path: string | null;
}

interface Props {
    job: JobInfo;
    prefill: Prefill;
    draftId?: number | null;
}

/* ── Icons ── */
const IcoUser = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IcoMail = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,7 12,13 2,7" />
    </svg>
);
const IcoPhone = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.67 2.36a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.72-1.24a2 2 0 012.11-.45c.76.31 1.55.54 2.36.67A2 2 0 0122 16.92z" />
    </svg>
);
const IcoMapPin = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);
const IcoLink = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
);
const IcoBriefcase = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IcoUpload = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);
const IcoFile = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
);
const IcoX = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const IcoCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IcoArrowRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);
const IcoArrowLeft = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
);

/* ── Shared styles ── */
const inputClass = "block w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:border-transparent transition-all placeholder-gray-400";
const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5";

/* ── Step definitions ── */
const STEPS = ['Personal Information', 'Professional Experience', 'Resume', 'Review Application'] as const;
const STEP_ICONS = [IcoUser, IcoBriefcase, IcoFile, IcoFile];

/* ══════════════════════════════════════════════
   STEP INDICATOR
══════════════════════════════════════════════ */
function StepIndicator({ current }: { current: number }) {
    const pct = ((current + 1) / STEPS.length) * 100;
    // Progress connector width: stop at the current step icon, not beyond.
    const connectorPct = current === 0
        ? 0
        : current === STEPS.length - 1
            ? 94
            : (current / (STEPS.length - 1)) * 100;
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 mb-6">
            {/* Icons + labels */}
            <div className="flex items-center justify-between mb-4 relative">
                {/* Connector line behind icons */}
                <div className="absolute top-5 left-6 right-6 sm:left-8 sm:right-8 h-0.5 bg-gray-200 z-0" />
                <div className="absolute top-5 left-6 sm:left-8 h-0.5 bg-avaa-teal z-0 transition-all duration-500"
                    style={{ width: `${connectorPct}%` }} />

                {STEPS.map((label, i) => {
                    const Icon = STEP_ICONS[i];
                    const done = i < current;
                    const active = i === current;
                    return (
                        <div key={label} className="flex flex-col items-center relative z-10">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                                ${done ? 'bg-avaa-teal text-white' : active ? 'bg-avaa-teal text-white ring-4 ring-avaa-primary-light' : 'bg-gray-100 text-gray-400'}`}>
                                {done ? <IcoCheck /> : <Icon />}
                            </div>
                            <span className={`hidden sm:block text-[10px] font-semibold mt-2 text-center max-w-[80px] leading-tight
                                ${active ? 'text-avaa-teal' : done ? 'text-avaa-teal' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-avaa-teal transition-all duration-500"
                    style={{ width: `${pct}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400 font-medium">Step {current + 1} of {STEPS.length}</span>
                <span className="text-xs font-semibold text-avaa-teal">{Math.round(pct)}% Complete</span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function ApplyJob({ job, prefill, draftId }: Props) {
    const [step, setStep] = useState(0);
    const [skills, setSkills] = useState<string[]>(prefill.skills ?? []);
    const [skillInput, setSkillInput] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [draftSaving, setDraftSaving] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    /* Form data */
    const { data, setData, processing, errors } = useForm({
        full_name: prefill.full_name,
        email: prefill.email,
        phone: prefill.phone,
        location: prefill.location,
        linkedin_url: prefill.linkedin_url,
        portfolio_url: prefill.portfolio_url,
        current_job_title: prefill.current_job_title,
        current_company: prefill.current_company,
        years_of_experience: prefill.years_of_experience,
        skills: prefill.skills,
        cover_letter: prefill.cover_letter,
        existing_resume: prefill.resume_path ?? '',
        resume: null as File | null,
    });

    const resumeName = resumeFile?.name
        ?? (prefill.resume_path ? prefill.resume_path.split('/').pop() : null);

    /* Nav */
    const next = () => { if (step < 3) setStep(step + 1); };
    const back = () => { if (step > 0) setStep(step - 1); };

    /* Skills management */
    const addSkill = (val: string) => {
        const trimmed = val.trim();
        if (trimmed && !skills.includes(trimmed)) {
            const newSkills = [...skills, trimmed];
            setSkills(newSkills);
            setData('skills', newSkills);
        }
        setSkillInput('');
    };
    const removeSkill = (s: string) => {
        const newSkills = skills.filter(x => x !== s);
        setSkills(newSkills);
        setData('skills', newSkills);
    };

    /* Resume file handling */
    const handleFile = (file: File) => {
        if (file.type !== 'application/pdf') return;
        setResumeFile(file);
        setData('resume', file);
        setData('existing_resume', '');
    };
    const onDrop = useCallback((e: DragEvent) => {
        e.preventDefault(); setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, []);
    const removeResume = () => {
        setResumeFile(null);
        setData('resume', null);
        setData('existing_resume', '');
    };

    /* Submit */
    const handleSubmit = () => {
        const fd = new FormData();
        fd.append('full_name', data.full_name);
        fd.append('email', data.email);
        fd.append('phone', data.phone);
        fd.append('location', data.location);
        fd.append('linkedin_url', data.linkedin_url);
        fd.append('portfolio_url', data.portfolio_url);
        fd.append('current_job_title', data.current_job_title);
        fd.append('current_company', data.current_company);
        fd.append('years_of_experience', data.years_of_experience);
        skills.forEach((s, i) => fd.append(`skills[${i}]`, s));
        fd.append('cover_letter', data.cover_letter);
        if (resumeFile) {
            fd.append('resume', resumeFile);
        } else if (data.existing_resume) {
            fd.append('existing_resume', data.existing_resume);
        }

        router.post(route('job-seeker.jobs.apply', job.id), fd, {
            forceFormData: true,
        });
    };

    /* Save Draft */
    const handleSaveDraft = () => {
        setDraftSaving(true);
        const fd = new FormData();
        fd.append('full_name', data.full_name);
        fd.append('email', data.email);
        fd.append('phone', data.phone);
        fd.append('location', data.location);
        fd.append('linkedin_url', data.linkedin_url);
        fd.append('portfolio_url', data.portfolio_url);
        fd.append('current_job_title', data.current_job_title);
        fd.append('current_company', data.current_company);
        fd.append('years_of_experience', data.years_of_experience);
        skills.forEach((s, i) => fd.append(`skills[${i}]`, s));
        fd.append('cover_letter', data.cover_letter);
        if (resumeFile) fd.append('resume', resumeFile);
        else if (data.existing_resume) fd.append('existing_resume', data.existing_resume);

        router.post(route('job-seeker.jobs.apply.draft', job.id), fd, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { setDraftSaving(false); setDraftSaved(true); setTimeout(() => setDraftSaved(false), 3000); },
            onError: () => setDraftSaving(false),
        });
    };

    const expOptions = ['Less than 1 year', '1-2 years', '3-5 years', '6-10 years', '10+ years'];

    return (
        <AppLayout activeNav="Jobs" pageTitle="Application">
            <Head title={`Apply - ${job.title}`} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
                <Link href={route('job-seeker.jobs.browse')} className="hover:text-avaa-teal transition-colors font-medium">Home</Link>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                <Link href={route('job-seeker.jobs.show', job.id)} className="hover:text-avaa-teal transition-colors font-medium">Job Details</Link>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                <span className="text-avaa-teal font-semibold">Application</span>
            </nav>

            {/* Title */}
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-avaa-dark">{job.title} Application</h1>
                <p className="text-sm text-avaa-muted mt-1">Tell us about yourself so we can get to know you better.</p>
            </div>

            {/* Step Indicator */}
            <StepIndicator current={step} />

            {/* ═══ STEP 0: Personal Information ═══ */}
            {step === 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                    <div>
                        <h3 className="text-base font-bold text-avaa-dark">Personal Information</h3>
                        <p className="text-xs text-avaa-muted mt-0.5">Tell us about yourself so we can get to know you better.</p>
                    </div>

                    <div>
                        <label className={labelClass}>Full Name</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IcoUser /></span>
                            <input type="text" value={data.full_name}
                                onChange={e => setData('full_name', e.target.value)}
                                className={inputClass + ' pl-9'} placeholder="e.g. John Doe" />
                        </div>
                        <InputError message={(errors as any).full_name} className="mt-1" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Email</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IcoMail /></span>
                                <input type="email" value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={inputClass + ' pl-9'} placeholder="john@example.com" />
                            </div>
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                        <div>
                            <label className={labelClass}>Phone Number</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IcoPhone /></span>
                                <input type="tel" value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    className={inputClass + ' pl-9'} placeholder="+1 (555) 000-0000" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Location</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IcoMapPin /></span>
                            <input type="text" value={data.location}
                                onChange={e => setData('location', e.target.value)}
                                className={inputClass + ' pl-9'} placeholder="City, Country" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-gray-700">LinkedIn URL</label>
                                <span className="text-[10px] text-gray-400">Optional</span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IcoLink /></span>
                                <input type="text" value={data.linkedin_url}
                                    onChange={e => setData('linkedin_url', e.target.value)}
                                    className={inputClass + ' pl-9'} placeholder="linkedin.com/in/username" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-gray-700">Portfolio</label>
                                <span className="text-[10px] text-gray-400">Optional</span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IcoLink /></span>
                                <input type="text" value={data.portfolio_url}
                                    onChange={e => setData('portfolio_url', e.target.value)}
                                    className={inputClass + ' pl-9'} placeholder="https://portfolio.com" />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                        <button type="button" onClick={handleSaveDraft} disabled={draftSaving}
                            className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
                            {draftSaving ? 'Saving…' : draftSaved ? '✓ Draft Saved' : 'Save as Draft'}
                        </button>
                        <button type="button" onClick={next}
                            className="flex items-center gap-2 px-5 py-2.5 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors">
                            Continue <IcoArrowRight />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ STEP 1: Professional Experience ═══ */}
            {step === 1 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                    <div>
                        <h3 className="text-base font-bold text-avaa-dark">Professional Experience</h3>
                        <p className="text-xs text-avaa-muted mt-0.5">Detail your current role and specialized skills to stand out to recruiters.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Current Job Title</label>
                            <input type="text" value={data.current_job_title}
                                onChange={e => setData('current_job_title', e.target.value)}
                                className={inputClass} placeholder="e.g. Senior Product Designer" />
                        </div>
                        <div>
                            <label className={labelClass}>Company</label>
                            <input type="text" value={data.current_company}
                                onChange={e => setData('current_company', e.target.value)}
                                className={inputClass} placeholder="e.g. Acme Corp" />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Years of Experience</label>
                        <select value={data.years_of_experience}
                            onChange={e => setData('years_of_experience', e.target.value)}
                            className={inputClass + ' appearance-none cursor-pointer'}>
                            <option value="">Select experience range</option>
                            {expOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>

                    {/* Skills & Expertise */}
                    <div>
                        <label className={labelClass}>Skills & Expertise</label>
                        <div className={`flex flex-wrap gap-2 border border-gray-200 rounded-xl bg-gray-50 px-3 py-2.5 min-h-[44px] items-center focus-within:ring-2 focus-within:ring-avaa-primary focus-within:border-transparent transition-all`}>
                            {skills.map(s => (
                                <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-avaa-primary-light text-avaa-teal text-xs font-semibold rounded-full">
                                    {s}
                                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-400 transition-colors">
                                        <IcoX />
                                    </button>
                                </span>
                            ))}
                            <input type="text" value={skillInput}
                                onChange={e => setSkillInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput); }
                                }}
                                onBlur={() => { if (skillInput.trim()) addSkill(skillInput); }}
                                className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder-gray-400 border-0 focus:ring-0 p-0"
                                placeholder="Add a skill..." />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Separate skills with commas or press enter</p>
                    </div>

                    {/* Why are you a good fit? */}
                    <div>
                        <label className={labelClass}>Why are you a good fit?</label>
                        <textarea value={data.cover_letter}
                            onChange={e => setData('cover_letter', e.target.value)}
                            rows={4}
                            className={inputClass + ' resize-none'}
                            placeholder="Share your achievements and what you bring to the team..." />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button type="button" onClick={back}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <IcoArrowLeft /> Back
                        </button>
                        <button type="button" onClick={next}
                            className="flex items-center gap-2 px-5 py-2.5 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors">
                            Continue <IcoArrowRight />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ STEP 2: Resume ═══ */}
            {step === 2 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                    <div>
                        <h3 className="text-base font-bold text-avaa-dark">Upload and attach your resume</h3>
                        <p className="text-xs text-avaa-muted mt-0.5">Please upload your resume in PDF format (max 25 MB). Ensure your contact information and most recent portfolio links are clearly visible for our hiring team.</p>
                    </div>

                    {/* Drag & Drop Zone */}
                    <div
                        onDrop={onDrop}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onClick={() => fileRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                            ${dragOver ? 'border-avaa-teal bg-avaa-primary-light' : 'border-gray-200 hover:border-avaa-teal hover:bg-avaa-primary-light/50'}`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-gray-400"><IcoUpload /></span>
                            <p className="text-sm font-medium text-gray-700">Click or drag files here to upload</p>
                            <p className="text-xs text-gray-400">PDF up to 25 MB</p>
                            <button type="button"
                                className="mt-2 px-5 py-2 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors">
                                Select File
                            </button>
                        </div>
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />

                    {/* Current file */}
                    {(resumeFile || data.existing_resume) && (
                        <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-avaa-primary-light text-avaa-teal flex items-center justify-center flex-shrink-0">
                                <IcoFile />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-avaa-dark truncate">{resumeName ?? 'Resume'}</p>
                                {resumeFile && <p className="text-xs text-gray-400">{(resumeFile.size / (1024 * 1024)).toFixed(1)} MB</p>}
                            </div>
                            <button type="button" onClick={removeResume} className="text-gray-400 hover:text-red-400 transition-colors p-1">
                                <IcoX />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button type="button" onClick={back}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <IcoArrowLeft /> Back
                        </button>
                        <button type="button" onClick={next}
                            className="flex items-center gap-2 px-5 py-2.5 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors">
                            Continue <IcoArrowRight />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ STEP 3: Review Application ═══ */}
            {step === 3 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">

                    {/* Section 1: Personal Information */}
                    <div className="border border-gray-100 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-6 h-6 rounded-lg bg-avaa-primary-light text-avaa-teal flex items-center justify-center text-xs font-bold">1</span>
                            <h4 className="text-sm font-bold text-avaa-dark">Personal Information</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Full Name</p>
                                <p className="text-sm font-semibold text-avaa-dark mt-0.5 [overflow-wrap:anywhere] break-words">{data.full_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Email</p>
                                <p className="text-sm font-semibold text-avaa-dark mt-0.5 [overflow-wrap:anywhere] break-words">{data.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Phone Number</p>
                                <p className="text-sm font-semibold text-avaa-dark mt-0.5 [overflow-wrap:anywhere] break-words">{data.phone || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Location</p>
                                <p className="text-sm font-semibold text-avaa-dark mt-0.5 [overflow-wrap:anywhere] break-words">{data.location || '—'}</p>
                            </div>
                            {data.linkedin_url && (
                                <div className="sm:col-span-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">LinkedIn Url</p>
                                    <p className="text-sm font-semibold text-avaa-dark mt-0.5 [overflow-wrap:anywhere] break-words">{data.linkedin_url}</p>
                                </div>
                            )}
                            {data.portfolio_url && (
                                <div className="sm:col-span-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Portfolio Link</p>
                                    <p className="text-sm font-semibold text-avaa-dark mt-0.5 [overflow-wrap:anywhere] break-words">{data.portfolio_url}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Professional Experience */}
                    <div className="border border-gray-100 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-6 h-6 rounded-lg bg-avaa-primary-light text-avaa-teal flex items-center justify-center text-xs font-bold">2</span>
                            <h4 className="text-sm font-bold text-avaa-dark">Professional Experience</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 min-w-0">
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Current Job Title</p>
                                <p className="text-sm font-semibold text-avaa-dark mt-0.5 whitespace-normal break-all max-w-full">{data.current_job_title || '—'}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Company</p>
                                <p className="text-sm font-semibold text-avaa-dark mt-0.5 whitespace-normal break-all max-w-full">{data.current_company || '—'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Years of Experience</p>
                                <p className="text-sm font-semibold text-avaa-dark mt-0.5 [overflow-wrap:anywhere] break-words">{data.years_of_experience || '—'}</p>
                            </div>
                        </div>

                        {skills.length > 0 && (
                            <div className="mt-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Skills & Expertise</p>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map(s => (
                                        <span key={s} className="px-3 py-1 bg-avaa-primary-light text-avaa-teal text-xs font-semibold rounded-full border border-avaa-primary/20">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.cover_letter && (
                            <div className="mt-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Why are you a good fit?</p>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{data.cover_letter}</p>
                            </div>
                        )}
                    </div>

                    {/* Section 3: Resume */}
                    <div className="border border-gray-100 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-6 h-6 rounded-lg bg-avaa-primary-light text-avaa-teal flex items-center justify-center text-xs font-bold">3</span>
                            <h4 className="text-sm font-bold text-avaa-dark">Resume</h4>
                        </div>
                        {(resumeFile || data.existing_resume) ? (
                            <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3">
                                <div className="w-9 h-9 rounded-xl bg-avaa-primary-light text-avaa-teal flex items-center justify-center flex-shrink-0">
                                    <IcoFile />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-avaa-dark truncate">{resumeName ?? 'Resume'}</p>
                                    {resumeFile && <p className="text-xs text-gray-400">{(resumeFile.size / (1024 * 1024)).toFixed(1)} MB</p>}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No resume attached.</p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button type="button" onClick={back}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <IcoArrowLeft /> Back
                        </button>
                        <button type="button" onClick={handleSubmit} disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                            {processing ? 'Submitting…' : 'Submit'} <IcoArrowRight />
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
