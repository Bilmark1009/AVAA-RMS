import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';

interface EmployerProfile {
    company_name: string;
    industry?: string;
    company_size?: string;
    website?: string;
    company_description?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    linkedin_url?: string;
    facebook_url?: string;
    twitter_url?: string;
    instagram_url?: string;
    registration_number?: string;
    tax_id?: string;
    year_established?: number;
}

interface PendingEmployer {
    id: number;
    name: string;
    email: string;
    created_at: string;
    profile: EmployerProfile;
}

interface Props {
    auth: { user: { name: string; email: string; role: string } };
    pendingEmployers: PendingEmployer[];
}

/* ── icons ── */
const IcoCheck = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IcoX = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const IcoGlobe = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
);
const IcoMail = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);
const IcoCalendar = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const IcoChevDown = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);
const IcoShield = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IcoBuilding = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
);
const IcoPhone = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
);
const IcoMapPin = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);
const IcoLinkedin = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" />
    </svg>
);
const IcoFacebook = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
);
const IcoTwitter = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
);
const IcoInstagram = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

/* ── avatar bg pool ── */
const AVATAR_COLORS = ['bg-avaa-dark', 'bg-avaa-teal', 'bg-avaa-dark2', 'bg-violet-600', 'bg-rose-500', 'bg-amber-600'];

