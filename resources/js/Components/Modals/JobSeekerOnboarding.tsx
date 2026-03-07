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
                    <span key={s} className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs px-2.5 py-1 rounded-full">
                        {s}
                        <button type="button" onClick={() => onChange(skills.filter(x => x !== s))} className="hover:text-emerald-900">×</button>
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
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button type="button" onClick={() => add(input)} className="px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">Add</button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
                {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
                    <button key={s} type="button" onClick={() => add(s)}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            i + 1 < current ? 'bg-emerald-600 text-white' :
                            i + 1 === current ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-900' :
                            'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                            {i + 1 < current ? '✓' : i + 1}
                        </div>
                        <span className={`text-xs mt-1 ${i + 1 === current ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-400'}`}>
                            {label}
                        </span>
                    </div>
                    {i < total - 1 && (
                        <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-4 ${i + 1 < current ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export default function JobSeekerOnboarding() {
    const [step, setStep] = useState(1);
    const [resumeName, setResumeName] = useState('');
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

    const inputClass = "mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    // Step 1: require the basics. Step 2: everything is optional now.
    const validateStep = (s: number) => {
        if (s === 1) return !!(data.professional_title && data.city && data.country && data.years_of_experience);
        return true; // step 2 is fully optional — user can skip
    };

    const nextStep = () => { if (validateStep(step)) setStep(s => s + 1); };

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
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Just a few essentials to get you started</p>
                    </div>

                    <StepIndicator current={step} total={totalSteps} labels={['About You', 'Skills & Resume']} />

                    <form onSubmit={submit}>
                        {/* ── Step 1: About You ── */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200">About You</h3>

                                <div>
                                    <label className={labelClass}>Professional Title *</label>
                                    <input
                                        type="text"
                                        value={data.professional_title}
                                        onChange={e => setData('professional_title', e.target.value)}
                                        className={inputClass}
                                        placeholder="e.g. Software Engineer, Marketing Manager"
                                        required
                                    />
                                    <InputError message={errors.professional_title} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>City *</label>
                                        <input type="text" value={data.city} onChange={e => setData('city', e.target.value)} className={inputClass} required />
                                        <InputError message={errors.city} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>State / Province</label>
                                        <input type="text" value={data.state} onChange={e => setData('state', e.target.value)} className={inputClass} />
                                        <InputError message={errors.state} className="mt-1" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Country *</label>
                                        <select value={data.country} onChange={e => setData('country', e.target.value)} className={inputClass} required>
                                            <option value="">Select country</option>
                                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <InputError message={errors.country} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Experience *</label>
                                        <select value={data.years_of_experience} onChange={e => setData('years_of_experience', e.target.value)} className={inputClass} required>
                                            <option value="">Select level</option>
                                            {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                        <InputError message={errors.years_of_experience} className="mt-1" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Skills & Resume (optional) ── */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Skills & Resume</h3>

                                {/* Optional notice */}
                                <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-3 text-sm text-emerald-700 dark:text-emerald-300">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>These fields are <strong>optional</strong> — you can skip and add them later from your profile page.</span>
                                </div>

                                <div>
                                    <label className={labelClass}>Key Skills <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <div className="mt-2">
                                        <SkillInput skills={data.skills} onChange={v => setData('skills', v)} />
                                    </div>
                                    <InputError message={errors.skills} className="mt-1" />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Resume <span className="text-gray-400 font-normal">(optional · PDF, DOC, DOCX — max 10MB)</span>
                                    </label>
                                    <div
                                        onClick={() => resumeRef.current?.click()}
                                        className="mt-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 transition-colors"
                                    >
                                        {resumeName ? (
                                            <div className="flex items-center justify-center gap-2 text-emerald-600">
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

                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
                                    💡 You can add more details like education, certifications, salary preferences, and links from your profile page later.
                                </div>
                            </div>
                        )}

                        {/* ── Navigation ── */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            {step > 1
                                ? <button type="button" onClick={() => setStep(s => s - 1)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-lg transition-colors">
                                    ← Back
                                  </button>
                                : <div />
                            }
                            {step < totalSteps
                                ? <button type="button" onClick={nextStep}
                                    className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
                                    Continue →
                                  </button>
                                : <div className="flex items-center gap-3">
                                    {/* Allow skipping step 2 entirely */}
                                    <button type="submit" disabled={processing}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50">
                                        {processing ? 'Saving...' : 'Skip for now'}
                                    </button>
                                    <button type="submit" disabled={processing}
                                        className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors">
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