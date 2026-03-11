import { Link, usePage, router } from '@inertiajs/react';
import { useState, ReactNode, useRef, useEffect } from 'react';
import NotificationDropdown from '@/Components/NotificationDropdown';
import { PageProps } from '@/types';
import { usePreventAuthBack } from '@/hooks/usePreventAuthBack';

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const IcoBriefcase = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IcoBookmark = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
);
const IcoMsg = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
);
const IcoBell = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);
const IcoUser = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IcoLogout = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
const IcoSettings = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
);
const IcoMenu = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);
const IcoClose = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const IcoUsers = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);
const IcoDashboard = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);
const IcoInterview = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        <path d="M9 16l2 2 4-4" />
    </svg>
);
const IcoShield = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IcoJobsAdmin = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="17" /><line x1="9" y1="14.5" x2="15" y2="14.5" />
    </svg>
);
const IcoUsersAdmin = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);
const IcoSearch = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IcoChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const IcoChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);
// New icon for Application History
const IcoClipboard = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
    </svg>
);
// New icon for Job History
const IcoHistory = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="12 8 12 12 14 14" />
        <path d="M3.05 11a9 9 0 1 0 .5-4M3 4v4h4" />
    </svg>
);

/* ─────────────────────────────────────────
   SAFE ROUTE HELPER
───────────────────────────────────────── */
function safeRoute(name: string, params?: any): string {
    try { return route(name, params); }
    catch { return '#'; }
}

/** Programmatic logout: clears auth flags and replaces history so Back never returns to dashboard */
function handleLogout(e: React.MouseEvent): void {
    e.preventDefault();
    sessionStorage.removeItem('auth_logged_in');
    sessionStorage.removeItem('auth_dashboard');
    sessionStorage.removeItem('auth_user_id');
    sessionStorage.removeItem('auth_user_role');
    sessionStorage.removeItem('auth_session_id');
    router.visit(safeRoute('logout'), { method: 'post', replace: true });
}

/* ─────────────────────────────────────────
   NAV ITEM TYPES
───────────────────────────────────────── */
interface NavItem { label: string; href: string; icon: ReactNode }

/* ─────────────────────────────────────────
   JOB SEEKER SIDEBAR NAV ITEMS
───────────────────────────────────────── */
function getJobSeekerSideNav(): NavItem[] {
    return [
        { label: 'Jobs', href: safeRoute('job-seeker.jobs.browse'), icon: <IcoBriefcase /> },
        { label: 'Saved Jobs', href: safeRoute('job-seeker.jobs.saved'), icon: <IcoBookmark /> },
        { label: 'Application History', href: safeRoute('job-seeker.applications.index'), icon: <IcoClipboard /> },
        { label: 'Job History', href: safeRoute('job-seeker.jobs.history'), icon: <IcoHistory /> },
        { label: 'Messages', href: safeRoute('messages.index'), icon: <IcoMsg /> },
    ];
}

function getAdminSideNav(): NavItem[] {
    return [
        { label: 'Dashboard', href: safeRoute('admin.dashboard'), icon: <IcoDashboard /> },
        { label: 'Users', href: safeRoute('admin.users.index'), icon: <IcoUsersAdmin /> },
        { label: 'Jobs', href: safeRoute('admin.jobs.index'), icon: <IcoJobsAdmin /> },
        { label: 'Verifications', href: safeRoute('admin.verifications'), icon: <IcoShield /> },
        { label: 'Settings', href: safeRoute('admin.settings'), icon: <IcoSettings /> },
        { label: 'Messages', href: safeRoute('messages.index'), icon: <IcoMsg /> },
    ];
}

function getEmployerSideNav(): NavItem[] {
    return [
        { label: 'Dashboard', href: safeRoute('employer.dashboard'), icon: <IcoDashboard /> },
        { label: 'Users', href: safeRoute('employer.users.index'), icon: <IcoUsers /> },
        { label: 'Manage Jobs', href: safeRoute('employer.jobs.index'), icon: <IcoBriefcase /> },
        { label: 'Interview', href: safeRoute('employer.interviews.index'), icon: <IcoInterview /> },
        { label: 'Messages', href: safeRoute('messages.index'), icon: <IcoMsg /> },
    ];
}

