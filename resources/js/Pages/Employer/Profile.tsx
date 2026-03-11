import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps, EmployerProfile } from '@/types';

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
const IcoPhone = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.67 2.36a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.72-1.24a2 2 0 012.11-.45c.76.31 1.55.54 2.36.67A2 2 0 0122 16.92z" />
    </svg>
);
const IcoGlobe = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
);
const IcoBuilding = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" /><line x1="9" y1="6" x2="9" y2="6.01" />
        <line x1="15" y1="6" x2="15" y2="6.01" /><line x1="9" y1="10" x2="9" y2="10.01" />
        <line x1="15" y1="10" x2="15" y2="10.01" /><line x1="9" y1="14" x2="9" y2="14.01" />
        <line x1="15" y1="14" x2="15" y2="14.01" /><line x1="9" y1="18" x2="15" y2="18" />
    </svg>
);
const IcoLock = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
);
const IcoLinkedIn = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
        <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
    </svg>
);
const IcoChevronRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);
const IcoPencil = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const IcoLink = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
);

/* ── Props ── */
interface Props extends PageProps {
    user: {
        first_name: string;
        last_name: string;
        email: string;
        phone?: string | null;
        avatar?: string | null;
        role: string;
        status: string;
        email_verified_at?: string | null;
        google_id?: string | null;
    };
    profile: EmployerProfile | null;
}

