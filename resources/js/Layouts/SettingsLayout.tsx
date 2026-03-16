import { Link, usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

/* ── Icons ── */
const IcoAccount = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
);
const IcoShield = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IcoBriefcase = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IcoBell = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);
const IcoDoc = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
);
const IcoBlock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
);
const IcoMenu = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);
const IcoX = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

function safeRoute(name: string, params?: any): string {
    try { return route(name, params); }
    catch { return '#'; }
}

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
    routeName: string;
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Account',            href: safeRoute('settings.account'),          icon: <IcoAccount />,   routeName: 'settings.account'        },
    { label: 'Security & Privacy', href: safeRoute('settings.security'),          icon: <IcoShield />,    routeName: 'settings.security'       },
    { label: 'Job Preferences',    href: safeRoute('settings.job-preferences'),   icon: <IcoBriefcase />, routeName: 'settings.job-preferences' },
    { label: 'Notifications',      href: safeRoute('settings.notifications'),     icon: <IcoBell />,      routeName: 'settings.notifications'  },
    { label: 'Documents',          href: safeRoute('settings.documents'),         icon: <IcoDoc />,       routeName: 'settings.documents'      },
    { label: 'Blocked Users',      href: safeRoute('settings.blocked-users'),     icon: <IcoBlock />,     routeName: 'settings.blocked-users'  },
];

interface SettingsLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

export default function SettingsLayout({ children, title, subtitle }: SettingsLayoutProps) {
    const { url } = usePage();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const isActive = (item: NavItem) => {
        return url.startsWith('/' + item.href.replace(/^https?:\/\/[^/]+\//, ''));
    };

    const activeItem = NAV_ITEMS.find(item => isActive(item));

    /* ── Shared nav link renderer ── */
    const NavLink = ({ item }: { item: NavItem }) => {
        const active = isActive(item);
        return (
            <Link
                key={item.routeName}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${active
                        ? 'bg-avaa-primary text-white'
                        : 'text-avaa-text hover:bg-avaa-primary-light hover:text-avaa-dark'
                    }`}
            >
                <span className={active ? 'text-white' : 'text-avaa-muted'}>
                    {item.icon}
                </span>
                {item.label}
            </Link>
        );
    };

    return (
        <div className="flex gap-6 min-h-[calc(100vh-8rem)]">

            {/* ══════════════════════════════
                DESKTOP sidebar (lg+)
            ══════════════════════════════ */}
            <aside className="hidden lg:block w-52 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-6">
                    <div className="px-4 pt-5 pb-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-avaa-dark">Settings</p>
                        <p className="text-[11px] text-avaa-muted mt-0.5">Manage your preferences.</p>
                    </div>
                    <nav className="p-2 space-y-0.5">
                        {NAV_ITEMS.map(item => <NavLink key={item.routeName} item={item} />)}
                    </nav>
                </div>
            </aside>

            {/* ══════════════════════════════
                MOBILE top bar + drawer (< lg)
            ══════════════════════════════ */}
            <div className="lg:hidden w-full">
                {/* Mobile top bar */}
                <div className="flex items-center justify-between mb-5 bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        <span className="text-avaa-muted">
                            {activeItem?.icon}
                        </span>
                        <div>
                            <p className="text-sm font-bold text-avaa-dark">{activeItem?.label ?? 'Settings'}</p>
                            <p className="text-[11px] text-avaa-muted">Settings</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-avaa-primary-light hover:text-avaa-teal hover:border-avaa-primary/30 transition-all"
                        aria-label="Open settings navigation"
                    >
                        <IcoMenu />
                    </button>
                </div>

                {/* Overlay */}
                {drawerOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        onClick={() => setDrawerOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Slide-out drawer */}
                <div
                    className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
                        drawerOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    {/* Drawer header */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
                        <div>
                            <p className="text-sm font-bold text-avaa-dark">Settings</p>
                            <p className="text-[11px] text-avaa-muted mt-0.5">Manage your preferences.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(false)}
                            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                            aria-label="Close settings navigation"
                        >
                            <IcoX />
                        </button>
                    </div>

                    {/* Drawer nav */}
                    <nav className="p-3 space-y-0.5 overflow-y-auto">
                        {NAV_ITEMS.map(item => <NavLink key={item.routeName} item={item} />)}
                    </nav>
                </div>

                {/* Main content (mobile) */}
                <div className="space-y-5">
                    <div>
                        <h2 className="text-lg font-bold text-avaa-dark">{title}</h2>
                        <p className="text-sm text-avaa-muted mt-0.5">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>

            {/* ══════════════════════════════
                DESKTOP main content
            ══════════════════════════════ */}
            <div className="hidden lg:block flex-1 min-w-0 space-y-5">
                <div>
                    <h2 className="text-lg font-bold text-avaa-dark">{title}</h2>
                    <p className="text-sm text-avaa-muted mt-0.5">{subtitle}</p>
                </div>
                {children}
            </div>
        </div>
    );
}