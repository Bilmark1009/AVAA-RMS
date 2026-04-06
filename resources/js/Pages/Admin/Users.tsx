import { Head, router } from '@inertiajs/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import ImageInitialsFallback from '@/Components/ImageInitialsFallback';

/* ── Types ── */
interface JobSeekerProfile {
    skills?: string | null;
    professional_title?: string | null;
    current_job_title?: string | null;
    open_to_work?: boolean | null;
    profile_frame?: 'default' | 'open_to_work' | 'not_open_to_work' | null;
}
interface EmployerProfile { company_name?: string | null }

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
    deleted_at: string | null;
    avatar?: string | null;
    jobSeekerProfile?: JobSeekerProfile | null;
    job_seeker_profile?: JobSeekerProfile | null;
    employerProfile?: EmployerProfile | null;
    employer_profile?: EmployerProfile | null;
    job_applications_count?: number;
    profile_company_name?: string | null; // Direct join fallback
    currently_working?: boolean;
}

interface Paginator {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    auth: { user: { first_name: string; last_name: string; email: string; role: string } };
    users: Paginator;
    filters: { search: string; role: string; status: string };
}

/* ── Icons ── */
const IcoSearch = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IcoGrid = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);
const IcoList = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);
const IcoEye = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const IcoTrash = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
);
const IcoRestore = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);
const IcoChevDown = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);
const IcoCalendar = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const IcoUsers = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);
const IcoUser = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IcoClock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

/* ── Avatar colours ── */
const AVATAR_BG = ['bg-[#3d9e9e]', 'bg-slate-700', 'bg-emerald-600', 'bg-violet-600', 'bg-rose-500', 'bg-amber-600'];

/* ── Skill tag parser ── */
function parseSkills(raw?: string | null): string[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String);
    } catch { /* not JSON */ }
    return raw.split(',').map(s => s.trim()).filter(Boolean);
}

/* ── Effective status helper ── */
function effectiveStatus(user: User): 'active' | 'inactive' | 'banned' | 'suspended' {
    if (user.deleted_at) return 'inactive';
    if (user.status === 'banned') return 'banned';
    if (user.status === 'suspended') return 'suspended';
    return user.status === 'active' ? 'active' : 'inactive';
}

function getProfileFrame(frame?: string | null) {
    return frame === 'open_to_work' || frame === 'not_open_to_work' ? frame : 'default';
}

function getJobSeekerProfile(user: User): JobSeekerProfile | null {
    return user.jobSeekerProfile ?? user.job_seeker_profile ?? null;
}

function getEmployerProfile(user: User): EmployerProfile | null {
    return user.employerProfile ?? user.employer_profile ?? null;
}

function profileFrameRingClass(frame?: string | null, currentlyWorking = false) {
    if (currentlyWorking) return 'ring-2 ring-blue-400';
    if (frame === 'open_to_work') return 'ring-2 ring-emerald-400';
    if (frame === 'not_open_to_work') return 'ring-2 ring-red-400';
    return '';
}

function profileFrameLabel(user: User) {
    const jobSeekerProfile = getJobSeekerProfile(user);
    if (user.currently_working) return { text: 'Working', cls: 'bg-blue-500 text-white', icon: null };
    if (jobSeekerProfile?.profile_frame === 'open_to_work') {
        return { text: 'Open to Work', cls: 'bg-emerald-500 text-white', icon: null };
    }
    if (jobSeekerProfile?.profile_frame === 'not_open_to_work') {
        return { text: 'Not Open to Work', cls: 'bg-red-500 text-white', icon: null };
    }
    return null;
}

function ProfileFrameBadge({ user, size = 'sm' }: { user: User; size?: 'xs' | 'sm' }) {
    const badge = profileFrameLabel(user);
    if (!badge) return null;
    const px = size === 'xs' ? 'px-2 py-0.5 text-[8px]' : 'px-2.5 py-0.5 text-[10px]';
    return (
        <span className={`inline-flex items-center gap-1 font-bold rounded-full whitespace-nowrap shadow ${badge.cls} ${px}`}>
            {badge.icon && (
                <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" />
                </svg>
            )}
            {badge.text}
        </span>
    );
}

/* ── Delete Confirm Modal ── */
function DeleteModal({ user, onConfirm, onCancel }: {
    user: User;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                        <IcoTrash />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Deactivate User</p>
                        <p className="text-xs text-gray-400">This action can be undone later</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to deactivate{' '}
                    <span className="font-semibold text-gray-900">{user.first_name} {user.last_name}</span>?
                    They will be immediately logged out and unable to access the system.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                        Deactivate
                    </button>
                </div>
            </div>
        </div>
    );
}

