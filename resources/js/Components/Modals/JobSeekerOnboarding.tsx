import { useState, useRef, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

const EXPERIENCE_LEVELS = [
    'Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years',
];
const COUNTRIES = [
    'Philippines', 'United States', 'United Kingdom', 'Canada',
    'Australia', 'Singapore', 'Japan', 'Germany', 'France', 'Other',
];
const SKILL_SUGGESTIONS = [
    'JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'Laravel', 'PHP',
    'Project Management', 'Data Analysis', 'Marketing', 'Sales',
    'Customer Service', 'Graphic Design', 'UI/UX', 'DevOps',
];

/* ── Shared styles aligned with system palette ── */
const inputClass =
    'mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:border-transparent transition-all';
const inputErrorClass =
    'mt-1 block w-full rounded-xl border border-red-400 bg-red-50 text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all';
const labelClass = 'block text-sm font-medium text-gray-700';

function SkillInput({ skills, onChange }: { skills: string[]; onChange: (skills: string[]) => void }) {
    const [input, setInput] = useState('');
    const add = (skill: string) => {
        const trimmed = skill.trim();
        if (trimmed && !skills.includes(trimmed)) onChange([...skills, trimmed]);
        setInput('');
    };
    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {skills.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 bg-avaa-primary-light text-avaa-teal text-xs px-2.5 py-1 rounded-full font-medium">
                        {s}
                        <button type="button" onClick={() => onChange(skills.filter(x => x !== s))} className="hover:text-red-500 ml-0.5">×</button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(input); } }}
                    placeholder="Type a skill and press Enter"
                    className={inputClass + ' flex-1'}
                />
                <button type="button" onClick={() => add(input)}
                    className="px-4 py-2.5 bg-avaa-primary text-white text-sm rounded-xl hover:bg-avaa-primary-hover transition-colors font-medium">
                    Add
                </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
                {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
                    <button key={s} type="button" onClick={() => add(s)}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full hover:bg-avaa-primary-light hover:text-avaa-teal transition-colors">
                        + {s}
                    </button>
                ))}
            </div>
        </div>
    );
}

