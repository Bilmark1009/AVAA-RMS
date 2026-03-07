import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { useState, useRef, useCallback } from 'react';

/* ── Types ── */
interface JobSeekerProfile {
    professional_title?: string;
    city?: string;
    state?: string;
    country?: string;
    years_of_experience?: string;
    current_job_title?: string;
    current_company?: string;
    skills?: string[];
    resume_path?: string;
    portfolio_url?: string;
    linkedin_url?: string;
    highest_education?: string;
    field_of_study?: string;
    institution_name?: string;
    certifications?: string[];
    desired_job_types?: string[];
    desired_industries?: string[];
    expected_salary_min?: number;
    expected_salary_max?: number;
    salary_currency?: string;
    willing_to_relocate?: boolean;
    profile_visibility?: string;
    profile_completeness?: number;
    employment_type_preference?: string[];
}

interface Props {
    user: { name: string; email: string; role: string; phone?: string | null; google_id?: string | null; avatar?: string };
    profile: JobSeekerProfile | null;
}

/* ── Constants ── */
const SKILL_SUGGESTIONS = [
    'JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'Laravel', 'PHP',
    'Project Management', 'Data Analysis', 'Marketing', 'Sales',
    'Customer Service', 'Graphic Design', 'UI/UX', 'DevOps', 'SQL', 'Excel',
];
const COUNTRIES = ['Philippines', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'Japan', 'Germany', 'France', 'Other'];
const EXPERIENCE_LEVELS = ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'];
const EDUCATION_LEVELS = ['High School', "Associate Degree", "Bachelor's Degree", "Master's Degree", 'PhD', 'Vocational/Technical', 'Other'];
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Remote'];
const INDUSTRIES = ['Information Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Marketing', 'Legal', 'Other'];
const CURRENCIES = ['USD', 'PHP', 'EUR', 'GBP', 'SGD', 'AUD'];

/* ── Shared styles ── */
const inputClass = "block w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:border-transparent transition-all";
const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

/* ── Skill Input ── */
function SkillInput({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
    const [input, setInput] = useState('');
    const add = (s: string) => {
        const t = s.trim();
        if (t && !skills.includes(t)) onChange([...skills, t]);
        setInput('');
    };
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 bg-avaa-primary-light text-avaa-teal text-xs px-3 py-1.5 rounded-full font-medium">
                        {s}
                        <button type="button" onClick={() => onChange(skills.filter(x => x !== s))}
                            className="ml-1 w-3.5 h-3.5 rounded-full bg-avaa-teal/20 hover:bg-avaa-teal/40 flex items-center justify-center text-avaa-teal transition-colors">×</button>
                    </span>
                ))}
                {skills.length === 0 && <p className="text-xs text-gray-400 italic">No skills added yet</p>}
            </div>
            <div className="flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(input); } }}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:border-transparent" />
                <button type="button" onClick={() => add(input)}
                    className="px-4 py-2 bg-avaa-primary text-white text-sm rounded-xl hover:bg-avaa-primary-hover transition-colors font-medium">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                    <button key={s} type="button" onClick={() => add(s)}
                        className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full hover:bg-avaa-primary-light hover:text-avaa-teal transition-colors">
                        + {s}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ── Chip Select ── */
function ChipSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
    const toggle = (v: string) => selected.includes(v) ? onChange(selected.filter(x => x !== v)) : onChange([...selected, v]);
    return (
        <div className="flex flex-wrap gap-2">
            {options.map(o => (
                <button key={o} type="button" onClick={() => toggle(o)}
                    className={`text-sm px-3 py-1.5 rounded-xl border font-medium transition-all ${selected.includes(o)
                        ? 'bg-avaa-primary text-white border-avaa-primary'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-avaa-primary hover:text-avaa-teal'}`}>
                    {o}
                </button>
            ))}
        </div>
    );
}

