import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, router, usePage } from '@inertiajs/react';
import { PageProps, AppNotification } from '@/types';

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const IcoBell = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);
const IcoCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IcoTrash = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
    </svg>
);
const IcoBriefcase = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IcoShield = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IcoMsg = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
);
const IcoUser = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IcoRejected = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
        <line x1="15.5" y1="8.5" x2="8.5" y2="15.5" />
    </svg>
);
const IcoBellOff = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function safeRoute(name: string, params?: Record<string, unknown>): string {
    try { return route(name, params); } catch { return '#'; }
}

/**
 * Maps a notification type class name to an icon + colour.
 * Add new types here as the codebase grows.
 */
function resolveIcon(type: string) {
    if (type.includes('Rejected')) return { icon: <IcoRejected />, color: 'bg-rose-100 text-rose-600' };
    if (type.includes('Interview')) return { icon: <IcoBriefcase />, color: 'bg-purple-100 text-purple-500' };
    if (type.includes('Application')) return { icon: <IcoBriefcase />, color: 'bg-blue-100 text-blue-500' };
    if (type.includes('Message')) return { icon: <IcoMsg />, color: 'bg-green-100 text-green-600' };
    if (type.includes('Verified')) return { icon: <IcoShield />, color: 'bg-avaa-primary-light text-avaa-teal' };
    if (type.includes('User')) return { icon: <IcoUser />, color: 'bg-orange-100 text-orange-500' };
    return { icon: <IcoBell />, color: 'bg-gray-100 text-avaa-muted' };
}

/**
 * Maps a notification type to a URL to navigate to on click.
 * Extend this as more notification types are added.
 */
function resolveLink(notification: AppNotification, role: string): string {
    const { type, data } = notification;

    // If the backend explicitly sent a link, use it
    if (data.link) return data.link;

    if (type.includes('Interview') && role === 'job_seeker')
        return safeRoute('job-seeker.jobs.browse');
    if (type.includes('Interview') && role === 'employer')
        return safeRoute('employer.interviews.index');
    if (type.includes('Application') && role === 'employer')
        return safeRoute('employer.jobs.index');
    if (type.includes('Application') && role === 'job_seeker')
        return safeRoute('job-seeker.jobs.browse');
    if (type.includes('Message'))
        return safeRoute('messages.index');
    if (type.includes('Verified') && role === 'employer')
        return safeRoute('employer.dashboard');
    if (type.includes('User') && role === 'admin')
        return safeRoute('admin.users.index');
    if ((type.includes('Job') || type.includes('Jobs')) && role === 'admin')
        return safeRoute('admin.jobs.index');

    return safeRoute('notifications.index');
}

