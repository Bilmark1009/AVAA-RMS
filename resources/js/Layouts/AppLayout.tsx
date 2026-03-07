import { Link, usePage } from '@inertiajs/react';
import { useState, ReactNode } from 'react';
import { PageProps } from '@/types';

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const IcoDashboard = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
);
const IcoUsers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
);
const IcoJobs = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IcoShield = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
);
const IcoCalendar = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const IcoSearch = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IcoHeart = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
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
const IcoBell = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);
const IcoMsg = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
);
const IcoMenu = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);
const IcoClose = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const IcoChevL = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const IcoChevR = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

/* ─────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────── */
interface NavItem { label: string; href: string; icon: ReactNode; badge?: number }

function getNav(role: string): NavItem[] {
    if (role === 'admin') return [
        { label: 'Dashboard', href: route('admin.dashboard'), icon: <IcoDashboard /> },
        { label: 'Users', href: route('admin.dashboard'), icon: <IcoUsers /> },
        { label: 'Manage Jobs', href: route('admin.dashboard'), icon: <IcoJobs /> },
        { label: 'Verifications', href: route('admin.verifications'), icon: <IcoShield /> },
        { label: 'Interview', href: route('admin.dashboard'), icon: <IcoCalendar /> },
    ];

    if (role === 'employer') return [
        { label: 'Dashboard', href: route('employer.dashboard'), icon: <IcoDashboard /> },
        { label: 'Manage Jobs', href: route('employer.jobs.index'), icon: <IcoJobs /> },
        { label: 'Interview', href: route('employer.dashboard'), icon: <IcoCalendar /> },
        { label: 'Profile', href: route('employer.dashboard'), icon: <IcoUser /> },
    ];

    return [
        { label: 'Dashboard', href: route('job-seeker.dashboard'), icon: <IcoDashboard /> },
        { label: 'Browse Jobs', href: route('job-seeker.jobs.browse'), icon: <IcoSearch /> },
        { label: 'Applied', href: route('job-seeker.dashboard'), icon: <IcoJobs /> },
        { label: 'Saved', href: route('job-seeker.jobs.saved'), icon: <IcoHeart /> },
        { label: 'Profile', href: route('job-seeker.profile.edit'), icon: <IcoUser /> },
    ];
}

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface AppLayoutProps {
    children: ReactNode;
    pageTitle?: string;
    pageSubtitle?: string;
    activeNav?: string;
}

