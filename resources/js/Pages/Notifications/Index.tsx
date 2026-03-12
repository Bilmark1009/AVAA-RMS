import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { AppNotification, PageProps } from '@/types';
import { useState } from 'react';

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const IcoBell = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);
const IcoBriefcase = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IcoShield = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IcoMsg = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
);
const IcoUser = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IcoRejected = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
        <line x1="15.5" y1="8.5" x2="8.5" y2="15.5" />
    </svg>
);
const IcoTrash = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
);
const IcoCheckAll = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
        <polyline points="12 6 7 11" />
    </svg>
);
const IcoUnread = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
    </svg>
);

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function safeRoute(name: string, params?: Record<string, unknown>): string {
    try { return route(name, params); } catch { return '#'; }
}

function resolveIcon(type: string) {
    if (type.includes('Rejected')) return { icon: <IcoRejected />, color: 'bg-rose-100 text-rose-600' };
    if (type.includes('Interview')) return { icon: <IcoBriefcase />, color: 'bg-purple-100 text-purple-500' };
    if (type.includes('Application')) return { icon: <IcoBriefcase />, color: 'bg-blue-100 text-blue-500' };
    if (type.includes('Message')) return { icon: <IcoMsg />, color: 'bg-green-100 text-green-600' };
    if (type.includes('Verified')) return { icon: <IcoShield />, color: 'bg-avaa-primary-light text-avaa-teal' };
    if (type.includes('Job')) return { icon: <IcoBriefcase />, color: 'bg-indigo-100 text-indigo-500' };
    if (type.includes('User')) return { icon: <IcoUser />, color: 'bg-orange-100 text-orange-500' };
    return { icon: <IcoBell />, color: 'bg-gray-100 text-avaa-muted' };
}

function resolveLink(notification: AppNotification, role: string): string {
    const { type, data } = notification;
    if (data.link) return data.link as string;

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

    return '#';
}

/* ─── Type ────────────────────────────────────────────────────────────────── */
interface PaginationLink { url: string | null; label: string; active: boolean; }

interface PaginatedNotifications {
    data: AppNotification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    notifications: PaginatedNotifications;
}