/* ─── NotificationItem ───────────────────────────────────────────────────── */
function NotificationItem({
    notification,
    role,
    onMarkRead,
    onDelete,
    onClose,
}: {
    notification: AppNotification;
    role: string;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}) {
    const isUnread = !notification.read_at;
    const { icon, color } = resolveIcon(notification.type);
    const link = resolveLink(notification, role);

    const handleClick = () => {
        if (isUnread) onMarkRead(notification.id);
        onClose();
        router.visit(link);
    };

    return (
        <div className={`group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50
            ${isUnread ? 'bg-avaa-primary-light/40 border-l-2 border-avaa-primary' : ''}`}
        >
            {/* Type icon */}
            <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
                {icon}
            </div>

            {/* Text — clickable area */}
            <button onClick={handleClick} className="flex-1 min-w-0 text-left cursor-pointer">
                <p className={`text-[13px] leading-snug ${isUnread ? 'font-semibold text-avaa-dark' : 'font-medium text-avaa-text'}`}>
                    {notification.data.message}
                </p>
                <p className="text-[11px] text-avaa-muted mt-0.5">{notification.time_ago}</p>
            </button>

            {/* Actions — only visible on hover */}
            <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isUnread && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
                        className="p-1 rounded-lg hover:bg-avaa-primary-light text-avaa-muted hover:text-avaa-teal transition-colors"
                        title="Mark as read"
                    >
                        <IcoCheck />
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                    className="p-1 rounded-lg hover:bg-red-50 text-avaa-muted hover:text-red-400 transition-colors"
                    title="Delete"
                >
                    <IcoTrash />
                </button>
            </div>

            {/* Unread dot */}
            {isUnread && (
                <span className="absolute top-3.5 right-[3.5rem] w-1.5 h-1.5 rounded-full bg-avaa-primary flex-shrink-0" />
            )}
        </div>
    );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function NotificationDropdown() {
    const { auth, unreadNotificationsCount: initialUnread } = usePage<PageProps>().props;
    const role = auth.user?.role ?? '';

    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(initialUnread);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /* ── Click-outside closes (button or panel = don't close) ── */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (ref.current?.contains(target) || panelRef.current?.contains(target)) return;
            setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Any scroll closes the dropdown (all devices) ── */
    useEffect(() => {
        if (!open) return;
        const onScroll = () => setOpen(false);
        window.addEventListener('scroll', onScroll, true);
        return () => window.removeEventListener('scroll', onScroll, true);
    }, [open]);

    /* ── Fetch notifications from server ── */
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch(safeRoute('notifications.fetch') + '?limit=5', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            if (!res.ok) return;
            const json = await res.json();
            setNotifications(json.notifications ?? []);
            setUnreadCount(json.unread_count ?? 0);
        } catch {
            // silently swallow network errors
        }
    }, []);

    /* ── Poll every 30s for badge freshness ── */
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(safeRoute('notifications.fetch') + '?limit=0', {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                });
                if (res.ok) {
                    const json = await res.json();
                    setUnreadCount(json.unread_count ?? 0);
                }
            } catch { /* ignore */ }
        })();

        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch(safeRoute('notifications.fetch') + '?limit=0', {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                });
                if (res.ok) {
                    const json = await res.json();
                    setUnreadCount(json.unread_count ?? 0);
                }
            } catch { /* ignore */ }
        }, 30_000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    /* ── Open → fetch latest ── */
    const handleToggle = () => {
        const next = !open;
        setOpen(next);
        if (next) {
            setLoading(true);
            fetchNotifications().finally(() => setLoading(false));
        }
    };

    /* ── Actions ── */
    const markRead = async (id: string) => {
        await fetch(safeRoute('notifications.read', { id }), {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
            },
            credentials: 'same-origin',
        });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        setUnreadCount(c => Math.max(0, c - 1));
    };

    const deleteOne = async (id: string) => {
        const wasUnread = !notifications.find(n => n.id === id)?.read_at;
        await fetch(safeRoute('notifications.destroy', { id }), {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
            },
            credentials: 'same-origin',
        });
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (wasUnread) setUnreadCount(c => Math.max(0, c - 1));
    };

    const markAllRead = async () => {
        await fetch(safeRoute('notifications.mark-all-read'), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
            },
            credentials: 'same-origin',
        });
        setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        setUnreadCount(0);
    };

    return (
        <div ref={ref} className="relative flex-shrink-0">
            {/* Bell button */}
            <button
                onClick={handleToggle}
                className="relative p-2.5 rounded-xl hover:bg-avaa-primary-light text-avaa-muted hover:text-avaa-teal transition-colors"
                aria-label="Notifications"
                aria-haspopup="true"
                aria-expanded={open}
            >
                <IcoBell />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] rounded-full bg-red-400 ring-2 ring-white
                        flex items-center justify-center text-[9px] font-bold text-white px-0.5">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown: portal; always opens from top bar (all devices) */}
            {open && createPortal(
                <>
                    {/* Backdrop; tap to close */}
                    <div
                        className="fixed inset-0 z-[99] bg-black/30"
                        onClick={() => setOpen(false)}
                        aria-hidden
                    />
                    {/* Panel: top-aligned dropdown (mobile + desktop) */}
                    <div
                        ref={panelRef}
                        className="fixed z-[100] top-20 left-3 right-3 max-h-[70vh]
                            sm:left-auto sm:right-4 sm:w-[340px]
                            bg-white border border-gray-200 shadow-xl
                            flex flex-col overflow-hidden rounded-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-avaa-dark">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-avaa-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-[11px] font-semibold text-avaa-teal hover:text-avaa-primary-hover transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-50">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <svg className="animate-spin w-5 h-5 text-avaa-primary" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
                                    <span className="text-avaa-muted"><IcoBellOff /></span>
                                    <p className="text-sm font-semibold text-avaa-dark">You're all caught up!</p>
                                    <p className="text-xs text-avaa-muted">No notifications yet.</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        role={role}
                                        onMarkRead={markRead}
                                        onDelete={deleteOne}
                                        onClose={() => setOpen(false)}
                                    />
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 px-4 py-2.5 flex-shrink-0 bg-white">
                            <Link
                                href={safeRoute('notifications.index')}
                                onClick={() => setOpen(false)}
                                className="block text-center text-xs font-semibold text-avaa-teal hover:text-avaa-primary-hover transition-colors py-0.5"
                            >
                                View all notifications →
                            </Link>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}