/* ─────────────────────────────────────────
   LAYOUT
───────────────────────────────────────── */
export default function AppLayout({ children, pageTitle, pageSubtitle, activeNav }: AppLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    if (!user) return null;

    const navItems = getNav(user.role);
    const initials = user.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const SidebarInner = ({ isMobile = false }: { isMobile?: boolean }) => (
        <div className="flex flex-col h-full select-none">

            {/* Logo row */}
            <div className={`h-16 flex items-center flex-shrink-0 border-b border-gray-100 px-4
                ${collapsed && !isMobile ? 'justify-center' : 'justify-between gap-2'}`}>
                <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                    <img src="/storage/logos/System_Logo/AVAA_Logo.png" alt="AVAA"
                        className="h-8 w-auto object-contain flex-shrink-0" />
                    {(!collapsed || isMobile) && (
                        <div className="leading-tight min-w-0">
                            <p className="text-[15px] font-extrabold text-avaa-dark tracking-wide">AVAA</p>
                            <p className="text-[10px] text-avaa-muted">Recruitment Platform</p>
                        </div>
                    )}
                </div>
                {!isMobile && (
                    <button onClick={() => setCollapsed(c => !c)}
                        className="hidden lg:flex w-6 h-6 rounded-full bg-avaa-primary-light
                                   items-center justify-center text-avaa-teal
                                   hover:bg-avaa-primary/25 transition-colors flex-shrink-0">
                        {collapsed ? <IcoChevR /> : <IcoChevL />}
                    </button>
                )}
                {isMobile && (
                    <button onClick={() => setMobileOpen(false)}
                        className="p-1 rounded-lg text-avaa-muted hover:text-avaa-dark flex-shrink-0">
                        <IcoClose />
                    </button>
                )}
            </div>

            {/* User chip */}
            <div className={`px-3 pt-3 pb-2 ${collapsed && !isMobile ? 'flex justify-center' : ''}`}>
                {collapsed && !isMobile ? (
                    <div className="w-9 h-9 rounded-full bg-avaa-dark flex items-center justify-center text-white text-xs font-bold">
                        {initials}
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-avaa-primary-light">
                        <div className="w-8 h-8 rounded-full bg-avaa-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-avaa-dark truncate">{user.name}</p>
                            <p className="text-[10px] text-avaa-muted capitalize">{user.role.replace('_', ' ')}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
                {navItems.map(item => {
                    const active = activeNav ? item.label === activeNav : item.label === 'Dashboard';
                    return (
                        <Link key={item.label} href={item.href}
                            title={collapsed && !isMobile ? item.label : undefined}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                       transition-all duration-150 group
                                       ${collapsed && !isMobile ? 'justify-center' : ''}
                                       ${active
                                    ? 'bg-avaa-primary text-white shadow-sm'
                                    : 'text-avaa-text hover:bg-avaa-primary-light hover:text-avaa-dark'}`}>
                            <span className={`flex-shrink-0 transition-colors
                                ${active ? 'text-white' : 'text-avaa-muted group-hover:text-avaa-teal'}`}>
                                {item.icon}
                            </span>
                            {(!collapsed || isMobile) && (
                                <span className="flex-1 truncate">{item.label}</span>
                            )}
                            {(!collapsed || isMobile) && item.badge ? (
                                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full
                                                 bg-amber-400/20 text-amber-600">
                                    {item.badge}
                                </span>
                            ) : null}
                        </Link>
                    );
                })}
            </nav>

            {/* Sign Out */}
            <div className={`p-3 border-t border-gray-100 flex-shrink-0
                ${collapsed && !isMobile ? 'flex justify-center' : ''}`}>
                <Link href={route('logout')} method="post" as="button"
                    title={collapsed && !isMobile ? 'Sign Out' : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                text-avaa-muted hover:bg-red-50 hover:text-red-500 transition-all w-full
                                ${collapsed && !isMobile ? 'justify-center' : ''}`}>
                    <IcoLogout />
                    {(!collapsed || isMobile) && <span>Sign Out</span>}
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/25 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)} />
            )}

            {/* Desktop sidebar */}
            <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40
                              transition-[width] duration-300 ease-in-out
                              ${collapsed ? 'w-[72px]' : 'w-[236px]'}`}>
                <SidebarInner />
            </aside>

            {/* Mobile sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-[236px] bg-white border-r border-gray-200 z-40
                              flex flex-col lg:hidden
                              transition-transform duration-300 ease-in-out
                              ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarInner isMobile />
            </aside>

            {/* Main */}
            <div className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ease-in-out
                            ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[236px]'}`}>

                {/* Header */}
                <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200
                                   flex items-center px-4 sm:px-6 gap-3 flex-shrink-0">

                    <button onClick={() => setMobileOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-avaa-primary-light text-avaa-muted transition-colors">
                        <IcoMenu />
                    </button>

                    <div className="flex-1 min-w-0">
                        {pageTitle && (
                            <h1 className="text-[17px] font-bold text-avaa-dark leading-tight truncate">{pageTitle}</h1>
                        )}
                        {pageSubtitle && (
                            <p className="text-xs text-avaa-muted truncate">{pageSubtitle}</p>
                        )}
                    </div>

                    {/* Search */}
                    <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-44 lg:w-52">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-avaa-muted flex-shrink-0">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input placeholder="Search jobs..." className="text-sm bg-transparent text-avaa-dark placeholder-avaa-muted focus:outline-none w-full min-w-0" />
                    </div>

                    {/* Messages */}
                    <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white
                                       text-avaa-muted hover:bg-avaa-primary-light hover:text-avaa-teal transition-colors text-sm font-medium">
                        <IcoMsg />
                        <span>Messages</span>
                    </button>

                    {/* Bell */}
                    <button className="relative p-2 rounded-xl hover:bg-avaa-primary-light text-avaa-muted hover:text-avaa-teal transition-colors">
                        <IcoBell />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400 ring-1 ring-white" />
                    </button>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-avaa-dark flex items-center justify-center
                                    text-white text-xs font-bold cursor-pointer ring-2 ring-avaa-primary/30">
                        {initials}
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}