function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
    return (
        <div className="flex items-center justify-center mb-8">
            {labels.map((label, i) => (
                <div key={i} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                            i + 1 < current  ? 'bg-avaa-primary text-white shadow-sm' :
                            i + 1 === current ? 'bg-avaa-primary text-white ring-4 ring-avaa-primary/20 shadow-md' :
                            'bg-gray-100 text-gray-400'
                        }`}>
                            {i + 1 < current ? '✓' : i + 1}
                        </div>
                        <span className={`text-xs mt-1.5 font-medium ${i + 1 === current ? 'text-avaa-teal' : 'text-gray-400'}`}>
                            {label}
                        </span>
                    </div>
                    {i < total - 1 && (
                        <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-4 rounded-full transition-colors ${i + 1 < current ? 'bg-avaa-primary' : 'bg-gray-200'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export default function JobSeekerOnboarding() {
    const [step, setStep] = useState(1);
    const [resumeName, setResumeName] = useState('');
    const [showValidationError, setShowValidationError] = useState(false);
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
    const resumeRef = useRef<HTMLInputElement>(null);
    const totalSteps = 2;

    const { data, setData, post, processing, errors } = useForm<any>({
        professional_title: '',
        city: '',
        state: '',
        country: '',
        years_of_experience: '',
        skills: [],
        resume: null,
    });

    /* ── Field error helpers ── */
    const requiredStep1 = ['professional_title', 'city', 'country', 'years_of_experience'] as const;

    const isFieldEmpty = (field: string) => !data[field] || data[field].toString().trim() === '';

    const getFieldClass = (field: string) => {
        if (showValidationError && isFieldEmpty(field)) return inputErrorClass;
        return inputClass;
    };

    const validateStep = (s: number) => {
        if (s === 1) return requiredStep1.every(f => !isFieldEmpty(f));
        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setShowValidationError(false);
            setStep(s => s + 1);
        } else {
            setShowValidationError(true);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('job-seeker.profile.complete'), {
            forceFormData: true,
            onError: (errors) => {
                console.error('Profile submission errors:', errors);
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
                <div className="p-6 sm:p-10">

                    {/* Header */}
                    <div className="text-center mb-8">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-2xl bg-avaa-primary-light flex items-center justify-center mx-auto mb-4 text-avaa-teal">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-extrabold text-avaa-dark">Complete Your Profile</h2>
                        <p className="text-sm text-avaa-muted mt-1">Just a few essentials to get you started</p>
                    </div>

                    <StepIndicator current={step} total={totalSteps} labels={['About You', 'Skills & Resume']} />

                    <form onSubmit={submit}>
                        {/* ── Step 1: About You ── */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <h3 className="font-bold text-avaa-dark text-base border-b border-gray-100 pb-3">About You</h3>

                                {/* Validation banner */}
                                {showValidationError && (
                                    <div className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-xl p-4 text-sm text-red-700">
                                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span>
                                            Please fill in all <strong>required fields</strong> marked with * before continuing.
                                        </span>
                                    </div>
                                )}

                                {/* Professional Title */}
                                <div>
                                    <label className={labelClass}>
                                        Professional Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.professional_title}
                                        onChange={e => setData('professional_title', e.target.value)}
                                        className={getFieldClass('professional_title')}
                                        placeholder="e.g. Software Engineer, Marketing Manager"
                                        required
                                    />
                                    {showValidationError && isFieldEmpty('professional_title') && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            Professional title is required.
                                        </p>
                                    )}
                                    <InputError message={errors.professional_title} className="mt-1" />
                                </div>

                                {/* City + State */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>City <span className="text-red-500">*</span></label>
                                        <input type="text" value={data.city} onChange={e => setData('city', e.target.value)}
                                            className={getFieldClass('city')} placeholder="e.g. Manila" required />
                                        {showValidationError && isFieldEmpty('city') && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                City is required.
                                            </p>
                                        )}
                                        <InputError message={errors.city} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>State / Province</label>
                                        <input type="text" value={data.state} onChange={e => setData('state', e.target.value)}
                                            className={inputClass} placeholder="e.g. Metro Manila" />
                                        <InputError message={errors.state} className="mt-1" />
                                    </div>
                                </div>

                                {/* Country + Experience */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Country <span className="text-red-500">*</span></label>
                                        <select value={data.country} onChange={e => setData('country', e.target.value)}
                                            className={getFieldClass('country')} required>
                                            <option value="">Select country</option>
                                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        {showValidationError && isFieldEmpty('country') && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                Please select a country.
                                            </p>
                                        )}
                                        <InputError message={errors.country} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Experience <span className="text-red-500">*</span></label>
                                        <select value={data.years_of_experience} onChange={e => setData('years_of_experience', e.target.value)}
                                            className={getFieldClass('years_of_experience')} required>
                                            <option value="">Select level</option>
                                            {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                        {showValidationError && isFieldEmpty('years_of_experience') && (
                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                Please select your experience level.
                                            </p>
                                        )}
                                        <InputError message={errors.years_of_experience} className="mt-1" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Skills & Resume (optional) ── */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <h3 className="font-bold text-avaa-dark text-base border-b border-gray-100 pb-3">Skills & Resume</h3>

                                {/* Optional notice */}
                                <div className="flex items-start gap-3 bg-avaa-primary-light border border-avaa-primary/20 rounded-xl p-4 text-sm text-avaa-teal">
                                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>These fields are <strong>optional</strong> — you can skip and add them later from your profile page.</span>
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className={labelClass}>Key Skills <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <div className="mt-2">
                                        <SkillInput skills={data.skills} onChange={v => setData('skills', v)} />
                                    </div>
                                    <InputError message={errors.skills} className="mt-1" />
                                </div>

                                {/* Resume */}
                                <div>
                                    <label className={labelClass}>
                                        Resume <span className="text-gray-400 font-normal">(optional · PDF, DOC, DOCX — max 10MB)</span>
                                    </label>
                                    <div
                                        onClick={() => resumeRef.current?.click()}
                                        className="mt-2 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-avaa-primary/40 hover:bg-avaa-primary-light/30 transition-colors"
                                    >
                                        {resumeName ? (
                                            <div className="flex items-center justify-center gap-2 text-avaa-teal">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm font-medium">{resumeName}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="text-sm text-gray-500">Click to upload your resume</p>
                                                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        ref={resumeRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) { setData('resume', file); setResumeName(file.name); }
                                        }}
                                    />
                                    <InputError message={errors.resume} className="mt-1" />
                                </div>

                                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <span>You can add more details like education, certifications, and links from your profile page later.</span>
                                </div>
                            </div>
                        )}

                        {/* ── Navigation ── */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                            {step > 1
                                ? <button type="button" onClick={() => setStep(s => s - 1)}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                    ← Back
                                  </button>
                                : <div />
                            }
                            {step < totalSteps
                                ? <button type="button" onClick={nextStep}
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-avaa-primary hover:bg-avaa-primary-hover rounded-xl transition-colors shadow-sm">
                                    Continue →
                                  </button>
                                : <div className="flex items-center gap-3">
                                    <button type="submit" disabled={processing}
                                        className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50">
                                        {processing ? 'Saving...' : 'Skip for now'}
                                    </button>
                                    <button type="submit" disabled={processing}
                                        className="px-6 py-2.5 text-sm font-semibold text-white bg-avaa-primary hover:bg-avaa-primary-hover disabled:opacity-50 rounded-xl transition-colors shadow-sm">
                                        {processing ? 'Saving...' : 'Complete Profile'}
                                    </button>
                                  </div>
                            }
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}