/* ── Cert Input ── */
function CertInput({ certs, onChange }: { certs: string[]; onChange: (c: string[]) => void }) {
    const [input, setInput] = useState('');
    const add = () => { const t = input.trim(); if (t && !certs.includes(t)) onChange([...certs, t]); setInput(''); };
    return (
        <div className="space-y-3">
            <div className="space-y-2">
                {certs.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-avaa-primary-light flex items-center justify-center text-avaa-teal flex-shrink-0">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                            </div>
                            <span className="text-sm text-avaa-dark font-medium">{c}</span>
                        </div>
                        <button type="button" onClick={() => onChange(certs.filter((_, j) => j !== i))}
                            className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none">×</button>
                    </div>
                ))}
                {certs.length === 0 && <p className="text-xs text-gray-400 italic">No certifications added yet</p>}
            </div>
            <div className="flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-avaa-primary" />
                <button type="button" onClick={add} className="px-4 py-2 bg-avaa-primary text-white text-sm rounded-xl hover:bg-avaa-primary-hover transition-colors">Add</button>
            </div>
        </div>
    );
}

/* ── Icons ── */
const IcoUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IcoBag = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>;
const IcoGrad = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>;
const IcoStar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const IcoMoney = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>;
const IcoLink = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>;
const IcoSettings = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" /></svg>;
const IcoDoc = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
const IcoPencil = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const IcoCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;

/* ── Section Card with inline edit ── */
interface SectionCardProps {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    isEmpty?: boolean;
    emptyText?: string;
    summary: React.ReactNode;
    editForm: React.ReactNode;
    onSave: () => void;
    onCancel: () => void;
    isEditing: boolean;
    setEditing: (v: boolean) => void;
    saving?: boolean;
    savedFlash?: boolean;
}

