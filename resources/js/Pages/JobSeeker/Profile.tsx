import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ImageInitialsFallback from '@/Components/ImageInitialsFallback';

/* ── Types ── */
interface JobSeekerProfile {
    about?: string;
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
    notice_period?: string;
    work_style?: string;
    weekly_hours?: string;
}

interface WorkExperience {
    id: number;
    job_title: string;
    company: string;
    employment_type?: string | null;
    location?: string | null;
    start_date: string;
    end_date?: string | null;
    is_current: boolean;
    description?: string | null;
}

interface Props {
    user: {
        first_name: string;
        last_name: string;
        email: string;
        role: string;
        phone?: string | null;
        google_id?: string | null;
        avatar?: string;
    };
    profile: JobSeekerProfile | null;
    experiences: WorkExperience[];
}

/* ── Icons ── */
const IcoMapPin = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);
const IcoMail = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,7 12,13 2,7" />
    </svg>
);
const IcoPencil = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const IcoChevronRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);
const IcoBriefcase = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IcoCert = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
);

/* ══════════════════════════════════════════════
   MAIN PAGE — Figma-aligned read-only profile
══════════════════════════════════════════════ */
export default function JobSeekerProfilePage({ user, profile, experiences }: Props) {
    const p = profile ?? ({} as JobSeekerProfile);
    const completeness = p.profile_completeness ?? 0;
    const location = [p.city, p.state, p.country].filter(Boolean).join(', ');
    const fullName = `${user.first_name} ${user.last_name}`;
    const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };
    const dateRange = (exp: WorkExperience) =>
        `${formatDate(exp.start_date)} - ${exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : ''}`;

    return (
        <AppLayout pageTitle="My Profile" pageSubtitle="Your professional presence" activeNav="Profile">
            <Head title="My Profile" />

            <div className="flex gap-6 flex-col lg:flex-row">
                {/* ═══════════════════════════════════════════
                   LEFT COLUMN — Main content
                ═══════════════════════════════════════════ */}
                <div className="flex-1 min-w-0 space-y-5">

                    {/* ── Hero / Cover card ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        {/* Cover gradient */}
                        <div className="h-32 bg-gradient-to-r from-avaa-primary/80 via-avaa-teal to-emerald-400 relative">
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage:
                                        'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                                    backgroundSize: '40px 40px',
                                }}
                            />
                        </div>

                        <div className="px-6 pb-6">
                            {/* Avatar row */}
                            <div className="flex items-end justify-between -mt-12 mb-4">
                                <div className="relative">
                                    <ImageInitialsFallback
                                        src={user.avatar}
                                        alt={fullName}
                                        initials={initials}
                                        className="w-24 h-24 rounded-2xl ring-4 ring-white overflow-hidden shadow-md bg-avaa-dark"
                                        textClassName="text-white text-3xl font-bold flex items-center justify-center"
                                    />
                                </div>
                                <Link
                                    href={route('job-seeker.profile.edit')}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-avaa-primary hover:text-avaa-teal transition-colors shadow-sm"
                                >
                                    <IcoPencil /> Edit Profile
                                </Link>
                            </div>

                            {/* Name, title, status */}
                            <div className="mb-1">
                                <div className="flex items-center gap-2.5 mb-0.5">
                                    <h2 className="text-xl font-bold text-avaa-dark">{fullName}</h2>
                                    {p.profile_visibility === 'public' && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Available
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-avaa-teal font-medium">
                                    {p.professional_title || (
                                        <span className="text-gray-400 italic">No title set</span>
                                    )}
                                </p>
                            </div>

                            {/* Location & email */}
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-avaa-muted">
                                {location && (
                                    <span className="flex items-center gap-1">
                                        <IcoMapPin /> {location}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <IcoMail /> {user.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── About ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-sm font-bold text-avaa-dark mb-3">About</h3>
                        {p.about ? (
                            <p className="text-sm text-avaa-muted leading-relaxed whitespace-pre-line">
                                {p.about}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400 italic">
                                No bio yet — edit your profile to add a summary about yourself.
                            </p>
                        )}
                    </div>

                    {/* ── Core Skills ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-sm font-bold text-avaa-dark mb-3">Core Skills</h3>
                        {(p.skills?.length ?? 0) > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {p.skills!.map((s) => (
                                    <span
                                        key={s}
                                        className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-avaa-primary-light text-avaa-teal"
                                    >
                                        {s}
                                    </span>
                                ))}
                                <Link
                                    href={route('job-seeker.profile.edit')}
                                    className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-avaa-primary hover:text-avaa-teal transition-colors"
                                >
                                    + Add More
                                </Link>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">
                                No skills added yet.
                            </p>
                        )}
                    </div>

                    {/* ── Experience — Figma timeline layout ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-sm font-bold text-avaa-dark mb-4">Experience</h3>
                        {experiences && experiences.length > 0 ? (
                            <div className="space-y-6">
                                {experiences.map((exp) => (
                                    <div key={exp.id} className="flex gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-avaa-primary-light text-avaa-teal flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <IcoBriefcase />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-semibold text-avaa-dark">
                                                        {exp.job_title}
                                                    </p>
                                                    <p className="text-xs text-avaa-muted">
                                                        {[exp.company, exp.employment_type, exp.location]
                                                            .filter(Boolean)
                                                            .join(' • ')}
                                                    </p>
                                                </div>
                                                <span className={`text-xs font-semibold whitespace-nowrap flex-shrink-0 ${exp.is_current ? 'text-avaa-teal' : 'text-avaa-muted'
                                                    }`}>
                                                    {dateRange(exp)}
                                                </span>
                                            </div>
                                            {exp.description && (
                                                <ul className="mt-2 space-y-1">
                                                    {exp.description.split('\n').filter(Boolean).map((line, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                            <span className="mt-2 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                                                            {line.replace(/^[•\-\*]\s*/, '')}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">
                                No experience added yet.
                            </p>
                        )}
                    </div>

                    {/* ── Certificates ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-sm font-bold text-avaa-dark mb-4">Certificates</h3>
                        {(p.certifications?.length ?? 0) > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {p.certifications!.map((c, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-avaa-primary-light flex items-center justify-center text-avaa-teal flex-shrink-0">
                                            <IcoCert />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-avaa-dark truncate">
                                                {c}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">
                                No certificates added yet.
                            </p>
                        )}
                    </div>

                    {/* ── Education ── */}
                    {(p.highest_education || p.field_of_study || p.institution_name) && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-avaa-dark mb-3">Education</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                {p.highest_education && (
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                            Highest Education
                                        </p>
                                        <p className="text-sm text-avaa-dark mt-0.5">
                                            {p.highest_education}
                                        </p>
                                    </div>
                                )}
                                {p.field_of_study && (
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                            Field of Study
                                        </p>
                                        <p className="text-sm text-avaa-dark mt-0.5">
                                            {p.field_of_study}
                                        </p>
                                    </div>
                                )}
                                {p.institution_name && (
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                            Institution
                                        </p>
                                        <p className="text-sm text-avaa-dark mt-0.5">
                                            {p.institution_name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Links ── */}
                    {(p.linkedin_url || p.portfolio_url) && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-avaa-dark mb-3">Links</h3>
                            <div className="space-y-2">
                                {p.linkedin_url && (
                                    <a
                                        href={p.linkedin_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-sm text-avaa-teal hover:underline"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                                            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                                        </svg>
                                        {p.linkedin_url}
                                    </a>
                                )}
                                {p.portfolio_url && (
                                    <a
                                        href={p.portfolio_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-sm text-avaa-teal hover:underline"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                                            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                                        </svg>
                                        {p.portfolio_url}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════════════
                   RIGHT COLUMN — Sidebar
                ═══════════════════════════════════════════ */}
                <div className="w-full lg:w-72 flex-shrink-0 space-y-5">

                    {/* ── Profile Insights ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <h3 className="text-sm font-bold text-avaa-dark mb-4">Profile Insights</h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="border border-gray-200 rounded-xl p-3 text-center">
                                <p className="text-2xl font-extrabold text-avaa-dark">—</p>
                                <p className="text-[10px] text-avaa-muted font-medium mt-0.5">
                                    Profile Views
                                </p>
                            </div>
                            <div className="border border-gray-200 rounded-xl p-3 text-center">
                                <p className="text-2xl font-extrabold text-avaa-teal">
                                    {completeness}%
                                </p>
                                <p className="text-[10px] text-avaa-muted font-medium mt-0.5">
                                    Profile Strength
                                </p>
                            </div>
                        </div>

                        {/* Completeness bar */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] text-gray-400 font-medium">Completeness</span>
                                <span className="text-[10px] font-bold text-avaa-teal">
                                    {completeness}%
                                </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-avaa-primary transition-all duration-700"
                                    style={{ width: `${completeness}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-avaa-muted mt-1">
                                {completeness === 100
                                    ? '🎉 Profile is complete!'
                                    : 'Fill in more details to improve your profile.'}
                            </p>
                        </div>

                        {/* Top Matches placeholder */}
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                Top Matches
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2.5 text-xs text-avaa-muted">
                                    <div className="w-8 h-8 rounded-full bg-avaa-primary-light flex items-center justify-center text-avaa-teal font-bold text-[10px]">
                                        —
                                    </div>
                                    <span className="text-gray-400 italic">
                                        Complete your profile to see matches
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Availability ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <h3 className="text-sm font-bold text-avaa-dark mb-4">Availability</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-avaa-muted">Weekly Hours</span>
                                <span className="text-xs font-semibold text-avaa-dark">
                                    {p.weekly_hours || '—'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-avaa-muted">Notice Period</span>
                                <span className="text-xs font-semibold text-avaa-dark">
                                    {p.notice_period || '—'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-avaa-muted">Work Style</span>
                                <span className="text-xs font-semibold text-avaa-dark">
                                    {p.work_style || '—'}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={route('settings.job-preferences')}
                            className="flex items-center justify-between w-full mt-4 pt-3 border-t border-gray-100 text-xs font-medium text-avaa-muted hover:text-avaa-teal transition-colors"
                        >
                            Update Preferences <IcoChevronRight />
                        </Link>
                    </div>

                    {/* ── Quick Actions ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2">
                        <Link
                            href={route('settings.account')}
                            className="flex items-center justify-between w-full text-xs font-medium text-avaa-muted hover:text-avaa-teal transition-colors py-1.5"
                        >
                            Account Settings <IcoChevronRight />
                        </Link>
                        <Link
                            href={route('settings.job-preferences')}
                            className="flex items-center justify-between w-full text-xs font-medium text-avaa-muted hover:text-avaa-teal transition-colors py-1.5"
                        >
                            Job Preferences <IcoChevronRight />
                        </Link>
                        <Link
                            href={route('settings.documents')}
                            className="flex items-center justify-between w-full text-xs font-medium text-avaa-muted hover:text-avaa-teal transition-colors py-1.5"
                        >
                            Documents <IcoChevronRight />
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}