import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { FormEventHandler, useState } from 'react';

/* ── Constants ── */
const EXPERIENCE_LEVELS = [
    'Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years',
];
const COUNTRIES = [
    'Philippines', 'United States', 'United Kingdom', 'Canada',
    'Australia', 'Singapore', 'Japan', 'Germany', 'France', 'Other',
];
const EDUCATION_LEVELS = [
    "High School", "Associate's", "Bachelor's", "Master's", "Doctorate", "Other",
];

/* ── Shared styles ── */
const inputClass =
    'block w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:border-transparent transition-all';
const labelClass =
    'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';
const sectionClass = 'bg-white rounded-2xl border border-gray-200 overflow-hidden';

/* ═══════════════════════════════════════
   Section card
═══════════════════════════════════════ */
function Card({ children }: { children: React.ReactNode }) {
    return <div className={sectionClass}>{children}</div>;
}
function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-avaa-dark">{title}</h3>
            {subtitle && <p className="text-xs text-avaa-muted mt-0.5">{subtitle}</p>}
        </div>
    );
}

/* ═══════════════════════════════════════
   Tag / Chip input for skills & certs
═══════════════════════════════════════ */
function TagInput({
    label,
    items,
    onChange,
    placeholder,
    suggestions,
}: {
    label: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
    suggestions?: string[];
}) {
    const [input, setInput] = useState('');
    const add = (v: string) => {
        const trimmed = v.trim();
        if (trimmed && !items.includes(trimmed)) onChange([...items, trimmed]);
        setInput('');
    };
    return (
        <div>
            <label className={labelClass}>{label}</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {items.map((s) => (
                    <span
                        key={s}
                        className="inline-flex items-center gap-1 bg-avaa-primary-light text-avaa-teal text-xs font-medium px-2.5 py-1.5 rounded-full"
                    >
                        {s}
                        <button
                            type="button"
                            onClick={() => onChange(items.filter((x) => x !== s))}
                            className="hover:text-red-500 ml-0.5"
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            add(input);
                        }
                    }}
                    className={inputClass + ' flex-1'}
                    placeholder={placeholder ?? 'Type and press Enter'}
                />
                <button
                    type="button"
                    onClick={() => add(input)}
                    className="px-3 py-2 bg-avaa-primary text-white text-sm rounded-xl hover:bg-avaa-primary-hover transition-colors"
                >
                    Add
                </button>
            </div>
            {suggestions && suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {suggestions
                        .filter((s) => !items.includes(s))
                        .slice(0, 8)
                        .map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => add(s)}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full hover:bg-avaa-primary-light hover:text-avaa-teal transition-colors"
                            >
                                + {s}
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════
   Types
═══════════════════════════════════════ */
interface ProfileData {
    about: string;
    professional_title: string;
    current_job_title: string;
    current_company: string;
    years_of_experience: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    skills: string[];
    certifications: string[];
    certification_files: File[];
    highest_education: string;
    field_of_study: string;
    institution_name: string;
    portfolio_url: string;
    linkedin_url: string;
    profile_visibility: string;
    [key: string]: any;
}

interface Props {
    user: {
        first_name: string;
        last_name: string;
        email: string;
        phone?: string | null;
    };
    profile: any;
}

/* ═══════════════════════════════════════
   SKILL SUGGESTIONS
═══════════════════════════════════════ */
const SKILL_SUGGESTIONS = [
    'JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'Laravel', 'PHP',
    'Project Management', 'Data Analysis', 'Marketing', 'Sales',
    'Customer Service', 'Graphic Design', 'UI/UX', 'DevOps',
];

/* ═══════════════════════════════════════
   PAGE
═══════════════════════════════════════ */
export default function ProfileEdit({ user, profile }: Props) {
    const p = profile ?? {};

    const { data, setData, post, processing, errors } = useForm<ProfileData>({
        about: p.about ?? '',
        professional_title: p.professional_title ?? '',
        current_job_title: p.current_job_title ?? '',
        current_company: p.current_company ?? '',
        years_of_experience: p.years_of_experience ?? '',
        city: p.city ?? '',
        state: p.state ?? '',
        country: p.country ?? '',
        phone: user.phone ?? '',
        skills: p.skills ?? [],
        certifications: p.certifications ?? [],
        certification_files: [],
        highest_education: p.highest_education ?? '',
        field_of_study: p.field_of_study ?? '',
        institution_name: p.institution_name ?? '',
        portfolio_url: p.portfolio_url ?? '',
        linkedin_url: p.linkedin_url ?? '',
        profile_visibility: p.profile_visibility ?? 'public',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('job-seeker.profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const certificationLabel = (value: string) => value.split('/').pop() || value;
    const certificationLink = (value: string) =>
        value.startsWith('/storage/') || value.startsWith('storage/') || value.startsWith('http://') || value.startsWith('https://')
            ? `/documents/view?path=${encodeURIComponent(value)}`
            : null;

    return (
        <AppLayout pageTitle="Edit Profile" pageSubtitle="Update your professional information" activeNav="Profile">
            <Head title="Edit Profile" />

            <form onSubmit={submit} className="space-y-5">
                {/* Back link */}
                <Link
                    href={route('job-seeker.profile.show')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-avaa-muted hover:text-avaa-teal transition-colors"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to Profile
                </Link>

                {/* ── About You ── */}
                <Card>
                    <CardHeader title="About You" subtitle="Tell employers about yourself." />
                    <div className="p-6 space-y-4">
                        <div>
                            <label className={labelClass}>Professional Title *</label>
                            <input
                                type="text"
                                value={data.professional_title}
                                onChange={(e) => setData('professional_title', e.target.value)}
                                className={inputClass}
                                placeholder="e.g. Full-Stack Developer"
                                required
                            />
                            <InputError message={errors.professional_title} className="mt-1" />
                        </div>
                        <div>
                            <label className={labelClass}>About / Bio</label>
                            <textarea
                                value={data.about}
                                onChange={(e) => setData('about', e.target.value)}
                                rows={4}
                                className={inputClass + ' resize-none'}
                                placeholder="Write a brief summary about yourself, your experience, and what you're looking for..."
                                maxLength={2000}
                            />
                            <p className="text-[10px] text-gray-400 mt-1 text-right">
                                {data.about.length}/2000
                            </p>
                            <InputError message={errors.about} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Current Job Title</label>
                                <input
                                    type="text"
                                    value={data.current_job_title}
                                    onChange={(e) => setData('current_job_title', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Senior Developer"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Current Company</label>
                                <input
                                    type="text"
                                    value={data.current_company}
                                    onChange={(e) => setData('current_company', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Tech Corp"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Years of Experience *</label>
                            <select
                                value={data.years_of_experience}
                                onChange={(e) => setData('years_of_experience', e.target.value)}
                                className={inputClass}
                                required
                            >
                                <option value="">Select…</option>
                                {EXPERIENCE_LEVELS.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                            <InputError message={errors.years_of_experience} className="mt-1" />
                        </div>
                    </div>
                </Card>

                {/* ── Location ── */}
                <Card>
                    <CardHeader title="Location" subtitle="Where are you based?" />
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>City *</label>
                                <input
                                    type="text"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={errors.city} className="mt-1" />
                            </div>
                            <div>
                                <label className={labelClass}>State / Province</label>
                                <input
                                    type="text"
                                    value={data.state}
                                    onChange={(e) => setData('state', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Country *</label>
                                <select
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value)}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Select…</option>
                                    {COUNTRIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <InputError message={errors.country} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Phone Number</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className={inputClass}
                                placeholder="+1 234 567 8900"
                            />
                            <InputError message={errors.phone} className="mt-1" />
                        </div>
                    </div>
                </Card>

                {/* ── Skills ── */}
                <Card>
                    <CardHeader title="Skills" subtitle="Add your key skills and competencies." />
                    <div className="p-6">
                        <TagInput
                            label="Skills"
                            items={data.skills}
                            onChange={(v) => setData('skills', v)}
                            placeholder="Type a skill and press Enter"
                            suggestions={SKILL_SUGGESTIONS}
                        />
                        <InputError message={errors.skills} className="mt-1" />
                    </div>
                </Card>

                {/* ── Education ── */}
                <Card>
                    <CardHeader title="Education" subtitle="Your educational background." />
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Highest Education</label>
                                <select
                                    value={data.highest_education}
                                    onChange={(e) => setData('highest_education', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Select…</option>
                                    {EDUCATION_LEVELS.map((l) => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Field of Study</label>
                                <input
                                    type="text"
                                    value={data.field_of_study}
                                    onChange={(e) => setData('field_of_study', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Computer Science"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Institution Name</label>
                            <input
                                type="text"
                                value={data.institution_name}
                                onChange={(e) => setData('institution_name', e.target.value)}
                                className={inputClass}
                                placeholder="e.g. University of the Philippines"
                            />
                        </div>
                    </div>
                </Card>

                {/* ── Certifications ── */}
                <Card>
                    <CardHeader title="Certifications" subtitle="Add your professional certifications." />
                    <div className="p-6">
                        <label className={labelClass}>Certifications</label>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                            className={inputClass}
                            onChange={(e) => {
                                const files = e.target.files ? Array.from(e.target.files) : [];
                                setData('certification_files', [...data.certification_files, ...files]);
                            }}
                        />
                        <InputError message={errors.certification_files} className="mt-1" />
                        <InputError message={errors.certifications} className="mt-1" />

                        {(data.certifications.length > 0 || data.certification_files.length > 0) && (
                            <div className="mt-3 space-y-2">
                                {data.certifications.map((cert, index) => {
                                    const href = certificationLink(cert);

                                    return (
                                        <div key={`existing-${index}`} className="flex items-center justify-between gap-2 text-xs text-avaa-muted">
                                            <div className="truncate">
                                                {href ? (
                                                    <a href={href} target="_blank" rel="noreferrer" className="hover:underline text-avaa-teal">
                                                        {certificationLabel(cert)}
                                                    </a>
                                                ) : (
                                                    certificationLabel(cert)
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setData('certifications', data.certifications.filter((_, i) => i !== index))}
                                                className="text-avaa-muted hover:text-red-500"
                                                aria-label="Remove certification"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}

                                {data.certification_files.map((file, index) => (
                                    <div key={`new-${index}`} className="flex items-center justify-between gap-2 text-xs text-avaa-muted">
                                        <div className="truncate">{file.name}</div>
                                        <button
                                            type="button"
                                            onClick={() => setData('certification_files', data.certification_files.filter((_, i) => i !== index))}
                                            className="text-avaa-muted hover:text-red-500"
                                            aria-label="Remove certification file"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>



                {/* ── Links ── */}
                <Card>
                    <CardHeader title="Links" subtitle="Add your professional links." />
                    <div className="p-6 space-y-4">
                        <div>
                            <label className={labelClass}>LinkedIn URL</label>
                            <input
                                type="url"
                                value={data.linkedin_url}
                                onChange={(e) => setData('linkedin_url', e.target.value)}
                                className={inputClass}
                                placeholder="https://linkedin.com/in/yourname"
                            />
                            <InputError message={errors.linkedin_url} className="mt-1" />
                        </div>
                        <div>
                            <label className={labelClass}>Portfolio URL</label>
                            <input
                                type="url"
                                value={data.portfolio_url}
                                onChange={(e) => setData('portfolio_url', e.target.value)}
                                className={inputClass}
                                placeholder="https://yourportfolio.com"
                            />
                            <InputError message={errors.portfolio_url} className="mt-1" />
                        </div>
                    </div>
                </Card>

                {/* ── Privacy ── */}
                <Card>
                    <CardHeader title="Privacy" subtitle="Control who can see your profile." />
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-avaa-dark">Profile Visibility</p>
                                <p className="text-xs text-avaa-muted mt-0.5">
                                    {data.profile_visibility === 'public'
                                        ? 'Your profile is visible to employers.'
                                        : 'Your profile is hidden from employers.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={data.profile_visibility === 'public'}
                                onClick={() =>
                                    setData(
                                        'profile_visibility',
                                        data.profile_visibility === 'public' ? 'private' : 'public'
                                    )
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:ring-offset-2 cursor-pointer flex-shrink-0
                                    ${data.profile_visibility === 'public' ? 'bg-avaa-primary' : 'bg-gray-200'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
                                        ${data.profile_visibility === 'public' ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>
                </Card>

                {/* ── Submit bar ── */}
                <div className="flex items-center justify-between gap-3 pt-2">
                    <Link
                        href={route('job-seeker.profile.show')}
                        className="text-sm text-avaa-muted hover:text-avaa-dark transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {processing ? (
                            <>
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Saving…
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