/* ─── Confirmation Dialog ─────────────────────────────────────────────────── */
function ConfirmDialog({
    title, body, confirmLabel, confirmClass, onCancel, onConfirm,
}: {
    title: string; body: string; confirmLabel: string; confirmClass: string;
    onCancel: () => void; onConfirm: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm p-6">
                <h3 className="text-base font-bold text-avaa-dark mb-1">{title}</h3>
                <p className="text-sm text-avaa-muted mb-5">{body}</p>
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel}
                        className="px-4 py-2 text-sm font-semibold text-avaa-muted rounded-xl hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-semibold rounded-xl text-white transition-colors ${confirmClass}`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Row ─────────────────────────────────────────────────────────────────── */
function NotifRow({
    notification, role,
    onRead, onUnread, onDelete,
}: {
    notification: AppNotification; role: string;
    onRead: (id: string) => void;
    onUnread: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const isUnread = !notification.read_at;
    const { icon, color } = resolveIcon(notification.type);
    const link = resolveLink(notification, role);

    const handleNavigate = () => {
        if (isUnread) onRead(notification.id);
        if (link !== '#') router.visit(link);
    };

    return (
        <div className={`group flex items-start gap-4 px-6 py-4 transition-all border-b border-gray-100 last:border-b-0
            ${isUnread ? 'bg-avaa-primary-light/30 border-l-4 border-l-avaa-primary' : 'hover:bg-gray-50'}`}>

            {/* Icon */}
            <div className={`mt-0.5 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <button onClick={handleNavigate} className="text-left w-full cursor-pointer group/text">
                    <p className={`text-sm leading-snug group-hover/text:text-avaa-teal transition-colors
                        ${isUnread ? 'font-semibold text-avaa-dark' : 'font-medium text-avaa-text'}`}>
                        {notification.data.message}
                    </p>
                    {link !== '#' && (
                        <p className="text-xs text-avaa-teal mt-0.5 opacity-0 group-hover/text:opacity-100 transition-opacity">
                            Click to view →
                        </p>
                    )}
                </button>
                <p className="text-xs text-avaa-muted mt-1">{notification.time_ago}</p>
            </div>

            {/* Status badge */}
            <div className="flex-shrink-0 flex items-center gap-1 mt-0.5">
                {isUnread && (
                    <span className="text-[10px] font-bold text-avaa-primary bg-avaa-primary-light px-2 py-0.5 rounded-full">
                        NEW
                    </span>
                )}

                {/* Action buttons — show on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                    {isUnread ? (
                        <button onClick={() => onRead(notification.id)}
                            title="Mark as read"
                            className="p-1.5 rounded-lg hover:bg-avaa-primary-light text-avaa-muted hover:text-avaa-teal transition-colors">
                            <IcoCheckAll />
                        </button>
                    ) : (
                        <button onClick={() => onUnread(notification.id)}
                            title="Mark as unread"
                            className="p-1.5 rounded-lg hover:bg-avaa-primary-light text-avaa-muted hover:text-avaa-teal transition-colors">
                            <IcoUnread />
                        </button>
                    )}
                    <button onClick={() => onDelete(notification.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-avaa-muted hover:text-red-400 transition-colors">
                        <IcoTrash />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Empty State ─────────────────────────────────────────────────────────── */
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-avaa-primary-light flex items-center justify-center text-avaa-teal mb-4">
                <IcoBell />
            </div>
            <h3 className="text-base font-bold text-avaa-dark mb-1">All caught up!</h3>
            <p className="text-sm text-avaa-muted max-w-xs">
                You don't have any notifications yet. They'll appear here when there's something new.
            </p>
        </div>
    );
}

/* ─── Pagination ──────────────────────────────────────────────────────────── */
function Pagination({ links }: { links: PaginationLink[] }) {
    const visible = links.filter(l => l.label !== '&laquo; Previous' && l.label !== 'Next &raquo;');
    const prev = links.find(l => l.label === '&laquo; Previous');
    const next = links.find(l => l.label === 'Next &raquo;');

    if (links.length <= 3) return null; // only prev/next + 1 page

    return (
        <div className="flex items-center justify-center gap-1 pt-4">
            <button
                disabled={!prev?.url}
                onClick={() => prev?.url && router.visit(prev.url, { preserveScroll: true })}
                className="px-3 py-2 text-xs font-semibold rounded-xl text-avaa-muted hover:bg-avaa-primary-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                ← Previous
            </button>
            {visible.map(link => (
                <button
                    key={link.label}
                    onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                    className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors
                        ${link.active
                            ? 'bg-avaa-primary text-white shadow-sm'
                            : 'text-avaa-muted hover:bg-avaa-primary-light'}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
            <button
                disabled={!next?.url}
                onClick={() => next?.url && router.visit(next.url, { preserveScroll: true })}
                className="px-3 py-2 text-xs font-semibold rounded-xl text-avaa-muted hover:bg-avaa-primary-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                Next →
            </button>
        </div>
    );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function NotificationsIndex({ notifications }: Props) {
    const { auth } = usePage<PageProps>().props;
    const role = auth.user?.role ?? '';

    const [items, setItems] = useState<AppNotification[]>(notifications.data);
    const [confirm, setConfirm] = useState<'delete-all' | null>(null);
    const [processing, setProcessing] = useState(false);

    const unread = items.filter(n => !n.read_at).length;

    const csrf = () =>
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

    async function apiPatch(url: string) {
        return fetch(url, {
            method: 'PATCH',
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': csrf() },
            credentials: 'same-origin',
        });
    }
    async function apiPost(url: string) {
        return fetch(url, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': csrf() },
            credentials: 'same-origin',
        });
    }
    async function apiDelete(url: string) {
        return fetch(url, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': csrf() },
            credentials: 'same-origin',
        });
    }

    const handleRead = async (id: string) => {
        await apiPatch(safeRoute('notifications.read', { id }));
        setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    };

    const handleUnread = async (id: string) => {
        await apiPatch(safeRoute('notifications.unread', { id }));
        setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: null } : n));
    };

    const handleDelete = async (id: string) => {
        await apiDelete(safeRoute('notifications.destroy', { id }));
        setItems(prev => prev.filter(n => n.id !== id));
    };

    const handleMarkAllRead = async () => {
        setProcessing(true);
        await apiPost(safeRoute('notifications.mark-all-read'));
        setItems(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        setProcessing(false);
    };

    const handleDeleteAll = async () => {
        setProcessing(true);
        await apiDelete(safeRoute('notifications.destroy-all'));
        setItems([]);
        setConfirm(null);
        setProcessing(false);
    };

    return (
        <>
            <Head title="Notifications" />
            <AppLayout pageTitle="Notifications" pageSubtitle="Stay on top of important updates and alerts." activeNav="Notifications">

                {/* Confirm modal */}
                {confirm === 'delete-all' && (
                    <ConfirmDialog
                        title="Delete all notifications?"
                        body="This will permanently remove all notifications. This action cannot be undone."
                        confirmLabel={processing ? 'Deleting…' : 'Delete All'}
                        confirmClass="bg-red-500 hover:bg-red-600"
                        onCancel={() => setConfirm(null)}
                        onConfirm={handleDeleteAll}
                    />
                )}

                <div className="max-w-3xl mx-auto">

                    {/* ── Toolbar ── */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs text-avaa-muted">
                                {notifications.total === 0
                                    ? 'No notifications'
                                    : `${notifications.total} notification${notifications.total !== 1 ? 's' : ''}${unread > 0 ? ` · ${unread} unread` : ''}`}
                            </p>
                        </div>

                        {items.length > 0 && (
                            <div className="flex items-center gap-2">
                                {unread > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        disabled={processing}
                                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-avaa-teal bg-avaa-primary-light
                                            rounded-xl hover:bg-avaa-primary hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        <IcoCheckAll />
                                        Mark all as read
                                    </button>
                                )}
                                <button
                                    onClick={() => setConfirm('delete-all')}
                                    disabled={processing}
                                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-400 bg-red-50
                                        rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                    <IcoTrash />
                                    Delete all
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Notification list ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        {items.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <>
                                {items.map(notification => (
                                    <NotifRow
                                        key={notification.id}
                                        notification={notification}
                                        role={role}
                                        onRead={handleRead}
                                        onUnread={handleUnread}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </>
                        )}
                    </div>

                    {/* ── Pagination ── */}
                    {notifications.last_page > 1 && (
                        <Pagination links={notifications.links} />
                    )}
                </div>

            </AppLayout>
        </>
    );
}