function SectionCard({
    title, subtitle, icon, isEmpty, emptyText,
    summary, editForm, onSave, onCancel,
    isEditing, setEditing, saving, savedFlash
}: SectionCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-avaa-primary-light flex items-center justify-center text-avaa-teal flex-shrink-0">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-avaa-dark">{title}</h3>
                        {subtitle && <p className="text-xs text-avaa-muted">{subtitle}</p>}
                    </div>
                </div>
                {!isEditing && (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-500 hover:border-avaa-primary hover:text-avaa-teal transition-colors">
                        <IcoPencil />
                        {isEmpty ? 'Add' : 'Edit'}
                    </button>
                )}
            </div>

            <div className="p-6">
                {isEditing ? (
                    <div className="space-y-5">
                        {editForm}
                        {/* Per-section action bar */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                            {savedFlash && (
                                <span className="text-xs text-avaa-teal font-medium flex items-center gap-1">
                                    <IcoCheck /> Saved
                                </span>
                            )}
                            <button type="button" onClick={onCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-avaa-dark transition-colors rounded-xl hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="button" onClick={onSave} disabled={saving}
                                className="px-5 py-2 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                                {saving ? (
                                    <>
                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Saving…
                                    </>
                                ) : 'Save'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {isEmpty ? (
                            <p className="text-sm text-gray-400 italic">{emptyText ?? 'Not filled in yet — click Edit to add.'}</p>
                        ) : summary}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Read-only display helpers ── */
const Field = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
        <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <p className="text-sm text-avaa-dark mt-0.5">{value}</p>
        </div>
    ) : null;

const TagList = ({ items }: { items: string[] }) => (
    <div className="flex flex-wrap gap-1.5">
        {items.map(i => (
            <span key={i} className="text-xs bg-avaa-primary-light text-avaa-teal px-2.5 py-1 rounded-full font-medium">{i}</span>
        ))}
    </div>
);

/* ── Hook: per-section save ── */
function useSectionSave(fields: Record<string, any>, profile: JobSeekerProfile | null) {
    const [saving, setSaving] = useState(false);
    const [savedFlash, setSavedFlash] = useState(false);

    const save = useCallback((onSuccess?: () => void) => {
        setSaving(true);
        router.patch(route('job-seeker.profile.update'), fields, {
            preserveScroll: true,
            onSuccess: () => {
                setSaving(false);
                setSavedFlash(true);
                setTimeout(() => setSavedFlash(false), 2500);
                onSuccess?.();
            },
            onError: () => setSaving(false),
        });
    }, [fields]);

    return { saving, savedFlash, save };
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function JobSeekerProfilePage({ user, profile }: Props) {
    const completeness = profile?.profile_completeness ?? 0;
    const resumeRef = useRef<HTMLInputElement>(null);

    // Track which section is open for editing
    const [editing, setEditing] = useState<string | null>(null);
    const isEditing = (s: string) => editing === s;
    const openEdit = (s: string) => setEditing(s);
    const closeEdit = () => setEditing(null);

    // ── Local state per section ──
    const [basic, setBasic] = useState({
        professional_title: profile?.professional_title ?? '',
        city: profile?.city ?? '',
        state: profile?.state ?? '',
        country: profile?.country ?? '',
        years_of_experience: profile?.years_of_experience ?? '',
        current_job_title: profile?.current_job_title ?? '',
        current_company: profile?.current_company ?? '',
        willing_to_relocate: profile?.willing_to_relocate ?? false,
        phone: user.phone ?? '',
    });

    const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);

    const [education, setEducation] = useState({
        highest_education: profile?.highest_education ?? '',
        field_of_study: profile?.field_of_study ?? '',
        institution_name: profile?.institution_name ?? '',
    });

    const [certs, setCerts] = useState<string[]>(profile?.certifications ?? []);

    const [jobPrefs, setJobPrefs] = useState({
        employment_type_preference: profile?.employment_type_preference ?? [],
        desired_industries: profile?.desired_industries ?? [],
    });

    const [salary, setSalary] = useState({
        expected_salary_min: profile?.expected_salary_min ?? '',
        expected_salary_max: profile?.expected_salary_max ?? '',
        salary_currency: profile?.salary_currency ?? 'USD',
    });

    const [links, setLinks] = useState({
        linkedin_url: profile?.linkedin_url ?? '',
        portfolio_url: profile?.portfolio_url ?? '',
    });

    const [privacy, setPrivacy] = useState({
        profile_visibility: profile?.profile_visibility ?? 'public',
    });

    const [resume, setResume] = useState<File | null>(null);
    const [resumeName, setResumeName] = useState('');

    // Snapshot refs for cancel
    const snap = useRef<any>({});
    const openSection = (key: string, snapshot: any) => {
        snap.current[key] = snapshot;
        openEdit(key);
    };
    const cancelSection = (key: string, restore: () => void) => {
        restore();
        closeEdit();
    };

    // ── Save helpers ──
    const [sectionSaving, setSectionSaving] = useState<string | null>(null);
    const [sectionFlash, setSectionFlash] = useState<string | null>(null);

    const saveSection = (key: string, fields: Record<string, any>, extra?: { forceFormData?: boolean; file?: File | null }) => {
        setSectionSaving(key);
        const payload: any = { ...fields, _method: 'PATCH' };

        if (extra?.file) {
            // use FormData for file upload
            const fd = new FormData();
            Object.entries(payload).forEach(([k, v]) => {
                if (Array.isArray(v)) v.forEach(item => fd.append(`${k}[]`, item));
                else fd.append(k, v as any);
            });
            fd.append('resume', extra.file);
            router.post(route('job-seeker.profile.update'), fd, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => { setSectionSaving(null); flash(key); closeEdit(); },
                onError: () => setSectionSaving(null),
            });
        } else {
            router.patch(route('job-seeker.profile.update'), fields, {
                preserveScroll: true,
                onSuccess: () => { setSectionSaving(null); flash(key); closeEdit(); },
                onError: () => setSectionSaving(null),
            });
        }
    };

    const flash = (key: string) => {
        setSectionFlash(key);
        setTimeout(() => setSectionFlash(null), 2500);
    };

    const initials = user.name.trim().split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

    /* ────────────────────────────────────────── */
    return (
        <AppLayout pageTitle="My Profile" pageSubtitle="Click any section to edit" activeNav="Profile">
            <Head title="My Profile" />

            <div className="space-y-5">

                {/* ── Hero / Cover card (non-editable shell) ── */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="h-28 bg-gradient-to-r from-avaa-primary/80 via-avaa-teal to-emerald-400 relative">
                        <div className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    </div>
                    <div className="px-6 pb-6">
                        <div className="flex items-end justify-between -mt-10 mb-4">
                            <div className="relative">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl ring-4 ring-white object-cover shadow-md" />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl ring-4 ring-white bg-avaa-dark flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                        {initials}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center">
                                    <svg viewBox="0 0 20 20" className="w-5 h-5 -rotate-90">
                                        <circle cx="10" cy="10" r="8" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                                        <circle cx="10" cy="10" r="8" fill="none" stroke="#0d9488" strokeWidth="2.5"
                                            strokeDasharray={`${(completeness / 100) * 50.3} 50.3`} strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${privacy.profile_visibility === 'public' ? 'bg-avaa-primary-light text-avaa-teal' : 'bg-gray-100 text-gray-500'}`}>
                                    {privacy.profile_visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                                </span>
                                <a href={route('profile.edit')}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-avaa-primary hover:text-avaa-teal transition-colors">
                                    <IcoPencil /> Account Settings
                                </a>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-avaa-dark">{user.name}</h2>
                            <p className="text-sm text-avaa-teal font-medium">{basic.professional_title || <span className="text-gray-400 italic">No title yet</span>}</p>
                            <p className="text-xs text-avaa-muted mt-0.5">
                                {[basic.city, basic.country].filter(Boolean).join(', ') || 'No location set'}
                                {basic.current_company && ` · ${basic.current_company}`}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-avaa-dark">Profile Strength</span>
                                <span className="text-xs font-bold text-avaa-teal">{completeness}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                <div className="h-full rounded-full bg-avaa-primary transition-all duration-700" style={{ width: `${completeness}%` }} />
                            </div>
                            <p className="text-[10px] text-avaa-muted mt-1">
                                {completeness === 100 ? '🎉 Your profile is complete!' : 'Click any section below to fill it in and increase your score.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Basic Information ── */}
                <SectionCard
                    title="Basic Information" subtitle="Your professional identity" icon={<IcoUser />}
                    isEmpty={!basic.professional_title && !basic.city}
                    emptyText="Add your title, location, and contact details."
                    isEditing={isEditing('basic')}
                    setEditing={v => v ? openSection('basic', { ...basic }) : cancelSection('basic', () => setBasic(snap.current.basic))}
                    saving={sectionSaving === 'basic'} savedFlash={sectionFlash === 'basic'}
                    onSave={() => saveSection('basic', basic)}
                    onCancel={() => cancelSection('basic', () => setBasic(snap.current.basic))}
                    summary={
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <Field label="Professional Title" value={basic.professional_title} />
                            <Field label="Current Job Title" value={basic.current_job_title} />
                            <Field label="Current Company" value={basic.current_company} />
                            <Field label="Location" value={[basic.city, basic.state, basic.country].filter(Boolean).join(', ')} />
                            <Field label="Experience" value={basic.years_of_experience} />
                            <Field label="Phone" value={basic.phone} />
                            <Field label="Willing to Relocate" value={basic.willing_to_relocate ? 'Yes' : 'No'} />
                        </div>
                    }
                    editForm={
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Professional Title</label>
                                <input type="text" value={basic.professional_title} onChange={e => setBasic(b => ({ ...b, professional_title: e.target.value }))}
                                    className={inputClass} placeholder="e.g. Senior Software Engineer" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Current Job Title</label>
                                    <input type="text" value={basic.current_job_title} onChange={e => setBasic(b => ({ ...b, current_job_title: e.target.value }))}
                                        className={inputClass} placeholder="e.g. Frontend Developer" />
                                </div>
                                <div>
                                    <label className={labelClass}>Current Company</label>
                                    <input type="text" value={basic.current_company} onChange={e => setBasic(b => ({ ...b, current_company: e.target.value }))}
                                        className={inputClass} placeholder="e.g. Acme Corp" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>City</label>
                                    <input type="text" value={basic.city} onChange={e => setBasic(b => ({ ...b, city: e.target.value }))} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>State / Province</label>
                                    <input type="text" value={basic.state} onChange={e => setBasic(b => ({ ...b, state: e.target.value }))} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Country</label>
                                    <select value={basic.country} onChange={e => setBasic(b => ({ ...b, country: e.target.value }))} className={inputClass}>
                                        <option value="">Select country</option>
                                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Years of Experience</label>
                                    <select value={basic.years_of_experience} onChange={e => setBasic(b => ({ ...b, years_of_experience: e.target.value }))} className={inputClass}>
                                        <option value="">Select level</option>
                                        {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Willing to Relocate</label>
                                    <div className="flex gap-3 mt-2">
                                        {[['Yes', true], ['No', false]].map(([label, val]) => (
                                            <label key={String(label)} className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="willing_to_relocate" checked={basic.willing_to_relocate === val}
                                                    onChange={() => setBasic(b => ({ ...b, willing_to_relocate: val as boolean }))} className="accent-avaa-primary" />
                                                <span className="text-sm text-gray-700">{String(label)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <input type="tel" value={basic.phone} onChange={e => setBasic(b => ({ ...b, phone: e.target.value }))}
                                    className={inputClass} placeholder="+63 912 345 6789" />
                                <p className="mt-1 text-xs text-gray-400">Include country code, e.g. +63 for Philippines</p>
                            </div>
                        </div>
                    }
                />

                {/* ── Skills ── */}
                <SectionCard
                    title="Skills" subtitle="Showcase your technical and soft skills" icon={<IcoStar />}
                    isEmpty={skills.length === 0} emptyText="Add your key skills to get discovered by employers."
                    isEditing={isEditing('skills')}
                    setEditing={v => v ? openSection('skills', [...skills]) : cancelSection('skills', () => setSkills(snap.current.skills))}
                    saving={sectionSaving === 'skills'} savedFlash={sectionFlash === 'skills'}
                    onSave={() => saveSection('skills', { skills })}
                    onCancel={() => cancelSection('skills', () => setSkills(snap.current.skills))}
                    summary={skills.length > 0 ? <TagList items={skills} /> : <></>}
                    editForm={<SkillInput skills={skills} onChange={setSkills} />}
                />

                {/* ── Resume ── */}
                <SectionCard
                    title="Resume" subtitle="Upload your latest CV" icon={<IcoDoc />}
                    isEmpty={!profile?.resume_path && !resumeName} emptyText="Upload your resume to apply faster."
                    isEditing={isEditing('resume')}
                    setEditing={v => v ? openSection('resume', null) : closeEdit()}
                    saving={sectionSaving === 'resume'} savedFlash={sectionFlash === 'resume'}
                    onSave={() => saveSection('resume', {}, { forceFormData: true, file: resume })}
                    onCancel={closeEdit}
                    summary={
                        profile?.resume_path ? (
                            <div className="flex items-center gap-3 p-3 bg-avaa-primary-light rounded-xl">
                                <svg className="w-8 h-8 text-avaa-teal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-avaa-dark">Resume on file</p>
                                    <p className="text-xs text-avaa-muted">Click Edit to replace it</p>
                                </div>
                            </div>
                        ) : <></>
                    }
                    editForm={
                        <>
                            <div onClick={() => resumeRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-avaa-primary hover:bg-avaa-primary-light/30 transition-all">
                                {resumeName ? (
                                    <div className="flex items-center justify-center gap-2 text-avaa-teal">
                                        <IcoCheck />
                                        <span className="text-sm font-medium">{resumeName}</span>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="text-sm font-medium text-gray-600">Click to upload resume</p>
                                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX — max 10MB</p>
                                    </>
                                )}
                            </div>
                            <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                                onChange={e => { const f = e.target.files?.[0]; if (f) { setResume(f); setResumeName(f.name); } }} />
                        </>
                    }
                />

                {/* ── Education ── */}
                <SectionCard
                    title="Education" subtitle="Your academic background" icon={<IcoGrad />}
                    isEmpty={!education.highest_education} emptyText="Add your educational background."
                    isEditing={isEditing('education')}
                    setEditing={v => v ? openSection('education', { ...education }) : cancelSection('education', () => setEducation(snap.current.education))}
                    saving={sectionSaving === 'education'} savedFlash={sectionFlash === 'education'}
                    onSave={() => saveSection('education', education)}
                    onCancel={() => cancelSection('education', () => setEducation(snap.current.education))}
                    summary={
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <Field label="Highest Education" value={education.highest_education} />
                            <Field label="Field of Study" value={education.field_of_study} />
                            <Field label="Institution" value={education.institution_name} />
                        </div>
                    }
                    editForm={
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Highest Education</label>
                                    <select value={education.highest_education} onChange={e => setEducation(ed => ({ ...ed, highest_education: e.target.value }))} className={inputClass}>
                                        <option value="">Select level</option>
                                        {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Field of Study</label>
                                    <input type="text" value={education.field_of_study} onChange={e => setEducation(ed => ({ ...ed, field_of_study: e.target.value }))}
                                        className={inputClass} placeholder="e.g. Computer Science" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Institution Name</label>
                                <input type="text" value={education.institution_name} onChange={e => setEducation(ed => ({ ...ed, institution_name: e.target.value }))}
                                    className={inputClass} placeholder="e.g. University of the Philippines" />
                            </div>
                        </div>
                    }
                />

                {/* ── Certifications ── */}
                <SectionCard
                    title="Certifications & Licenses" subtitle="Add professional certifications" icon={<IcoStar />}
                    isEmpty={certs.length === 0} emptyText="Add professional certifications or licenses."
                    isEditing={isEditing('certs')}
                    setEditing={v => v ? openSection('certs', [...certs]) : cancelSection('certs', () => setCerts(snap.current.certs))}
                    saving={sectionSaving === 'certs'} savedFlash={sectionFlash === 'certs'}
                    onSave={() => saveSection('certs', { certifications: certs })}
                    onCancel={() => cancelSection('certs', () => setCerts(snap.current.certs))}
                    summary={<TagList items={certs} />}
                    editForm={<CertInput certs={certs} onChange={setCerts} />}
                />

                {/* ── Job Preferences ── */}
                <SectionCard
                    title="Job Preferences" subtitle="What kind of work are you looking for?" icon={<IcoBag />}
                    isEmpty={jobPrefs.employment_type_preference.length === 0 && jobPrefs.desired_industries.length === 0}
                    emptyText="Tell employers what you're looking for."
                    isEditing={isEditing('jobPrefs')}
                    setEditing={v => v ? openSection('jobPrefs', { ...jobPrefs }) : cancelSection('jobPrefs', () => setJobPrefs(snap.current.jobPrefs))}
                    saving={sectionSaving === 'jobPrefs'} savedFlash={sectionFlash === 'jobPrefs'}
                    onSave={() => saveSection('jobPrefs', { employment_type_preference: jobPrefs.employment_type_preference, desired_industries: jobPrefs.desired_industries })}
                    onCancel={() => cancelSection('jobPrefs', () => setJobPrefs(snap.current.jobPrefs))}
                    summary={
                        <div className="space-y-3">
                            {jobPrefs.employment_type_preference.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Employment Type</p>
                                    <TagList items={jobPrefs.employment_type_preference} />
                                </div>
                            )}
                            {jobPrefs.desired_industries.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Industries</p>
                                    <TagList items={jobPrefs.desired_industries} />
                                </div>
                            )}
                        </div>
                    }
                    editForm={
                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>Employment Type</label>
                                <ChipSelect options={JOB_TYPES} selected={jobPrefs.employment_type_preference}
                                    onChange={v => setJobPrefs(p => ({ ...p, employment_type_preference: v }))} />
                            </div>
                            <div>
                                <label className={labelClass}>Preferred Industries</label>
                                <ChipSelect options={INDUSTRIES} selected={jobPrefs.desired_industries}
                                    onChange={v => setJobPrefs(p => ({ ...p, desired_industries: v }))} />
                            </div>
                        </div>
                    }
                />

                {/* ── Salary ── */}
                <SectionCard
                    title="Salary Expectations" subtitle="Your expected compensation range" icon={<IcoMoney />}
                    isEmpty={!salary.expected_salary_min && !salary.expected_salary_max}
                    emptyText="Set your salary expectations so employers know your range."
                    isEditing={isEditing('salary')}
                    setEditing={v => v ? openSection('salary', { ...salary }) : cancelSection('salary', () => setSalary(snap.current.salary))}
                    saving={sectionSaving === 'salary'} savedFlash={sectionFlash === 'salary'}
                    onSave={() => saveSection('salary', salary)}
                    onCancel={() => cancelSection('salary', () => setSalary(snap.current.salary))}
                    summary={
                        <Field
                            label="Expected Salary"
                            value={salary.expected_salary_min || salary.expected_salary_max
                                ? `${salary.salary_currency} ${salary.expected_salary_min ? Number(salary.expected_salary_min).toLocaleString() : '—'} – ${salary.expected_salary_max ? Number(salary.expected_salary_max).toLocaleString() : '—'}`
                                : undefined}
                        />
                    }
                    editForm={
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Currency</label>
                                <select value={salary.salary_currency} onChange={e => setSalary(s => ({ ...s, salary_currency: e.target.value }))} className={`${inputClass} w-32`}>
                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Minimum</label>
                                    <input type="number" value={salary.expected_salary_min}
                                        onChange={e => setSalary(s => ({ ...s, expected_salary_min: e.target.value }))}
                                        className={inputClass} placeholder="e.g. 50000" min="0" />
                                </div>
                                <div>
                                    <label className={labelClass}>Maximum</label>
                                    <input type="number" value={salary.expected_salary_max}
                                        onChange={e => setSalary(s => ({ ...s, expected_salary_max: e.target.value }))}
                                        className={inputClass} placeholder="e.g. 80000" min="0" />
                                </div>
                            </div>
                        </div>
                    }
                />

                {/* ── Links ── */}
                <SectionCard
                    title="Links & Portfolio" subtitle="Share your online presence" icon={<IcoLink />}
                    isEmpty={!links.linkedin_url && !links.portfolio_url}
                    emptyText="Add your LinkedIn and portfolio links."
                    isEditing={isEditing('links')}
                    setEditing={v => v ? openSection('links', { ...links }) : cancelSection('links', () => setLinks(snap.current.links))}
                    saving={sectionSaving === 'links'} savedFlash={sectionFlash === 'links'}
                    onSave={() => saveSection('links', links)}
                    onCancel={() => cancelSection('links', () => setLinks(snap.current.links))}
                    summary={
                        <div className="space-y-2">
                            {links.linkedin_url && (
                                <a href={links.linkedin_url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 text-sm text-avaa-teal hover:underline">
                                    <IcoLink /> {links.linkedin_url}
                                </a>
                            )}
                            {links.portfolio_url && (
                                <a href={links.portfolio_url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 text-sm text-avaa-teal hover:underline">
                                    <IcoLink /> {links.portfolio_url}
                                </a>
                            )}
                        </div>
                    }
                    editForm={
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>LinkedIn URL</label>
                                <input type="text" value={links.linkedin_url} onChange={e => setLinks(l => ({ ...l, linkedin_url: e.target.value }))}
                                    className={inputClass} placeholder="https://linkedin.com/in/yourname" />
                            </div>
                            <div>
                                <label className={labelClass}>Portfolio / Website</label>
                                <input type="text" value={links.portfolio_url} onChange={e => setLinks(l => ({ ...l, portfolio_url: e.target.value }))}
                                    className={inputClass} placeholder="https://yourportfolio.com" />
                            </div>
                        </div>
                    }
                />

                {/* ── Privacy ── */}
                <SectionCard
                    title="Privacy Settings" subtitle="Control who can see your profile" icon={<IcoSettings />}
                    isEmpty={false}
                    isEditing={isEditing('privacy')}
                    setEditing={v => v ? openSection('privacy', { ...privacy }) : cancelSection('privacy', () => setPrivacy(snap.current.privacy))}
                    saving={sectionSaving === 'privacy'} savedFlash={sectionFlash === 'privacy'}
                    onSave={() => saveSection('privacy', privacy)}
                    onCancel={() => cancelSection('privacy', () => setPrivacy(snap.current.privacy))}
                    summary={
                        <Field
                            label="Visibility"
                            value={privacy.profile_visibility === 'public' ? '🌐 Public — Visible to all employers' : '🔒 Private — Only visible to you'}
                        />
                    }
                    editForm={
                        <div className="flex gap-4">
                            {[['public', '🌐 Public', 'Visible to all employers'], ['private', '🔒 Private', 'Only visible to you']].map(([val, label, desc]) => (
                                <label key={val} className={`flex-1 flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${privacy.profile_visibility === val ? 'border-avaa-primary bg-avaa-primary-light' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="profile_visibility" value={val}
                                        checked={privacy.profile_visibility === val}
                                        onChange={() => setPrivacy({ profile_visibility: val })}
                                        className="mt-0.5 accent-avaa-primary" />
                                    <div>
                                        <p className="text-sm font-semibold text-avaa-dark">{label}</p>
                                        <p className="text-xs text-avaa-muted">{desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    }
                />

            </div>
        </AppLayout>
    );
}