/* ─────────────────────────────────────────
   AVATAR DROPDOWN
───────────────────────────────────────── */
interface AvatarDropdownProps {
    initials: string;
    avatar?: string;
    name: string;
    email: string;
    role: string;
}

function AvatarDropdown({ initials, avatar, name, email, role }: AvatarDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const isJobSeeker = role === 'job_seeker';

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-11 h-11 rounded-full bg-avaa-dark flex items-center justify-center
                           text-white text-sm font-bold cursor-pointer transition-all
                           ring-2 ring-avaa-primary/30 hover:ring-avaa-primary/60
                           overflow-hidden flex-shrink-0"
            >
                {avatar
                    ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    : initials
                }
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-gray-200 shadow-lg shadow-black/5 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-avaa-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                            {avatar
                                ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
                                : initials
                            }
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-avaa-dark truncate">{name}</p>
                            <p className="text-[11px] text-avaa-muted truncate">{email}</p>
                        </div>
                    </div>

                    <div className="p-1.5">
                        {isJobSeeker && (
                            <>
                                <Link
                                    href={safeRoute('job-seeker.profile.show')}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-avaa-text hover:bg-avaa-primary-light hover:text-avaa-dark transition-colors"
                                >
                                    <span className="text-avaa-muted"><IcoUser /></span>
                                    My Profile
                                </Link>
                                <Link
                                    href={safeRoute('settings.account')}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-avaa-text hover:bg-avaa-primary-light hover:text-avaa-dark transition-colors"
                                >
                                    <span className="text-avaa-muted"><IcoSettings /></span>
                                    Settings
                                </Link>
                            </>
                        )}
                        {role === 'employer' && (
                            <>
                                <Link
                                    href={safeRoute('employer.profile.show')}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-avaa-text hover:bg-avaa-primary-light hover:text-avaa-dark transition-colors"
                                >
                                    <span className="text-avaa-muted"><IcoUser /></span>
                                    My Profile
                                </Link>
                                <Link
                                    href={safeRoute('employer.settings')}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-avaa-text hover:bg-avaa-primary-light hover:text-avaa-dark transition-colors"
                                >
                                    <span className="text-avaa-muted"><IcoSettings /></span>
                                    Settings
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="p-1.5 border-t border-gray-100">
                        <button
                            onClick={(e) => { setOpen(false); handleLogout(e); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-avaa-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                            <IcoLogout />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface AppLayoutProps {
    children: ReactNode;
    activeNav?: string;
    pageTitle?: string;
    pageSubtitle?: string;
}

/* ─────────────────────────────────────────
   REUSABLE SIDEBAR SHELL
   (shared by Admin, Employer, Job Seeker)
───────────────────────────────────────── */
interface SidebarShellProps {
    children: ReactNode;
    activeNav?: string;
    pageTitle?: string;
    pageSubtitle?: string;
    user: any;
    initials: string;
    sideNavItems: NavItem[];
    logoLinkHref: string;
    topBarExtras?: ReactNode; // extra items in the top bar (e.g. Employer's Messages button)
    sidebarBottomExtra?: ReactNode; // e.g. admin user info block
}

function SidebarShell({
    children,
    activeNav,
    pageTitle,
    pageSubtitle,
    user,
    initials,
    sideNavItems,
    logoLinkHref,
    topBarExtras,
    sidebarBottomExtra,
}: SidebarShellProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#e8efef] flex">

            {/* ── Sidebar (desktop) ── */}
            <aside
                className={`hidden md:flex flex-col bg-white border-r border-gray-200 sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out flex-shrink-0
                    ${collapsed ? 'w-[72px]' : 'w-[248px]'}`}
            >
                {/* Logo + collapse toggle */}
                <div className={`h-20 flex items-center border-b border-gray-100 flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-6 justify-between'}`}>
                    {!collapsed && (
                        <Link href={logoLinkHref} className="flex items-center">
                            <img
                                src="/logos/AVAA_Banner.png"
                                alt="AVAA"
                                className="h-9 w-auto object-contain"
                            />
                        </Link>
                    )}
                    {collapsed && (
                        <Link href={logoLinkHref} className="flex items-center justify-center">
                            <img
                                src="/logos/avaa_logo.png"
                                alt="AVAA"
                                className="h-9 w-9 object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/logos/AVAA_Logo.png';
                                    (e.target as HTMLImageElement).className = 'h-7 w-auto object-contain';
                                }}
                            />
                        </Link>
                    )}
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-avaa-muted hover:bg-avaa-primary-light hover:text-avaa-dark transition-colors flex-shrink-0"
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <IcoChevronRight /> : <IcoChevronLeft />}
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {sideNavItems.map(item => {
                        const active = activeNav === item.label;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                title={collapsed ? item.label : undefined}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all group
                                    ${collapsed ? 'justify-center' : ''}
                                    ${active
                                        ? 'bg-avaa-primary text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-avaa-primary-light hover:text-avaa-dark'
                                    }`}
                            >
                                <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-avaa-muted group-hover:text-avaa-dark'}`}>
                                    {item.icon}
                                </span>
                                {!collapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom: optional extra + sign out */}
                <div className="px-3 py-4 border-t border-gray-100 space-y-1">
                    {sidebarBottomExtra}
                    <button
                        onClick={handleLogout}
                        title={collapsed ? 'Sign Out' : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-avaa-muted hover:bg-red-50 hover:text-red-500 transition-colors
                            ${collapsed ? 'justify-center' : ''}`}
                    >
                        <IcoLogout />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile sidebar backdrop */}
            {mobileSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 z-40"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Mobile sidebar drawer */}
            <aside className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col shadow-xl transition-transform duration-300
                ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-20 flex items-center justify-between px-5 border-b border-gray-100">
                    <Link href={logoLinkHref}>
                        <img src="/logos/avaa_logo.png" alt="AVAA" className="h-9 w-auto object-contain" />
                    </Link>
                    <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 text-avaa-muted">
                        <IcoClose />
                    </button>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {sideNavItems.map(item => {
                        const active = activeNav === item.label;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all
                                    ${active
                                        ? 'bg-avaa-primary text-white'
                                        : 'text-gray-600 hover:bg-avaa-primary-light hover:text-avaa-dark'
                                    }`}
                            >
                                <span className={active ? 'text-white' : 'text-avaa-muted'}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="px-3 py-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-avaa-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                        <IcoLogout />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main area (top bar + content) ── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                    <div className="w-full px-6 lg:px-8 h-20 flex items-center gap-4">

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="md:hidden p-2 rounded-xl hover:bg-avaa-primary-light text-avaa-muted transition-colors flex-shrink-0"
                        >
                            <IcoMenu />
                        </button>

                        {/* Page title */}
                        <div className="flex-1 min-w-0">
                            {pageTitle && (
                                <h1 className="text-xl font-bold text-avaa-dark leading-tight truncate">{pageTitle}</h1>
                            )}
                            {pageSubtitle && (
                                <p className="text-sm text-avaa-muted truncate">{pageSubtitle}</p>
                            )}
                        </div>

                        {/* Optional extra top bar items (e.g. search, messages button) */}
                        {topBarExtras}

                        {/* Notification Bell */}
                        <NotificationDropdown />

                        {/* Avatar */}
                        <AvatarDropdown
                            initials={initials}
                            avatar={user.avatar ?? undefined}
                            name={`${user.first_name} ${user.last_name}`}
                            email={user.email ?? ''}
                            role={user.role}
                        />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   ADMIN LAYOUT
───────────────────────────────────────── */
function AdminLayout({ children, activeNav, pageTitle, pageSubtitle, user, initials }: AppLayoutProps & { user: any; initials: string }) {
    const [collapsed, setCollapsed] = useState(false);

    const adminBottomExtra = (
        !collapsed ? (
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-avaa-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {initials}
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-avaa-dark truncate">{user.first_name} {user.last_name}</p>
                    <p className="text-[10px] text-avaa-muted truncate">Chief Systems Administrator</p>
                </div>
            </div>
        ) : null
    );

    return (
        <SidebarShell
            activeNav={activeNav}
            pageTitle={pageTitle}
            pageSubtitle={pageSubtitle}
            user={user}
            initials={initials}
            sideNavItems={getAdminSideNav()}
            logoLinkHref={safeRoute('admin.dashboard')}
            sidebarBottomExtra={adminBottomExtra}
        >
            {children}
        </SidebarShell>
    );
}

/* ─────────────────────────────────────────
   EMPLOYER LAYOUT
───────────────────────────────────────── */
function EmployerLayout({ children, activeNav, pageTitle, pageSubtitle, user, initials }: AppLayoutProps & { user: any; initials: string }) {
    return (
        <SidebarShell
            activeNav={activeNav}
            pageTitle={pageTitle}
            pageSubtitle={pageSubtitle}
            user={user}
            initials={initials}
            sideNavItems={getEmployerSideNav()}
            logoLinkHref={safeRoute('employer.dashboard')}
        >
            {children}
        </SidebarShell>
    );
}

/* ─────────────────────────────────────────
   JOB SEEKER LAYOUT (new sidebar layout)
───────────────────────────────────────── */
function JobSeekerLayout({ children, activeNav, pageTitle, pageSubtitle, user, initials }: AppLayoutProps & { user: any; initials: string }) {
    // Minimalist top bar — no search bar, just page title / notifications / avatar
    return (
        <SidebarShell
            activeNav={activeNav}
            pageTitle={pageTitle}
            pageSubtitle={pageSubtitle}
            user={user}
            initials={initials}
            sideNavItems={getJobSeekerSideNav()}
            logoLinkHref={safeRoute('job-seeker.jobs.browse')}
        // No topBarExtras — keep the top bar minimal
        >
            {children}
        </SidebarShell>
    );
}

/* ─────────────────────────────────────────
   LAYOUT (main entry point)
───────────────────────────────────────── */
export default function AppLayout({ children, activeNav, pageTitle, pageSubtitle }: AppLayoutProps) {
    usePreventAuthBack();
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    if (!user) return null;

    const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();

    if (user.role === 'admin') {
        return (
            <AdminLayout activeNav={activeNav} pageTitle={pageTitle} pageSubtitle={pageSubtitle} user={user} initials={initials}>
                {children}
            </AdminLayout>
        );
    }

    if (user.role === 'employer') {
        return (
            <EmployerLayout activeNav={activeNav} pageTitle={pageTitle} pageSubtitle={pageSubtitle} user={user} initials={initials}>
                {children}
            </EmployerLayout>
        );
    }

    if (user.role === 'job_seeker') {
        return (
            <JobSeekerLayout activeNav={activeNav} pageTitle={pageTitle} pageSubtitle={pageSubtitle} user={user} initials={initials}>
                {children}
            </JobSeekerLayout>
        );
    }

    // Fallback for any other roles — minimal top-nav layout
    return (
        <div className="min-h-screen bg-[#e8efef]">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="w-full px-8 lg:px-16 h-20 flex items-center gap-6">
                    <Link href="/" className="flex items-center flex-shrink-0">
                        <img src="/logos/avaa_logo.png" alt="AVAA" className="h-10 w-auto object-contain" />
                    </Link>
                    <div className="flex-1" />
                    <NotificationDropdown />
                    <AvatarDropdown
                        initials={initials}
                        avatar={user.avatar ?? undefined}
                        name={`${user.first_name} ${user.last_name}`}
                        email={user.email ?? ''}
                        role={user.role}
                    />
                </div>
            </header>
            <main className="w-full px-4 sm:px-8 lg:px-16 py-10">
                {children}
            </main>
        </div>
    );
}