/* ══════════════════════════════════════════════
   MAIN PAGE — Consistent with Job Seeker Profile
══════════════════════════════════════════════ */
export default function Profile({ user, profile }: Props) {
    const p = profile;
    const fullName = `${user.first_name} ${user.last_name}`;
    const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();
    const location = p ? [p.city, p.state, p.country].filter(Boolean).join(', ') : '';
    const statusLabel = user.status === 'active' ? 'Active' : user.status === 'pending' ? 'Pending' : 'Suspended';

    return (
        <AppLayout pageTitle="My Profile" pageSubtitle="Your company presence" activeNav="Profile">
            <Head title="My Profile" />

            <div className="flex gap-6 flex-col lg:flex-row">
                {/* ═══════════════════════════════════════════
                   LEFT COLUMN — Main content
                ═══════════════════════════════════════════ */}
                <div className="flex-1 min-w-0 space-y-5">

                    {/* ── Hero / Cover card ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        {/* Cover gradient — same as Job Seeker */}
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
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={fullName}
                                            className="w-24 h-24 rounded-2xl ring-4 ring-white object-cover shadow-md"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl ring-4 ring-white bg-avaa-dark flex items-center justify-center text-white text-3xl font-bold shadow-md">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                <Link
                                    href={route('employer.settings')}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-avaa-primary hover:text-avaa-teal transition-colors shadow-sm"
                                >
                                    <IcoPencil /> Edit Profile
                                </Link>
                            </div>

                            {/* Name, industry, status */}
                            <div className="mb-1">
                                <div className="flex items-center gap-2.5 mb-0.5">
                                    <h2 className="text-2xl font-bold text-avaa-dark">{fullName}</h2>
                                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${user.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : user.status === 'pending'
                                                ? 'bg-amber-100 text-amber-600'
                                                : 'bg-red-100 text-red-600'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500'
                                                : user.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                            }`} />
                                        {statusLabel}
                                    </span>
                                </div>
                                <p className="text-base text-avaa-teal font-medium">
                                    {p?.industry ? `${p.industry} · ${p.company_size} company` : (
                                        <span className="text-gray-400 italic">No company info set</span>
                                    )}
                                </p>
                            </div>

                            {/* Location & email meta row */}
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-avaa-muted">
                                {location && (
                                    <span className="flex items-center gap-1">
                                        <IcoMapPin /> {location}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <IcoMail /> {user.email}
                                </span>
                                {user.phone && (
                                    <span className="flex items-center gap-1">
                                        <IcoPhone /> {user.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── About ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-base font-bold text-avaa-dark mb-3">About</h3>
                        {p?.company_description ? (
                            <p className="text-base text-avaa-muted leading-relaxed whitespace-pre-line">
                                {p.company_description}
                            </p>
                        ) : (
                            <p className="text-base text-gray-400 italic">
                                No company description yet — edit your profile to add one.
                            </p>
                        )}
                    </div>

                    {/* ── Personal Information ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-base font-bold text-avaa-dark mb-4">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">First Name</p>
                                <p className="text-base text-avaa-dark mt-0.5">{user.first_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Last Name</p>
                                <p className="text-base text-avaa-dark mt-0.5">{user.last_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Role</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className="text-base text-avaa-dark">{p?.industry ?? 'Employer'}</p>
                                    <IcoLock />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Complete Address</p>
                                <p className="text-base text-avaa-dark mt-0.5">{location || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Email Address</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-base text-avaa-dark">{user.email}</p>
                                    {user.email_verified_at && (
                                        <span className="text-[10px] font-semibold text-avaa-teal">Verified</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Phone Number</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-base text-avaa-dark">{user.phone ?? '—'}</p>
                                    {user.phone && (
                                        <span className="text-[10px] font-semibold text-avaa-teal">Verified</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Company Details ── */}
                    {p && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h3 className="text-base font-bold text-avaa-dark mb-4">Company Details</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Company Name</p>
                                    <p className="text-base text-avaa-dark mt-0.5">{p.company_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Industry</p>
                                    <p className="text-base text-avaa-dark mt-0.5">{p.industry}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Company Size</p>
                                    <p className="text-base text-avaa-dark mt-0.5">{p.company_size}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Year Established</p>
                                    <p className="text-base text-avaa-dark mt-0.5">{p.year_established ?? '—'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Headquarters</p>
                                    <p className="text-base text-avaa-dark mt-0.5 flex items-center gap-1.5">
                                        <IcoMapPin />
                                        {p.headquarters_address}, {p.city}, {p.state} {p.postal_code}, {p.country}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Links ── */}
                    {(p?.company_website || p?.linkedin_url || p?.facebook_url || p?.twitter_url || p?.instagram_url) && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h3 className="text-base font-bold text-avaa-dark mb-3">Links</h3>
                            <div className="space-y-2">
                                {p?.company_website && (
                                    <a href={p.company_website} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 text-base text-avaa-teal hover:underline">
                                        <IcoGlobe /> {p.company_website}
                                    </a>
                                )}
                                {p?.linkedin_url && (
                                    <a href={p.linkedin_url} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 text-sm text-avaa-teal hover:underline">
                                        <IcoLinkedIn /> {p.linkedin_url}
                                    </a>
                                )}
                                {p?.facebook_url && (
                                    <a href={p.facebook_url} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 text-sm text-avaa-teal hover:underline">
                                        <IcoLink /> {p.facebook_url}
                                    </a>
                                )}
                                {p?.twitter_url && (
                                    <a href={p.twitter_url} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 text-sm text-avaa-teal hover:underline">
                                        <IcoLink /> {p.twitter_url}
                                    </a>
                                )}
                                {p?.instagram_url && (
                                    <a href={p.instagram_url} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 text-sm text-avaa-teal hover:underline">
                                        <IcoLink /> {p.instagram_url}
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

                    {/* ── Company Overview ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <h3 className="text-base font-bold text-avaa-dark mb-4">Company Overview</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-avaa-muted">Verification</span>
                                <span className={`text-sm font-semibold ${p?.is_verified ? 'text-avaa-teal' : 'text-amber-500'}`}>
                                    {p?.is_verified ? '✓ Verified' : 'Pending'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-avaa-muted">Industry</span>
                                <span className="text-sm font-semibold text-avaa-dark">{p?.industry ?? '—'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-avaa-muted">Company Size</span>
                                <span className="text-sm font-semibold text-avaa-dark">{p?.company_size ?? '—'}</span>
                            </div>
                            {p?.year_established && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-avaa-muted">Established</span>
                                    <span className="text-sm font-semibold text-avaa-dark">{p.year_established}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Quick Actions ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2">
                        <Link
                            href={route('employer.settings')}
                            className="flex items-center justify-between w-full text-xs font-medium text-avaa-muted hover:text-avaa-teal transition-colors py-1.5"
                        >
                            Account Settings <IcoChevronRight />
                        </Link>
                        <Link
                            href={route('employer.jobs.index')}
                            className="flex items-center justify-between w-full text-xs font-medium text-avaa-muted hover:text-avaa-teal transition-colors py-1.5"
                        >
                            Manage Jobs <IcoChevronRight />
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