export default function AdminVerifications({ auth, pendingEmployers }: Props) {
    const [expanded, setExpanded] = useState<number | null>(null);
    const [processing, setProcessing] = useState<number | null>(null);

    const handleVerify = (id: number) => {
        setProcessing(id);
        router.post(route('admin.employers.verify', id), {}, {
            onFinish: () => setProcessing(null),
        });
    };

    const handleReject = (id: number) => {
        if (!confirm('Reject this employer verification request?')) return;
        setProcessing(id);
        router.post(route('admin.employers.revoke', id), {}, {
            onFinish: () => setProcessing(null),
        });
    };

    return (
        <>
            <Head title="Verifications – Admin" />
            <AppLayout
                pageTitle="Verifications"
                pageSubtitle="Review and approve pending employer accounts."
                activeNav="Verifications"
            >
                {/* ── Summary bar ── */}
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-sm font-semibold text-avaa-dark">
                            {pendingEmployers.length} pending
                        </span>
                        <span className="text-xs text-avaa-muted">verification{pendingEmployers.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* ── Empty state ── */}
                {pendingEmployers.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-avaa-primary-light flex items-center justify-center text-avaa-teal mb-4">
                            <IcoShield />
                        </div>
                        <p className="text-lg font-bold text-avaa-dark mb-1">All caught up!</p>
                        <p className="text-sm text-avaa-muted max-w-xs">No employer accounts are waiting for verification right now.</p>
                    </div>
                )}

                {/* ── Pending list ── */}
                {pendingEmployers.length > 0 && (
                    <div className="space-y-3">
                        {pendingEmployers.map((emp, i) => {
                            const isOpen = expanded === emp.id;
                            const isProcessing = processing === emp.id;
                            const avatarBg = AVATAR_COLORS[i % AVATAR_COLORS.length];
                            const initials = (emp.profile?.company_name ?? emp.name)
                                .trim().split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

                            return (
                                <div key={emp.id}
                                    className={`bg-white rounded-2xl border transition-all duration-200
                                        ${isOpen ? 'border-avaa-primary/40 shadow-sm' : 'border-gray-200 hover:border-avaa-primary/25'}`}>

                                    {/* Card header — always visible */}
                                    <div className="px-5 py-4 flex flex-col gap-3">

                                        {/* Row 1: avatar + name + action buttons */}
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className={`w-11 h-11 rounded-xl ${avatarBg} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                                {initials}
                                            </div>

                                            {/* Name + email — flex-1 + min-w-0 ensures truncate works */}
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <p className="font-semibold text-avaa-dark text-sm truncate">
                                                    {emp.profile?.company_name ?? emp.name}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-avaa-muted mt-0.5 min-w-0 overflow-hidden">
                                                    <IcoMail /><span className="truncate">{emp.email}</span>
                                                </div>
                                            </div>

                                            {/* Action buttons — icon-only on sm/md, full text on lg+ */}
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                {/* Verify — icon-only on sm..md, full label on lg+ */}
                                                <button
                                                    onClick={() => handleVerify(emp.id)}
                                                    disabled={isProcessing}
                                                    title="Verify"
                                                    className="hidden sm:flex items-center gap-1.5 p-2 lg:px-4 lg:py-2 rounded-xl text-xs font-semibold
                                                               text-white bg-avaa-primary hover:bg-avaa-primary-hover
                                                               disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                                    <IcoCheck />
                                                    <span className="hidden lg:inline">{isProcessing ? 'Processing…' : 'Verify'}</span>
                                                </button>
                                                {/* Reject — icon-only on sm..md, full label on lg+ */}
                                                <button
                                                    onClick={() => handleReject(emp.id)}
                                                    disabled={isProcessing}
                                                    title="Reject"
                                                    className="hidden sm:flex items-center gap-1.5 p-2 lg:px-4 lg:py-2 rounded-xl text-xs font-semibold
                                                               text-red-600 border border-red-200 hover:bg-red-50
                                                               disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                                    <IcoX />
                                                    <span className="hidden lg:inline">Reject</span>
                                                </button>
                                                {/* Expand toggle */}
                                                <button
                                                    onClick={() => setExpanded(isOpen ? null : emp.id)}
                                                    className={`p-2 rounded-xl border border-gray-200 text-avaa-muted
                                                               hover:bg-avaa-primary-light hover:text-avaa-teal transition-all
                                                               ${isOpen ? 'rotate-180 bg-avaa-primary-light text-avaa-teal' : ''}`}>
                                                    <IcoChevDown />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Row 2: meta chips + mobile action buttons */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {emp.profile?.industry && (
                                                <span className="px-2.5 py-1 rounded-lg bg-avaa-primary-light text-avaa-teal text-xs font-medium">
                                                    {emp.profile.industry}
                                                </span>
                                            )}
                                            {emp.profile?.company_size && (
                                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-avaa-muted text-xs font-medium">
                                                    {emp.profile.company_size}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-avaa-muted text-xs font-medium">
                                                <IcoCalendar />
                                                {new Date(emp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            {/* Mobile-only action buttons (visible below sm) */}
                                            <div className="flex sm:hidden items-center gap-2 ml-auto">
                                                <button
                                                    onClick={() => handleVerify(emp.id)}
                                                    disabled={isProcessing}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                                                               text-white bg-avaa-primary hover:bg-avaa-primary-hover
                                                               disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                                    <IcoCheck />
                                                    {isProcessing ? '…' : 'Verify'}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(emp.id)}
                                                    disabled={isProcessing}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                                                               text-red-600 border border-red-200 hover:bg-red-50
                                                               disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                                    <IcoX />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded detail panel */}
                                    {isOpen && (
                                        <div className="px-5 pb-5 border-t border-gray-100 pt-4">

                                            {/* Company description */}
                                            {emp.profile?.company_description && (
                                                <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                                                    <p className="text-xs font-semibold text-avaa-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                                        <IcoBuilding /> About the Company
                                                    </p>
                                                    <p className="text-sm text-avaa-text leading-relaxed break-words" style={{ overflowWrap: 'anywhere' }}>{emp.profile.company_description}</p>
                                                </div>
                                            )}

                                            {/* Key Verification Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                {/* Contact Information */}
                                                <div className="p-4 bg-avaa-primary-light rounded-xl border border-avaa-primary/15">
                                                    <p className="text-xs font-bold text-avaa-dark uppercase tracking-wide mb-3">Contact Details</p>
                                                    <div className="space-y-2.5">
                                                        <div>
                                                            <p className="text-[10px] font-semibold text-avaa-muted uppercase tracking-wide">Contact Person</p>
                                                            <p className="text-sm text-avaa-dark font-medium break-words" style={{ overflowWrap: 'anywhere' }}>{emp.name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-semibold text-avaa-muted uppercase tracking-wide flex items-center gap-1">
                                                                <IcoMail /> Email
                                                            </p>
                                                            <p className="text-sm text-avaa-dark break-words">{emp.email}</p>
                                                        </div>
                                                        {emp.profile?.phone && (
                                                            <div>
                                                                <p className="text-[10px] font-semibold text-avaa-muted uppercase tracking-wide flex items-center gap-1">
                                                                    <IcoPhone /> Phone
                                                                </p>
                                                                <p className="text-sm text-avaa-dark font-medium break-words">{emp.profile.phone}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Company Information */}
                                                <div className="p-4 bg-white rounded-xl border border-gray-200">
                                                    <p className="text-xs font-bold text-avaa-dark uppercase tracking-wide mb-3">Company Info</p>
                                                    <div className="space-y-2.5">
                                                        <div>
                                                            <p className="text-[10px] font-semibold text-avaa-muted uppercase tracking-wide">Industry</p>
                                                            <p className="text-sm text-avaa-dark font-medium">{emp.profile?.industry ?? '—'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-semibold text-avaa-muted uppercase tracking-wide">Company Size</p>
                                                            <p className="text-sm text-avaa-dark">{emp.profile?.company_size ?? '—'}</p>
                                                        </div>
                                                        {emp.profile?.year_established && (
                                                            <div>
                                                                <p className="text-[10px] font-semibold text-avaa-muted uppercase tracking-wide">Year Established</p>
                                                                <p className="text-sm text-avaa-dark">{emp.profile.year_established}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Location & Registration */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                {/* Address */}
                                                {(emp.profile?.address || emp.profile?.city) && (
                                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                        <p className="text-xs font-bold text-avaa-dark uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                                            <IcoMapPin /> Address
                                                        </p>
                                                        <div className="space-y-1 text-sm text-avaa-text">
                                                            {emp.profile.address && <p>{emp.profile.address}</p>}
                                                            <p>
                                                                {[emp.profile.city, emp.profile.state, emp.profile.postal_code].filter(Boolean).join(', ')}
                                                            </p>
                                                            {emp.profile.country && <p className="font-medium text-avaa-dark">{emp.profile.country}</p>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Registration Details */}
                                                {(emp.profile?.registration_number || emp.profile?.tax_id) && (
                                                    <div className="p-4 bg-avaa-primary-light rounded-xl border border-avaa-primary/15">
                                                        <p className="text-xs font-bold text-avaa-dark uppercase tracking-wide mb-3">Legal Registration</p>
                                                        <div className="space-y-2.5">
                                                            {emp.profile.registration_number && (
                                                                <div>
                                                                    <p className="text-[10px] font-semibold text-avaa-muted uppercase tracking-wide">Registration Number</p>
                                                                    <p className="text-sm text-avaa-dark font-mono font-medium break-words">{emp.profile.registration_number}</p>
                                                                </div>
                                                            )}
                                                            {emp.profile.tax_id && (
                                                                <div>
                                                                    <p className="text-[10px] font-semibold text-avaa-muted uppercase tracking-wide">Tax ID / FEIN</p>
                                                                    <p className="text-sm text-avaa-dark font-mono font-medium break-words">{emp.profile.tax_id}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Online Presence */}
                                            {(emp.profile?.website || emp.profile?.linkedin_url || emp.profile?.facebook_url || emp.profile?.twitter_url || emp.profile?.instagram_url) && (
                                                <div className="p-4 bg-gray-50 rounded-xl">
                                                    <p className="text-xs font-semibold text-avaa-muted uppercase tracking-wide mb-3">🌐 Online Presence</p>
                                                    <div className="flex flex-wrap gap-3">
                                                        {emp.profile.website && (
                                                            <a href={emp.profile.website} target="_blank" rel="noreferrer"
                                                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-avaa-teal hover:bg-avaa-primary-light transition-colors text-sm">
                                                                <IcoGlobe />
                                                                <span className="text-avaa-teal font-medium">Website</span>
                                                            </a>
                                                        )}
                                                        {emp.profile.linkedin_url && (
                                                            <a href={emp.profile.linkedin_url} target="_blank" rel="noreferrer"
                                                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-avaa-teal hover:bg-avaa-primary-light transition-colors text-sm">
                                                                <IcoLinkedin />
                                                                <span className="text-avaa-teal font-medium">LinkedIn</span>
                                                            </a>
                                                        )}
                                                        {emp.profile.facebook_url && (
                                                            <a href={emp.profile.facebook_url} target="_blank" rel="noreferrer"
                                                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-avaa-teal hover:bg-avaa-primary-light transition-colors text-sm">
                                                                <IcoFacebook />
                                                                <span className="text-avaa-teal font-medium">Facebook</span>
                                                            </a>
                                                        )}
                                                        {emp.profile.twitter_url && (
                                                            <a href={emp.profile.twitter_url} target="_blank" rel="noreferrer"
                                                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-avaa-teal hover:bg-avaa-primary-light transition-colors text-sm">
                                                                <IcoTwitter />
                                                                <span className="text-avaa-teal font-medium">Twitter</span>
                                                            </a>
                                                        )}
                                                        {emp.profile.instagram_url && (
                                                            <a href={emp.profile.instagram_url} target="_blank" rel="noreferrer"
                                                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-avaa-teal hover:bg-avaa-primary-light transition-colors text-sm">
                                                                <IcoInstagram />
                                                                <span className="text-avaa-teal font-medium">Instagram</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </AppLayout>
        </>
    );
}