function UserDetailsModal({ user, onClose }: { user: User; onClose: () => void }) {
    const jobSeekerProfile = getJobSeekerProfile(user);
    const employerProfile = getEmployerProfile(user);
    const initials = `${(user.first_name ?? '').charAt(0)}${(user.last_name ?? '').charAt(0)}`.toUpperCase();
    const skills = parseSkills(jobSeekerProfile?.skills);
    const frame = getProfileFrame(jobSeekerProfile?.profile_frame);
    const activity = profileFrameLabel(user);
    const isActive = effectiveStatus(user) === 'active';
    const roleLabel = user.role === 'job_seeker' ? 'Job Seeker' : user.role === 'employer' ? 'Employer' : user.role;
    const appCount = user.job_applications_count ?? 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-5 sm:p-10">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center z-10"
                >
                    ×
                </button>

                {/* Profile Header */}
                <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200 pr-8">
                    <div className="relative flex-shrink-0">
                        <ImageInitialsFallback
                            src={user.avatar}
                            alt={initials}
                            initials={initials}
                            className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden ${profileFrameRingClass(frame, !!user.currently_working)} ${user.avatar ? 'bg-white border border-gray-200' : 'bg-[#3d9e9e]'}`}
                            textClassName="text-white text-base sm:text-lg font-bold flex items-center justify-center"
                        />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
                            {user.role === 'job_seeker' && <ProfileFrameBadge user={user} size="xs" />}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 break-words">{user.first_name} {user.last_name}</h2>
                            <span className={`text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
                                {isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                            {user.role === 'job_seeker'
                                ? `Job Seeker${activity ? ` · ${activity.text}` : ''}`
                                : `Employer${employerProfile?.company_name ? ` • ${employerProfile.company_name}` : ''}`}
                        </p>
                    </div>
                </div>

                {/* Content — stacks on mobile, side-by-side on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12">

                    {/* Main info */}
                    <div className="sm:col-span-2">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#e8f4f4] rounded-lg flex items-center justify-center text-[#3d9e9e] flex-shrink-0">
                                <IcoUser />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{user.role === 'job_seeker' ? 'Profile Details' : 'Company Information'}</h3>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {user.role === 'job_seeker' ? 'Skills and professional background' : 'Business and application details'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">User ID</label>
                                <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base">#{user.id}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Email</label>
                                <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base break-all">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Role</label>
                                <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base">{roleLabel}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Joined Date</label>
                                <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base">{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>

                            {user.role === 'job_seeker' ? (
                                <div>
                                    <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Skills</label>
                                    {skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {skills.map(skill => (
                                                <span key={skill} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm mt-1">No skills provided</p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Company Name</label>
                                        <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base">
                                            {employerProfile?.company_name || user.profile_company_name || 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Applications</label>
                                        <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base">{appCount} application{appCount !== 1 ? 's' : ''}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Account Status — divider on mobile */}
                    <div className="sm:col-span-1 border-t sm:border-t-0 pt-5 sm:pt-0 border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 sm:mb-6">Account Status</h4>

                        <div className="space-y-4">
                            <div className="flex gap-3 sm:gap-4">
                                <div className="w-8 h-8 rounded-full border border-[#3d9e9e] text-[#3d9e9e] flex items-center justify-center flex-shrink-0 bg-[#e8f4f4]">
                                    <IcoCalendar />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">Account Created</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                </div>
                            </div>

                            {user.deleted_at && (
                                <div className="flex gap-3 sm:gap-4">
                                    <div className="w-8 h-8 rounded-full border border-red-400 text-red-500 flex items-center justify-center flex-shrink-0 bg-red-50">
                                        <IcoClock />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">Deactivated</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{new Date(user.deleted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 sm:gap-4">
                                <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 bg-white">
                                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">Current Status</p>
                                    <p className={`text-xs font-semibold mt-0.5 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                                        {isActive ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 mt-6 sm:mt-10 pt-5 sm:pt-8 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-5 sm:px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Page ── */
export default function AdminUsers({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? 'all');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('adminUsersViewMode') as 'list' | 'grid') || 'list';
        }
        return 'list';
    });
    const [roleDropOpen, setRoleDropOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [detailTarget, setDetailTarget] = useState<User | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const roleDropRef = useRef<HTMLDivElement>(null);
    const searchInitRef = useRef(false);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* ── Persist view mode to localStorage ── */
    useEffect(() => {
        localStorage.setItem('adminUsersViewMode', viewMode);
    }, [viewMode]);

    /* ── Close dropdown on outside click ── */
    useEffect(() => {
        if (!roleDropOpen) return;

        function handleClickOutside(e: MouseEvent) {
            if (roleDropRef.current && !roleDropRef.current.contains(e.target as Node)) {
                setRoleDropOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [roleDropOpen]);

    /* ── Keep statuses synced while page is open ── */
    useEffect(() => {
        const timer = window.setInterval(() => {
            router.reload({ only: ['users'] });
        }, 20000);

        return () => window.clearInterval(timer);
    }, []);

    /* ── Filter navigation ── */
    const applyFilters = useCallback((overrides: Partial<{ search: string; role: string; status: string }>) => {
        router.get(route('admin.users.index'), {
            search: overrides.search ?? search,
            role: overrides.role ?? role,
            status: overrides.status ?? status,
        }, { preserveState: true, replace: true });
    }, [search, role, status]);

    /* ── Keep filter state in sync with URL/query props ── */
    useEffect(() => {
        setSearch(filters.search ?? '');
        setRole(filters.role ?? 'all');
        setStatus(filters.status ?? 'all');
    }, [filters.search, filters.role, filters.status]);

    /* ── Live search with debounce and clear-to-reset ── */
    useEffect(() => {
        if (!searchInitRef.current) {
            searchInitRef.current = true;
            return;
        }

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        searchDebounceRef.current = setTimeout(() => {
            applyFilters({ search });
        }, 250);

        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, [search, applyFilters]);

    const handleTab = (s: string) => { setStatus(s); applyFilters({ status: s }); };
    const handleRole = (r: string) => { setRole(r); setRoleDropOpen(false); applyFilters({ role: r }); };

    /* ── Delete ── */
    const confirmDelete = (user: User) => setDeleteTarget(user);
    const doDelete = () => {
        if (!deleteTarget) return;
        setProcessingId(deleteTarget.id);
        router.delete(route('admin.users.destroy', deleteTarget.id), {
            onFinish: () => { setProcessingId(null); setDeleteTarget(null); },
        });
    };

    /* ── Restore ── */
    const doRestore = (user: User) => {
        setProcessingId(user.id);
        router.post(route('admin.users.restore', user.id), {}, {
            onFinish: () => setProcessingId(null),
        });
    };

    /* ── Reactivate (for banned users) ── */
    const doReactivate = (user: User) => {
        if (!confirm(`Are you sure you want to reactivate ${user.first_name} ${user.last_name}'s account? This will lift the ban and restore access.`)) return;
        setProcessingId(user.id);
        router.patch(route('admin.users.status', user.id), {}, {
            onFinish: () => setProcessingId(null),
        });
    };

    const ROLE_LABELS: Record<string, string> = { job_seeker: 'Job Seekers', employer: 'Employers', all: 'All Users' };

    return (
        <>
            <Head title="User Management – Admin" />
            <AppLayout
                pageTitle="User Management"
                pageSubtitle="Manage agency users and permissions."
                activeNav="Users"
            >
                {/* ── Filter Bar ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                    {/* Status Tabs */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-1 self-start sm:self-auto">
                        {(['all', 'active', 'inactive'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTab(tab)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all
                                    ${status === tab
                                        ? 'bg-avaa-dark text-white shadow-sm'
                                        : 'text-gray-500 hover:text-avaa-dark hover:bg-gray-50'}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
                        {/* Search */}
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-10 flex-1 sm:flex-none sm:w-64 shadow-sm min-w-0 transition-colors focus-within:border-[#3d9e9e] focus-within:ring-2 focus-within:ring-[#3d9e9e]/15">
                            <span className="text-gray-400 flex-shrink-0"><IcoSearch /></span>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search user..."
                                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 border-0 w-full outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                            />
                        </div>

                        {/* Role Dropdown */}
                        <div className="relative" ref={roleDropRef}>
                            <button
                                onClick={() => setRoleDropOpen(o => !o)}
                                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 h-10 text-sm font-semibold text-gray-700 hover:border-[#3d9e9e] hover:text-[#3d9e9e] transition-colors whitespace-nowrap"
                            >
                                {ROLE_LABELS[role] ?? 'Filter Role'}
                                <IcoChevDown />
                            </button>
                            {roleDropOpen && (
                                <div className="absolute right-0 left-auto top-full mt-1.5 w-48 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/5 z-20 overflow-hidden">
                                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                                        <button
                                            key={k}
                                            onClick={() => handleRole(k)}
                                            className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors
                                                ${role === k ? 'bg-[#e8f4f4] text-[#3d9e9e]' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* View toggle */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#3d9e9e] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <IcoGrid />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#3d9e9e] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <IcoList />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Table / Grid Container ── */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {users.data.length === 0 ? (

                        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-[#e8f4f4] flex items-center justify-center text-[#3d9e9e] mb-4">
                                <IcoUsers />
                            </div>
                            <p className="text-base font-bold text-gray-800 mb-1">No users found</p>
                            <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
                        </div>

                    ) : viewMode === 'list' ? (

                        /* ── LIST VIEW (TABLE) ── */
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[700px] table-fixed">
                                <colgroup>
                                    <col className="w-[38%]" />
                                    <col className="w-[24%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[16%]" />
                                    <col className="w-[10%]" />
                                </colgroup>
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {['User', 'Skills / Company', 'Status', 'Joined Date', ''].map(h => (
                                            <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-50">
                                    {users.data.map((user, i) => {
                                        const jobSeekerProfile = getJobSeekerProfile(user);
                                        const employerProfile = getEmployerProfile(user);
                                        const initials = `${(user.first_name ?? '').charAt(0)}${(user.last_name ?? '').charAt(0)}`.toUpperCase();
                                        const professionalTitle = jobSeekerProfile?.professional_title?.trim()
                                            || jobSeekerProfile?.current_job_title?.trim();
                                        const frame = getProfileFrame(jobSeekerProfile?.profile_frame);
                                        const company = employerProfile?.company_name || user.profile_company_name;
                                        const isActive = effectiveStatus(user);
                                        const isDeleted = !!user.deleted_at;
                                        const isBusy = processingId === user.id;

                                        return (
                                            <tr key={user.id} className={`transition-colors ${isDeleted ? 'opacity-60 bg-gray-50/60' : 'hover:bg-gray-50/50'}`}>

                                                {/* User */}
                                                <td className="px-6 py-4 min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <ImageInitialsFallback
                                                                src={user.avatar}
                                                                alt={initials}
                                                                initials={initials}
                                                                className={`w-9 h-9 rounded-full flex-shrink-0 overflow-hidden ${profileFrameRingClass(frame, !!user.currently_working)} ${user.avatar ? 'bg-white' : AVATAR_BG[i % AVATAR_BG.length]}`}
                                                                textClassName="text-white text-xs font-bold flex items-center justify-center"
                                                            />
                                                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
                                                                {user.role === 'job_seeker' && <ProfileFrameBadge user={user} size="xs" />}
                                                            </span>
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold text-gray-800 leading-tight truncate">
                                                                {user.first_name} {user.last_name}
                                                                {isDeleted && (
                                                                    <span className="ml-2 text-[10px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded-full">DELETED</span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-gray-400 truncate mt-0.5 max-w-full">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Skills / Company */}
                                                <td className="px-6 py-4 min-w-0">
                                                    {user.role === 'job_seeker' ? (
                                                        professionalTitle ? (
                                                            <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium truncate max-w-full align-top">{professionalTitle}</span>
                                                        ) : (
                                                            <span className="text-gray-300 text-xs">—</span>
                                                        )
                                                    ) : company ? (
                                                        <span className="inline-block px-2.5 py-1 rounded-lg bg-[#e8f4f4] text-[#3d9e9e] text-xs font-medium truncate max-w-full align-top">{company}</span>
                                                    ) : (
                                                        <span className="text-gray-300 text-xs">—</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                                        ${isActive === 'banned'
                                                            ? 'bg-red-50 text-red-700 border border-red-100'
                                                            : isActive === 'suspended'
                                                            ? 'bg-orange-50 text-orange-700 border border-orange-100'
                                                            : isActive === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                            : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            isActive === 'banned' ? 'bg-red-500'
                                                            : isActive === 'suspended' ? 'bg-orange-500'
                                                            : isActive === 'active' ? 'bg-emerald-500'
                                                            : 'bg-gray-400'
                                                        }`} />
                                                        {isActive === 'banned' ? 'Banned'
                                                            : isActive === 'suspended' ? 'Suspended'
                                                            : isActive === 'active' ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </td>

                                                {/* Joined */}
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                                                        <IcoCalendar />
                                                        {new Date(user.created_at).toISOString().slice(0, 10)}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 justify-end">
                                                        <button
                                                            onClick={() => setDetailTarget(user)}
                                                            title="View user"
                                                            className="p-2 rounded-lg text-gray-400 hover:text-[#3d9e9e] hover:bg-[#e8f4f4] transition-colors"
                                                        >
                                                            <IcoEye />
                                                        </button>

                                                        {isDeleted ? (
                                                            <button
                                                                onClick={() => doRestore(user)}
                                                                disabled={isBusy}
                                                                title="Restore user"
                                                                className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                                                            >
                                                                <IcoRestore />
                                                            </button>
                                                        ) : isActive === 'banned' ? (
                                                            <button
                                                                onClick={() => doReactivate(user)}
                                                                disabled={isBusy}
                                                                title="Reactivate banned account"
                                                                className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                                                            >
                                                                <IcoRestore />
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => confirmDelete(user)}
                                                                    disabled={isBusy}
                                                                    title="Deactivate user"
                                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                                                                >
                                                                    <IcoTrash />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                    ) : (

                        /* ── GRID VIEW ── */
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {users.data.map((user, i) => {
                                const initials = `${(user.first_name ?? '').charAt(0)}${(user.last_name ?? '').charAt(0)}`.toUpperCase();
                                const frame = getProfileFrame(getJobSeekerProfile(user)?.profile_frame);
                                const isActive = effectiveStatus(user);
                                const isDeleted = !!user.deleted_at;
                                const isBusy = processingId === user.id;
                                const appCount = user.job_applications_count ?? 0;

                                return (
                                    <div key={user.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition flex flex-col">

                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="relative flex-shrink-0">
                                                <ImageInitialsFallback
                                                    src={user.avatar}
                                                    alt={initials}
                                                    initials={initials}
                                                    className={`w-10 h-10 rounded-full overflow-hidden ${profileFrameRingClass(frame, !!user.currently_working)} ${user.avatar ? 'bg-white' : AVATAR_BG[i % AVATAR_BG.length]}`}
                                                    textClassName="text-white text-sm font-bold flex items-center justify-center"
                                                />
                                                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
                                                    {user.role === 'job_seeker' && <ProfileFrameBadge user={user} size="xs" />}
                                                </span>
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-gray-800 text-sm truncate">
                                                        {user.first_name} {user.last_name}
                                                    </p>
                                                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600 uppercase">
                                                        {user.role === 'job_seeker' ? 'User' : user.role === 'employer' ? 'Employer' : user.role}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                                                <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                                    <IcoCalendar />
                                                    {new Date(user.created_at).toISOString().slice(0, 10)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex-1" />

                                        <div className="flex items-center justify-between mt-3">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full
                                                ${isActive === 'banned'
                                                    ? 'bg-red-50 text-red-700'
                                                    : isActive === 'suspended'
                                                    ? 'bg-orange-50 text-orange-700'
                                                    : isActive === 'active'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-gray-100 text-gray-500'}`}>
                                                {isActive === 'banned' ? 'Banned'
                                                    : isActive === 'suspended' ? 'Suspended'
                                                    : isActive === 'active' ? 'Active'
                                                    : 'Inactive'}
                                            </span>

                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setDetailTarget(user)}
                                                    className="p-1.5 text-gray-400 hover:text-[#3d9e9e]"
                                                >
                                                    <IcoEye />
                                                </button>

                                                {isDeleted ? (
                                                    <button
                                                        onClick={() => doRestore(user)}
                                                        disabled={isBusy}
                                                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                                                    >
                                                        <IcoRestore />
                                                    </button>
                                                ) : isActive === 'banned' ? (
                                                    <button
                                                        onClick={() => doReactivate(user)}
                                                        disabled={isBusy}
                                                        title="Reactivate banned account"
                                                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                                                    >
                                                        <IcoRestore />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => confirmDelete(user)}
                                                        disabled={isBusy}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                                                    >
                                                        <IcoTrash />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>

                    )}

                    {/* ── Pagination ── */}
                    {users.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                                Showing {(users.current_page - 1) * users.per_page + 1}–{Math.min(users.current_page * users.per_page, users.total)} of {users.total} users
                            </p>

                            <div className="flex items-center gap-1">
                                {users.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                                            ${link.active
                                                ? 'bg-[#3d9e9e] text-white'
                                                : link.url
                                                    ? 'text-gray-600 hover:bg-gray-100'
                                                    : 'text-gray-300 cursor-not-allowed'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Delete Confirm Modal ── */}
                {deleteTarget && (
                    <DeleteModal
                        user={deleteTarget}
                        onConfirm={doDelete}
                        onCancel={() => setDeleteTarget(null)}
                    />
                )}

                {detailTarget && (
                    <UserDetailsModal
                        user={detailTarget}
                        onClose={() => setDetailTarget(null)}
                    />
                )}
            </AppLayout>
        </>
    );
}
