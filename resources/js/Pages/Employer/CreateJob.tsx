import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import ImageInitialsFallback from '@/Components/ImageInitialsFallback';

/* ── Types ── */
interface JobListing {
    id: number;
    title: string;
    location: string;
    company: string;
    status: 'active' | 'inactive' | 'draft';
    applications_count?: number;
    posted_date?: string;
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
    application_limit?: number | null;
    responsibilities?: string[];
    qualifications?: string[];
    requirements?: string[];
    screener_questions?: string[];
    work_arrangement?: string;
    logo_path?: string | null;
}

interface Collaborator {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string | null;
    role: string;
    status: 'pending' | 'accepted' | 'declined';
}

interface SearchResult {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string | null;
    company?: string | null;
}

interface Props {
    user: { first_name: string; last_name: string; email: string; role: string };
    profile: any;
    companyName: string;
    mode?: 'create' | 'edit';
    job?: JobListing;
    collaborators?: Collaborator[];
}

interface JobFormData {
    title: string; company: string; location: string;
    salary_min: string; salary_max: string; salary_currency: string;
    skills_required: string[]; description: string; application_limit: string;
    status: 'active' | 'inactive' | 'draft';
    employment_type: string; experience_level: string;
    industry: string; is_remote: boolean; deadline: string;
    responsibilities: string[];
    qualifications: string[];
    requirements: string[];
    screener_questions: string[];
    work_arrangement: string;
}

const EMPTY_COLLABORATORS: Collaborator[] = [];

/* ── Constants ── */
const SKILL_OPTIONS = ['JavaScript', 'TypeScript', 'Python', 'React', 'Vue', 'Angular', 'Node.js', 'Laravel', 'PHP', 'SQL', 'PostgreSQL', 'MySQL', 'Tailwind CSS', 'DevOps', 'Docker', 'AWS', 'UI/UX', 'Figma', 'Project Management', 'Data Analysis', 'Excel', 'GraphQL', 'REST API'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
const WORK_ARRANGEMENTS = ['On-site', 'Remote', 'Hybrid'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager', 'Executive'];
const CURRENCIES = ['USD', 'PHP', 'EUR', 'GBP', 'SGD', 'AUD'];
const STATUS_OPTIONS = ['active', 'inactive', 'draft'] as const;
const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
]);

const inp = "w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6D9886] focus:border-transparent transition-all placeholder-gray-400";
const lbl = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

function FieldError({ message, className = '' }: { message?: string; className?: string }) {
    if (!message) return null;
    return <p className={`text-xs text-red-500 mt-1 ${className}`}>{message}</p>;
}

const TABS = [
    {
        label: 'Job Details',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>,
    },
    {
        label: 'Description',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    },
    {
        label: 'Hiring Team',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
    },
    {
        label: 'Screener Qs',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    },
    {
        label: 'Settings',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
    },
];

/* ── Helpers ── */
function buildForm(job: JobListing | undefined, companyName: string): JobFormData {
    if (!job) {
        return {
            title: '', company: companyName ?? '', location: '', salary_min: '', salary_max: '',
            salary_currency: 'USD', skills_required: [], description: '', responsibilities: [],
            qualifications: [], requirements: [], screener_questions: [],
            application_limit: '', status: 'active', employment_type: '',
            experience_level: '', industry: '', is_remote: false, deadline: '', work_arrangement: '',
        };
    }
    return {
        title:              job.title             ?? '',
        company:            job.company           ?? companyName ?? '',
        location:           job.location          ?? '',
        description:        job.description       ?? '',
        responsibilities:   job.responsibilities  ?? [],
        qualifications:     job.qualifications    ?? [],
        requirements:       job.requirements      ?? [],
        screener_questions: job.screener_questions ?? [],
        salary_min:         job.salary_min  != null ? String(job.salary_min)  : '',
        salary_max:         job.salary_max  != null ? String(job.salary_max)  : '',
        salary_currency:    job.salary_currency   ?? 'USD',
        skills_required:    job.skills_required   ?? [],
        application_limit:  job.application_limit != null ? String(job.application_limit) : '',
        status:             job.status            ?? 'active',
        employment_type:    job.employment_type   ?? '',
        experience_level:   job.experience_level  ?? '',
        industry:           job.industry          ?? '',
        is_remote:          job.is_remote         ?? false,
        deadline:           job.deadline          ?? '',
        work_arrangement:   job.work_arrangement  ?? '',
    };
}

function getInitials(name: string, fallback = 'NA') {
    const trimmed = name.trim();
    if (!trimmed) return fallback;

    const initials = trimmed
        .split(/\s+/)
        .map(part => part[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return initials || fallback;
}

/* ── Logo upload area ── */
function LogoUpload({
    preview,
    initials,
    error,
    onChange,
    onClear,
}: {
    preview: string | null;
    initials: string;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
}) {
    return (
        <div className="relative">
            <label className="relative group cursor-pointer block">
                <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group-hover:border-[#6D9886]/50 transition-all">
                    {preview ? (
                        <ImageInitialsFallback
                            src={preview}
                            alt="Company logo"
                            initials={initials}
                            className="w-full h-full"
                            imgClassName="w-full h-full object-contain p-2"
                            fallbackClassName="bg-[#6D9886] flex items-center justify-center"
                            textClassName="text-white text-sm font-bold"
                        />
                    ) : (
                        <div className="flex items-center gap-3 text-gray-400 px-3">
                            <div className="w-10 h-10 rounded-full bg-[#6D9886] text-white text-sm font-bold flex items-center justify-center">
                                {initials}
                            </div>
                            <span className="text-xs font-medium">Upload Company Logo</span>
                        </div>
                    )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={onChange} />
            </label>
            {preview && (
                <div className="flex items-center gap-3 mt-1.5 px-1">
                    <p className="text-xs text-gray-400 flex-1">Click the area above to replace the logo.</p>
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                    >
                        Remove
                    </button>
                </div>
            )}
            {error && <p className="text-xs text-red-500 mt-1 px-1">{error}</p>}
        </div>
    );
}

export default function CreateJob({ user, profile, companyName, mode = 'create', job, collaborators: initialCollaborators = EMPTY_COLLABORATORS }: Props) {
    const isEdit = mode === 'edit' && !!job;

    const [form, setForm]               = useState<JobFormData>(() => buildForm(job, companyName));
    const [tab, setTab]                 = useState(0);
    const [skillInput, setSkillInput]   = useState('');
    const [skillDropOpen, setSkillDropOpen] = useState(false);
    const [respInput, setRespInput]     = useState('');
    const [qualInput, setQualInput]     = useState('');
    const [reqInput, setReqInput]       = useState('');
    const [qInput, setQInput]           = useState('');
    const [errors, setErrors]           = useState<Record<string, string>>({});
    const [saving, setSaving]           = useState(false);
    const [logoFile, setLogoFile]       = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(job?.logo_path ?? null);
    const logoObjectUrlRef = useRef<string | null>(null);
    const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators);
    const [draftJobId, setDraftJobId] = useState<number | null>(isEdit && job ? job.id : null);
    const skillRef = useRef<HTMLDivElement>(null);

    // Collaborator search state
    const [collabSearch, setCollabSearch]       = useState('');
    const [collabResults, setCollabResults]     = useState<SearchResult[]>([]);
    const [collabSearching, setCollabSearching] = useState(false);
    const [collabInviting, setCollabInviting]   = useState<number | null>(null);
    const collabSearchRef = useRef<HTMLDivElement>(null);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (logoObjectUrlRef.current) {
            URL.revokeObjectURL(logoObjectUrlRef.current);
            logoObjectUrlRef.current = null;
        }
        setLogoPreview(job?.logo_path ?? null);
    }, [job?.logo_path]);

    useEffect(() => {
        return () => {
            if (logoObjectUrlRef.current) {
                URL.revokeObjectURL(logoObjectUrlRef.current);
                logoObjectUrlRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const click = (e: MouseEvent) => {
            if (skillRef.current && !skillRef.current.contains(e.target as Node)) setSkillDropOpen(false);
            if (collabSearchRef.current && !collabSearchRef.current.contains(e.target as Node)) setCollabResults([]);
        };
        document.addEventListener('mousedown', click);
        return () => document.removeEventListener('mousedown', click);
    }, []);

    useEffect(() => {
        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, []);

    const ensureCollaboratorJobId = useCallback(async (): Promise<number | null> => {
        if (isEdit && job) return job.id;
        if (draftJobId) return draftJobId;

        try {
            const { data } = await axios.post(route('employer.jobs.drafts.store'));
            const newDraftId = Number(data?.id);
            if (!Number.isFinite(newDraftId) || newDraftId <= 0) return null;
            setDraftJobId(newDraftId);
            return newDraftId;
        } catch {
            return null;
        }
    }, [isEdit, job, draftJobId]);

    // Debounced collaborator search
    const handleCollabSearch = useCallback((q: string) => {
        setCollabSearch(q);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        if (q.trim().length < 2) {
            setCollabResults([]);
            return;
        }
        setCollabSearching(true);
        searchTimerRef.current = setTimeout(async () => {
            try {
                const collaboratorJobId = await ensureCollaboratorJobId();
                if (!collaboratorJobId) {
                    setCollabResults([]);
                    return;
                }
                const { data } = await axios.get(route('employer.jobs.collaborators.search', collaboratorJobId), { params: { q } });
                setCollabResults(data);
            } catch {
                setCollabResults([]);
            } finally {
                setCollabSearching(false);
            }
        }, 300);
    }, [ensureCollaboratorJobId]);

    const handleInvite = async (userId: number) => {
        const collaboratorJobId = await ensureCollaboratorJobId();
        if (!collaboratorJobId) return;

        setCollabInviting(userId);
        try {
            await axios.post(route('employer.jobs.collaborators.invite', collaboratorJobId), { user_id: userId });

            const invitedUser = collabResults.find(u => u.id === userId);
            if (invitedUser) {
                setCollaborators(prev => {
                    if (prev.some(c => c.user_id === userId)) return prev;
                    return [
                        ...prev,
                        {
                            id: Date.now() + userId,
                            user_id: invitedUser.id,
                            first_name: invitedUser.first_name,
                            last_name: invitedUser.last_name,
                            email: invitedUser.email,
                            avatar: invitedUser.avatar ?? null,
                            role: 'Collaborator',
                            status: 'pending',
                        },
                    ];
                });
            }

            setCollabSearch('');
            setCollabResults([]);
        } finally {
            setCollabInviting(null);
        }
    };

    const handleRemoveCollaborator = async (collaboratorId: number) => {
        const collaboratorJobId = await ensureCollaboratorJobId();
        if (!collaboratorJobId) return;

        await axios.delete(route('employer.jobs.collaborators.remove', { job: collaboratorJobId, collaborator: collaboratorId }));
        setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
    };

    const set = (k: keyof JobFormData, v: any) => {
        setForm(f => ({ ...f, [k]: v }));
        setErrors(e => { const n = { ...e }; delete n[k]; return n; });
    };

    const addSkill = (s: string) => {
        const t = s.trim();
        if (t && !form.skills_required.includes(t)) set('skills_required', [...form.skills_required, t]);
        setSkillInput('');
    };

    const addToList = (
        field: 'responsibilities' | 'qualifications' | 'requirements' | 'screener_questions',
        val: string,
        clearFn: () => void,
    ) => {
        const t = val.trim();
        if (t) { set(field, [...(form[field] as string[]), t]); clearFn(); }
    };

    const removeFromList = (
        field: 'responsibilities' | 'qualifications' | 'requirements' | 'screener_questions',
        i: number,
    ) => {
        set(field, (form[field] as string[]).filter((_, idx) => idx !== i));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type && !ALLOWED_IMAGE_TYPES.has(file.type)) {
            setErrors(prev => ({ ...prev, logo: 'Please upload a valid image (JPG, PNG, WEBP, GIF, SVG, or AVIF).' }));
            input.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, logo: 'Image must be 5 MB or smaller.' }));
            input.value = '';
            return;
        }

        if (logoObjectUrlRef.current) {
            URL.revokeObjectURL(logoObjectUrlRef.current);
            logoObjectUrlRef.current = null;
        }

        const objectUrl = URL.createObjectURL(file);
        logoObjectUrlRef.current = objectUrl;

        setLogoFile(file);
        setLogoPreview(objectUrl);
        setErrors(prev => {
            const next = { ...prev };
            delete next.logo;
            return next;
        });
    };

    const handleLogoClear = () => {
        if (logoObjectUrlRef.current) {
            URL.revokeObjectURL(logoObjectUrlRef.current);
            logoObjectUrlRef.current = null;
        }
        setLogoFile(null);
        setLogoPreview(null);
        setErrors(prev => {
            const next = { ...prev };
            delete next.logo;
            return next;
        });
    };

    const getError = (key: string) => (errors as any)?.[key] as string | undefined;
    const getGroupError = (prefix: string) => {
        const k = Object.keys(errors ?? {}).find(x => x === prefix || x.startsWith(prefix + '.'));
        return k ? (errors as any)[k] as string : undefined;
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.title.trim())       e.title           = 'Job title is required.';
        if (!form.location.trim())    e.location        = 'Location is required.';
        if (!form.description.trim()) e.description     = 'Description is required.';
        if (!form.employment_type)    e.employment_type = 'Employment type is required.';
        if (form.salary_min && Number.isNaN(Number(form.salary_min))) e.salary_min = 'Salary min must be a number.';
        if (form.salary_max && Number.isNaN(Number(form.salary_max))) e.salary_max = 'Salary max must be a number.';
        if (form.salary_min && form.salary_max) {
            const min = Number(form.salary_min);
            const max = Number(form.salary_max);
            if (!Number.isNaN(min) && !Number.isNaN(max) && max < min) e.salary_max = 'Salary max must be greater than or equal to salary min.';
        }
        if (form.deadline) {
            const d = new Date(form.deadline + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (Number.isNaN(d.getTime())) e.deadline = 'Expiry date is invalid.';
            else if (d <= today) e.deadline = 'Expiry date must be in the future.';
        }
        return e;
    };

    const tabForField = (field: string): number => {
        if (['title', 'company', 'location', 'salary_min', 'salary_max', 'salary_currency', 'employment_type', 'experience_level', 'skills_required', 'work_arrangement'].includes(field)) return 0;
        if (['description', 'responsibilities', 'qualifications', 'requirements'].includes(field)) return 1;
        if (['screener_questions'].includes(field)) return 3;
        if (['application_limit', 'status', 'deadline', 'is_remote', 'industry'].includes(field)) return 4;
        return 0;
    };

    const handleServerErrors = (errs: unknown) => {
        const safeErrors = (errs && typeof errs === 'object') ? (errs as Record<string, string>) : {};
        setErrors(safeErrors);
        const firstField = Object.keys(safeErrors)[0];
        if (firstField) setTab(tabForField(firstField));
    };

    const validateStep = (step: number) => {
        const all = validate();
        // Only block navigation for required fields on the current step.
        // Step 0: Job Details
        if (step === 0) {
            const keys = ['title', 'location', 'employment_type', 'salary_min', 'salary_max'] as const;
            return Object.fromEntries(Object.entries(all).filter(([k]) => (keys as readonly string[]).includes(k)));
        }
        // Step 1: Description
        if (step === 1) {
            const keys = ['description'] as const;
            return Object.fromEntries(Object.entries(all).filter(([k]) => (keys as readonly string[]).includes(k)));
        }
        // Other steps currently have no required fields
        return {};
    };

    const handleSubmit = () => {
        const e = validate();
        if (Object.keys(e).length) {
            setErrors(e);
            const firstField = Object.keys(e)[0];
            if (firstField) setTab(tabForField(firstField));
            return;
        }
        setSaving(true);

        const data = new FormData();

        // Scalar fields
        (
            [
                'title', 'company', 'location', 'description',
                'employment_type', 'salary_currency', 'experience_level',
                'industry', 'status', 'work_arrangement',
            ] as const
        ).forEach(k => data.append(k, form[k] as string));

        if (form.salary_min)        data.append('salary_min',        form.salary_min);
        if (form.salary_max)        data.append('salary_max',        form.salary_max);
        if (form.application_limit) data.append('application_limit', form.application_limit);
        if (form.deadline)          data.append('deadline',          form.deadline);
        data.append('is_remote', form.is_remote ? '1' : '0');

        // Array fields
        form.skills_required.forEach((s, i)      => data.append(`skills_required[${i}]`,   s));
        form.responsibilities.forEach((r, i)      => data.append(`responsibilities[${i}]`,  r));
        form.qualifications.forEach((q, i)        => data.append(`qualifications[${i}]`,    q));
        form.requirements.forEach((r, i)          => data.append(`requirements[${i}]`,      r));
        form.screener_questions.forEach((q, i)    => data.append(`screener_questions[${i}]`, q));

        if (logoFile) data.append('logo', logoFile);

        const targetJobId = isEdit && job ? job.id : draftJobId;

        if (targetJobId) {
            data.append('_method', 'PUT');
            router.post(route('employer.jobs.update', targetJobId), data as any, {
                preserveScroll: true,
                forceFormData:  true,
                onSuccess: () => {
                    // Clear the temporary file and preview state
                    setLogoFile(null);
                    // Redirect to job details or list - the page will reload with fresh data from server
                    router.visit(route('employer.jobs.show', targetJobId));
                },
                onError:   (errs: any) => handleServerErrors(errs),
                onFinish: () => setSaving(false),
            });
        } else {
            router.post(route('employer.jobs.store'), data as any, {
                preserveScroll: true,
                forceFormData:  true,
                onSuccess: () => {
                    // Clear the temporary file and preview state
                    setLogoFile(null);
                    // Redirect to jobs list - the page will reload with fresh data from server
                    router.visit(route('employer.jobs.index'));
                },
                onError:   (errs: any) => handleServerErrors(errs),
                onFinish: () => setSaving(false),
            });
        }
    };

    const filteredSkills = SKILL_OPTIONS.filter(
        s => !form.skills_required.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase()),
    );
    const companyInitials = getInitials(form.company || companyName || `${user.first_name} ${user.last_name}`);

    return (
        <AppLayout
            pageTitle={isEdit ? 'Edit Job' : 'Post New Job'}
            pageSubtitle={isEdit ? 'Update the details of your job listing.' : 'Fill in the details to create a new job listing.'}
            activeNav="Manage Jobs"
        >
            <Head title={isEdit ? `Edit — ${job?.title}` : 'Post New Job'} />

            <div className="min-h-0">
                {/* Page header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <button
                        onClick={() => isEdit
                            ? router.visit(route('employer.jobs.show', job!.id))
                            : router.visit(route('employer.jobs.index'))
                        }
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        <span className="hidden sm:inline">{isEdit ? 'Back to Job Details' : 'Back to Manage Jobs'}</span>
                        <span className="sm:hidden">Back</span>
                    </button>
                </div>

                {/* Form card — scrollable on mobile, fixed height on desktop */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col min-h-0 max-h-[85vh] sm:max-h-[calc(100vh-160px)] sm:min-h-[calc(100vh-160px)]">
                    {/* Card header */}
                    <div className="h-12 sm:h-14 bg-gradient-to-r from-[#6D9886] to-[#4a7360] flex items-center px-4 sm:px-6 justify-between flex-shrink-0">
                        <h2 className="text-white font-bold text-sm sm:text-base flex items-center gap-2 truncate">
                            {isEdit ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            )}
                            {isEdit ? `Editing: ${job?.title}` : 'Post New Job'}
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
                            {Object.keys(errors ?? {}).length > 0 && (
                                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                                    <p className="text-sm font-semibold text-red-700">Please fix the highlighted fields below.</p>
                                    <p className="text-xs text-red-600 mt-0.5">Fields with errors will show a message under the input.</p>
                                </div>
                            )}
                            {/* ── Tab 0: Job Details ── */}
                            {tab === 0 && (
                                <div className="space-y-4">

                                    <LogoUpload
                                        preview={logoPreview}
                                        initials={companyInitials}
                                        error={errors.logo}
                                        onChange={handleLogoChange}
                                        onClear={handleLogoClear}
                                    />

                                    <div>
                                        <label className={lbl}>Job Title *</label>
                                        <input value={form.title} onChange={e => set('title', e.target.value)} className={inp} placeholder="e.g. Senior Frontend Developer" />
                                        <FieldError message={getError('title')} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className={lbl}>Company</label>
                                            <input value={form.company} onChange={e => set('company', e.target.value)} className={inp} placeholder="Company name" />
                                            <FieldError message={getError('company')} />
                                        </div>
                                        <div>
                                            <label className={lbl}>Location *</label>
                                            <input value={form.location} onChange={e => set('location', e.target.value)} className={inp} placeholder="e.g. Manila, PH" />
                                            <FieldError message={getError('location')} />
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
                                        <FieldError message={getError('salary_min') ?? getError('salary_max')} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className={lbl}>Employment Type *</label>
                                            <select value={form.employment_type} onChange={e => set('employment_type', e.target.value)} className={inp}>
                                                <option value="">Select type</option>
                                                {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <FieldError message={getError('employment_type')} />
                                        </div>
                                        <div>
                                            <label className={lbl}>Work Arrangement</label>
                                            <select value={form.work_arrangement} onChange={e => set('work_arrangement', e.target.value)} className={inp}>
                                                <option value="">Select</option>
                                                {WORK_ARRANGEMENTS.map(w => <option key={w} value={w}>{w}</option>)}
                                            </select>
                                            <FieldError message={getError('work_arrangement')} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={lbl}>Experience Level</label>
                                        <select value={form.experience_level} onChange={e => set('experience_level', e.target.value)} className={inp}>
                                            <option value="">Select level</option>
                                            {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                        <FieldError message={getError('experience_level')} />
                                    </div>

                                    {/* Skills */}
                                    <div ref={skillRef}>
                                        <label className={lbl}>Skills / Tags</label>
                                        <div className="relative">
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                                    onFocus={() => setSkillDropOpen(true)}
                                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); setSkillDropOpen(false); } }}
                                                    placeholder="Search or type a skill..." className={`${inp} flex-1 min-w-0`}/>
                                                <button type="button" onClick={() => { addSkill(skillInput); setSkillDropOpen(false); }}
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
                                        <FieldError message={getGroupError('skills_required')} />
                                    </div>
                                </div>
                            )}

                            {/* ── Tab 1: Description & Qualifications ── */}
                            {tab === 1 && (
                                <div className="space-y-5">
                                    <div>
                                        <label className={lbl}>Job Summary *</label>
                                        <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                            rows={5} className={`${inp} resize-none`} placeholder="Describe the role and what the candidate will do..." />
                                        <FieldError message={getError('description')} />
                                    </div>

                                    {/* Key Responsibilities */}
                                    <div>
                                        <label className={lbl}>Key Responsibilities</label>
                                        <div className="flex gap-2 mb-2">
                                            <input value={respInput} onChange={e => setRespInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList('responsibilities', respInput, () => setRespInput('')); } }}
                                                placeholder="Add responsibility..." className={`${inp} flex-1`} />
                                            <button type="button" onClick={() => addToList('responsibilities', respInput, () => setRespInput(''))}
                                                className="px-3 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-xs font-semibold rounded-xl transition-colors">+ Add</button>
                                        </div>
                                        {form.responsibilities.length > 0 && (
                                            <ul className="space-y-1.5">
                                                {form.responsibilities.map((r, i) => (
                                                    <li key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 group">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#6D9886] flex-shrink-0" />
                                                        <span className="text-sm text-gray-700 flex-1">{r}</span>
                                                        <button type="button" onClick={() => removeFromList('responsibilities', i)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none">×</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <FieldError message={getGroupError('responsibilities')} />
                                    </div>

                                    {/* Qualifications */}
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
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#6D9886] flex-shrink-0" />
                                                        <span className="text-sm text-gray-700 flex-1">{q}</span>
                                                        <button type="button" onClick={() => removeFromList('qualifications', i)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none">×</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <FieldError message={getGroupError('qualifications')} />
                                    </div>

                                    {/* Requirements */}
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
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#6D9886] flex-shrink-0" />
                                                        <span className="text-sm text-gray-700 flex-1">{r}</span>
                                                        <button type="button" onClick={() => removeFromList('requirements', i)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none">×</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <FieldError message={getGroupError('requirements')} />
                                    </div>
                                </div>
                            )}

                            {/* ── Tab 2: Hiring Team ── */}
                            {tab === 2 && (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500">Invite other recruiters to collaborate on this job's applications.</p>

                                    {/* Search bar */}
                                    <div ref={collabSearchRef} className="relative">
                                        <label className={lbl}>Search Recruiters</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={collabSearch}
                                                onChange={e => handleCollabSearch(e.target.value)}
                                                placeholder="Search by name or email..."
                                                className={`${inp} flex-1`}
                                            />
                                            {collabSearching && (
                                                <div className="flex items-center px-2">
                                                    <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Search results dropdown */}
                                        {collabResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                {collabResults.map(u => (
                                                    <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors">
                                                        <ImageInitialsFallback
                                                            src={u.avatar}
                                                            alt={`${u.first_name} ${u.last_name}`}
                                                            initials={getInitials(`${u.first_name} ${u.last_name}`)}
                                                            className="w-8 h-8 rounded-full bg-[#6D9886] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                                                            fallbackClassName="bg-[#6D9886] flex items-center justify-center"
                                                            textClassName="text-white text-xs font-bold"
                                                            imgClassName="w-full h-full rounded-full object-cover"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">{u.first_name} {u.last_name}</p>
                                                            <p className="text-xs text-gray-400 truncate">{u.email}{u.company ? ` · ${u.company}` : ''}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleInvite(u.id)}
                                                            disabled={collabInviting === u.id}
                                                            className="px-3 py-1.5 bg-[#6D9886] hover:bg-[#5a8371] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                                                        >
                                                            {collabInviting === u.id ? 'Inviting…' : 'Invite'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {collabSearch.trim().length >= 2 && !collabSearching && collabResults.length === 0 && (
                                            <p className="text-xs text-gray-400 mt-1.5">No recruiters found matching "{collabSearch}".</p>
                                        )}
                                    </div>

                                    {/* Current collaborators list */}
                                    <div>
                                        <label className={lbl}>Team Members</label>
                                        {collaborators.length > 0 ? (
                                            <ul className="space-y-2">
                                                {collaborators.map(c => {
                                                    const statusCfg = {
                                                        pending:  { dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', label: 'Pending' },
                                                        accepted: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Accepted' },
                                                        declined: { dot: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50', label: 'Declined' },
                                                    }[c.status];
                                                    return (
                                                        <li key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                                                            <ImageInitialsFallback
                                                                src={c.avatar}
                                                                alt={`${c.first_name} ${c.last_name}`}
                                                                initials={getInitials(`${c.first_name} ${c.last_name}`)}
                                                                className="w-9 h-9 rounded-full bg-[#6D9886] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                                                                fallbackClassName="bg-[#6D9886] flex items-center justify-center"
                                                                textClassName="text-white text-xs font-bold"
                                                                imgClassName="w-full h-full rounded-full object-cover"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-800 truncate">{c.first_name} {c.last_name}</p>
                                                                <p className="text-xs text-gray-400 truncate">{c.email}</p>
                                                            </div>
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                                                {statusCfg.label}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveCollaborator(c.id)}
                                                                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none ml-1"
                                                            >×</button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center">
                                                <svg className="mx-auto mb-2 text-gray-300" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                                                <p className="text-xs text-gray-400">No collaborators yet. Use the search above to invite recruiters.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Tab 3: Screener Questions ── */}
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
                                        <FieldError message={getGroupError('screener_questions')} />
                                    </div>
                                </div>
                            )}

                            {/* ── Tab 4: Settings ── */}
                            {tab === 4 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className={lbl}>Application Limit</label>
                                            <input value={form.application_limit} onChange={e => set('application_limit', e.target.value)}
                                                type="number" className={inp} placeholder="e.g. 200" min="1" />
                                            <FieldError message={getError('application_limit')} />
                                        </div>
                                        <div>
                                            <label className={lbl}>Status</label>
                                            <select value={form.status} onChange={e => set('status', e.target.value as any)} className={inp}>
                                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                            </select>
                                            <FieldError message={getError('status')} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={lbl}>Expiry Date</label>
                                        <input value={form.deadline} onChange={e => set('deadline', e.target.value)} type="date" className={inp} />
                                        <FieldError message={getError('deadline')} />
                                    </div>
                                    <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <input type="checkbox" id="is_remote" checked={form.is_remote}
                                            onChange={e => set('is_remote', e.target.checked)}
                                            className="w-4 h-4 rounded accent-[#6D9886] cursor-pointer" />
                                        <label htmlFor="is_remote" className="text-sm text-gray-700 cursor-pointer select-none font-medium">Remote position</label>
                                    </div>
                                    <div>
                                        <label className={lbl}>Industry</label>
                                        <input value={form.industry} onChange={e => set('industry', e.target.value)} className={inp} placeholder="e.g. Technology" />
                                        <FieldError message={getError('industry')} />
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
                                onClick={() => isEdit
                                    ? router.visit(route('employer.jobs.show', job!.id))
                                    : router.visit(route('employer.jobs.index'))
                                }
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            {tab > 0 && (
                                <button onClick={() => setTab(t => t - 1)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                    Back
                                </button>
                            )}
                            {tab < TABS.length - 1 ? (
                                <button
                                    onClick={() => {
                                        const stepErrors = validateStep(tab);
                                        if (Object.keys(stepErrors).length > 0) {
                                            setErrors(prev => ({ ...(prev ?? {}), ...stepErrors }));
                                            return;
                                        }
                                        setTab(t => t + 1);
                                    }}
                                    className="px-5 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-sm font-semibold rounded-xl transition-colors">
                                    Next
                                </button>
                            ) : (
                                <button onClick={handleSubmit} disabled={saving}
                                    className="px-5 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]">
                                    {saving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                    {isEdit ? 'Save Changes' : 'Create Job'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}