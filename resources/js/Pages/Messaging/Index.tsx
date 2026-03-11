import { useState, useEffect, useRef, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import BlockUserModal from './BlockUserModal';
import type { PageProps } from '@/types';
import axios from 'axios';

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */
interface Sender {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string | null;
    role: string;
}
interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    body: string;
    type: 'text' | 'file' | 'image' | 'system';
    attachment_url?: string | null;
    attachment_name?: string | null;
    created_at: string;
    sender: Sender;
}
interface ConversationSummary {
    id: number;
    type: 'direct' | 'group';
    name: string;
    avatar?: string | null;
    initials: string;
    other_user?: Sender | null;
    participants: Sender[];
    latest_message?: { body: string; sender_id: number; created_at: string } | null;
    unread_count: number;
    is_archived: boolean;
    is_muted: boolean;
    last_message_at?: string | null;
    job_listing?: { id: number; title: string } | null;
}
interface UserResult {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    initials: string;
    role: string;
    subtitle: string;
}
interface MessagingIndexPageProps extends PageProps {
    conversations: ConversationSummary[];
    activeConversationId: number | null;
    initialMessages: Message[];
    activeConversation: ConversationSummary | null;
auth: { user: any; session_id: string };
    unreadNotificationsCount: number;
    [key: string]: any;
}

/* ══════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════ */
const IcoSearch = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IcoSend = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);
const IcoAttach = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
);
const IcoMore = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
);
const IcoEdit = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const IcoUsers = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);
const IcoBriefcase = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IcoArchive = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
    </svg>
);
const IcoMute = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
);
const IcoBlock = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
);
const IcoFlag = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
);
const IcoTrash = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
);
const IcoBack = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const IcoClose = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const IcoMsg = () => (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
);
function IcoSpinner() {
    return <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />;
}

/* ══════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════ */
function timeAgo(iso: string): string {
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    const days = Math.floor(diff / 86400);
    if (days === 1) return 'Yesterday';
    if (days < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
function msgTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function groupByDate(messages: Message[]): { label: string; items: Message[] }[] {
    const map: Record<string, Message[]> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    for (const m of messages) {
        const ds = new Date(m.created_at).toDateString();
        const label = ds === today ? 'Today' : ds === yesterday ? 'Yesterday'
            : new Date(m.created_at).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        if (!map[label]) map[label] = [];
        map[label].push(m);
    }
    return Object.entries(map).map(([label, items]) => ({ label, items }));
}

/* ══════════════════════════════════════════════════════════
   AVATAR
══════════════════════════════════════════════════════════ */
function Avatar({ src, initials, size = 'md', online }: {
    src?: string | null; initials: string; size?: 'xs' | 'sm' | 'md' | 'lg'; online?: boolean;
}) {
    const sz = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }[size];
    return (
        <div className="relative flex-shrink-0">
            <div className={`${sz} rounded-full bg-avaa-dark flex items-center justify-center text-white font-bold overflow-hidden`}>
                {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : initials}
            </div>
            {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   NEW MESSAGE MODAL
══════════════════════════════════════════════════════════ */
function NewMessageModal({ onClose, onStart }: {
    onClose: () => void;
    onStart: (userId: number) => void;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [starting, setStarting] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        fetchUsers('');
    }, []);

    const fetchUsers = async (q: string) => {
        setLoading(true);
        try {
            const res = await axios.get(route('messages.search-users'), { params: { q } });
            setResults(res.data);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchUsers(val), 300);
    };

    const handleStart = (userId: number) => {
        setStarting(userId);
        onStart(userId);
    };

    const handleBackdrop = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) onClose();
    };

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdrop}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="text-[15px] font-bold text-avaa-dark">New Message</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-avaa-muted transition-colors"
                    >
                        <IcoClose />
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 h-10 focus-within:border-avaa-primary/50 focus-within:bg-white transition-all">
                        <span className="text-avaa-muted flex-shrink-0"><IcoSearch /></span>
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={handleInput}
                            placeholder="Search by name or email..."
                            className="flex-1 bg-transparent text-[13.5px] text-avaa-dark placeholder-avaa-muted outline-none border-0"
                        />
                        {loading && (
                            <span className="text-avaa-muted flex-shrink-0"><IcoSpinner /></span>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="overflow-y-auto max-h-72">
                    {!loading && results.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-[13px] text-avaa-muted">
                                {query ? 'No users found matching your search' : 'No users available to message'}
                            </p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {results.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => handleStart(user.id)}
                                    disabled={starting !== null}
                                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-avaa-primary-light transition-colors text-left disabled:opacity-60"
                                >
                                    <Avatar src={user.avatar} initials={user.initials} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13.5px] font-semibold text-avaa-dark truncate">{user.name}</p>
                                        <p className="text-[12px] text-avaa-muted truncate">{user.subtitle}</p>
                                    </div>
                                    {starting === user.id ? (
                                        <span className="text-avaa-primary flex-shrink-0"><IcoSpinner /></span>
                                    ) : (
                                        <span className={`text-[11px] font-semibold flex-shrink-0 px-2 py-0.5 rounded-full
                                            ${user.role === 'employer'
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'bg-avaa-primary-light text-avaa-primary'
                                            }`}>
                                            {user.role === 'job_seeker' ? 'Job Seeker' : 'Employer'}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   CONVERSATION ROW
══════════════════════════════════════════════════════════ */
function ConvoRow({ convo, active, currentUserId, onClick }: {
    convo: ConversationSummary; active: boolean; currentUserId: number; onClick: () => void;
}) {
    const preview = convo.latest_message
        ? (convo.latest_message.sender_id === currentUserId ? 'You: ' : '') +
        convo.latest_message.body.slice(0, 52) + (convo.latest_message.body.length > 52 ? '…' : '')
        : 'Start the conversation';

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-all rounded-xl group
                ${active ? 'bg-avaa-primary-light border border-avaa-primary/20' : 'hover:bg-gray-50 border border-transparent'}`}
        >
            <Avatar src={convo.avatar} initials={convo.initials} size="md" online={convo.type === 'direct'} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                    <span className={`text-[13.5px] truncate ${active || convo.unread_count > 0 ? 'font-bold text-avaa-dark' : 'font-semibold text-gray-700'}`}>
                        {convo.name}
                    </span>
                    {convo.latest_message?.created_at && (
                        <span className="text-[11px] text-avaa-muted flex-shrink-0 ml-1">
                            {timeAgo(convo.latest_message.created_at)}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className={`text-[12px] truncate ${convo.unread_count > 0 ? 'text-avaa-dark font-medium' : 'text-avaa-muted'}`}>
                        {preview}
                    </p>
                    {convo.unread_count > 0 && (
                        <span className="flex-shrink-0 min-w-[18px] h-[18px] bg-avaa-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {convo.unread_count > 9 ? '9+' : convo.unread_count}
                        </span>
                    )}
                </div>
                {convo.type === 'group' && convo.job_listing && (
                    <span className="inline-flex items-center gap-1 mt-0.5 text-[11px] text-avaa-primary font-medium">
                        <IcoBriefcase /> {convo.job_listing.title}
                    </span>
                )}
            </div>
        </button>
    );
}

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
function useToast() {
    const [msg, setMsg] = useState<string | null>(null);
    const show = (text: string) => {
        setMsg(text);
        setTimeout(() => setMsg(null), 2500);
    };
    const Toast = msg ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-avaa-dark text-white text-[13px] font-medium px-5 py-2.5 rounded-xl shadow-lg animate-fade-in">
            {msg}
        </div>
    ) : null;
    return { show, Toast };
}

/* ══════════════════════════════════════════════════════════
   CONTEXT MENU
══════════════════════════════════════════════════════════ */
function ContextMenu({ onArchive, onMute, onDelete, onDeleteGroup, onReport, onBlock, onClose, isMuted, isGroup, isEmployer, showToast }: {
    onArchive: () => void; onMute: () => void; onDelete: () => void; onDeleteGroup: () => void; onReport: () => void; onBlock: () => void;
    onClose: () => void; isMuted: boolean; isGroup: boolean; isEmployer: boolean; showToast: (msg: string) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, [onClose]);

    return (
        <div ref={ref} className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl border border-gray-200 shadow-lg z-50 py-1.5 overflow-hidden">
            {[
                { icon: <IcoMute />, label: isMuted ? 'Unmute Notification' : 'Mute Notification', action: () => { onMute(); onClose(); } },
                { icon: <IcoArchive />, label: 'Archive Conversation', action: () => { onArchive(); onClose(); } },
                { icon: <IcoBlock />, label: 'Block', action: () => { onBlock(); onClose(); } },
                { icon: <IcoFlag />, label: 'Report', action: () => { onReport(); onClose(); } },
            ].map(item => (
                <button key={item.label} onClick={item.action}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-avaa-text hover:bg-avaa-primary-light transition-colors">
                    <span className="text-avaa-muted">{item.icon}</span>
                    {item.label}
                </button>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
                {isGroup && isEmployer && (
                    <button onClick={() => { onDeleteGroup(); onClose(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors">
                        <IcoTrash /> Delete Group for Everyone
                    </button>
                )}
                {!isGroup && (
                    <button onClick={() => { onDelete(); onClose(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors">
                        <IcoTrash /> Delete Conversation
                    </button>
                )}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   MESSAGE BUBBLE
══════════════════════════════════════════════════════════ */
function Bubble({ msg, isOwn, showAvatar }: { msg: Message; isOwn: boolean; showAvatar: boolean }) {
    if (msg.type === 'system') {
        return (
            <div className="flex justify-center my-3">
                <span className="bg-avaa-primary-light text-avaa-primary text-[11.5px] font-medium px-4 py-1.5 rounded-full border border-avaa-primary/15">
                    {msg.body}
                </span>
            </div>
        );
    }
    return (
        <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="w-7 flex-shrink-0 mb-1">
                {!isOwn && showAvatar && (
                    <Avatar src={msg.sender.avatar} initials={`${msg.sender.first_name[0]}${msg.sender.last_name[0]}`} size="xs" />
                )}
            </div>
            <div className={`max-w-[62%] flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && showAvatar && (
                    <span className="text-[11px] text-avaa-muted ml-1">{msg.sender.first_name}</span>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed break-words
                    ${isOwn
                        ? 'bg-avaa-primary text-white rounded-br-sm'
                        : 'bg-white text-avaa-dark border border-gray-100 shadow-sm rounded-bl-sm'
                    }`}>
                    {msg.type === 'image' && msg.attachment_url ? (
                        <img src={msg.attachment_url} alt="attachment" className="max-w-[220px] rounded-xl" />
                    ) : msg.type === 'file' && msg.attachment_url ? (
                        <a href={msg.attachment_url} download={msg.attachment_name}
                            className={`flex items-center gap-2 underline underline-offset-2 ${isOwn ? 'text-white/90' : 'text-avaa-primary'}`}>
                            <IcoAttach />
                            {msg.attachment_name ?? 'Download'}
                        </a>
                    ) : msg.body}
                </div>
                <span className="text-[10.5px] text-avaa-muted">{msgTime(msg.created_at)}</span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   NEW GROUP MODAL (employer only)
══════════════════════════════════════════════════════════ */
function NewGroupModal({ onClose, onCreated }: {
    onClose: () => void;
    onCreated: (convos: ConversationSummary[], activeConvo: ConversationSummary | null, messages: Message[]) => void;
}) {
    const [name, setName] = useState('');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserResult[]>([]);
    const [selected, setSelected] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => { fetchUsers(''); }, []);

    const fetchUsers = async (q: string) => {
        setLoading(true);
        try {
            const res = await axios.get(route('messages.search-users'), { params: { q } });
            setResults(res.data);
        } catch { setResults([]); }
        finally { setLoading(false); }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchUsers(val), 300);
    };

    const toggleUser = (user: UserResult) => {
        setSelected(prev =>
            prev.find(u => u.id === user.id)
                ? prev.filter(u => u.id !== user.id)
                : [...prev, user]
        );
    };

    const handleCreate = () => {
        if (!name.trim() || selected.length === 0) return;
        setCreating(true);
        router.post(
            route('messages.start-group'),
            {
                name: name.trim(),
                participant_ids: selected.map(u => u.id),
            },
            {
                onSuccess: (page: any) => {
                    const p = page.props as any;
                    onCreated(p.conversations ?? [], p.activeConversation ?? null, p.initialMessages ?? []);
                    onClose();
                },
                onError: () => {
                    setCreating(false); // reset spinner so user can retry
                },
            }
        );
    };

    return (
        <div ref={backdropRef} onClick={e => { if (e.target === backdropRef.current) onClose(); }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="text-[15px] font-bold text-avaa-dark">New Group Chat</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-avaa-muted transition-colors">
                        <IcoClose />
                    </button>
                </div>

                <div className="px-5 py-3 border-b border-gray-100 space-y-2">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Group name..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 h-10 text-[13.5px] text-avaa-dark placeholder-avaa-muted outline-none focus:border-avaa-primary/50 focus:bg-white transition-all" />
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 h-10 focus-within:border-avaa-primary/50 focus-within:bg-white transition-all">
                        <span className="text-avaa-muted flex-shrink-0"><IcoSearch /></span>
                        <input value={query} onChange={handleInput} placeholder="Add participants..."
                            className="flex-1 bg-transparent text-[13.5px] text-avaa-dark placeholder-avaa-muted outline-none border-0" />
                    </div>
                </div>

                {/* Selected chips */}
                {selected.length > 0 && (
                    <div className="px-5 py-2 flex flex-wrap gap-1.5 border-b border-gray-100">
                        {selected.map(u => (
                            <span key={u.id} className="inline-flex items-center gap-1 bg-avaa-primary-light text-avaa-dark text-[12px] font-medium px-2.5 py-1 rounded-full">
                                {u.name}
                                <button onClick={() => toggleUser(u)} className="text-avaa-muted hover:text-red-500 transition-colors">×</button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="overflow-y-auto max-h-52">
                    {!loading && results.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-[13px] text-avaa-muted">No users found</p>
                        </div>
                    ) : (
                        <div className="py-1">
                            {results.map(user => {
                                const isSelected = selected.some(u => u.id === user.id);
                                return (
                                    <button key={user.id} onClick={() => toggleUser(user)}
                                        className={`w-full flex items-center gap-3 px-5 py-2.5 hover:bg-avaa-primary-light transition-colors text-left
                                            ${isSelected ? 'bg-avaa-primary-light' : ''}`}>
                                        <Avatar src={user.avatar} initials={user.initials} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-avaa-dark truncate">{user.name}</p>
                                            <p className="text-[11.5px] text-avaa-muted truncate">{user.subtitle}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                                            ${isSelected ? 'bg-avaa-primary border-avaa-primary' : 'border-gray-300'}`}>
                                            {isSelected && <span className="text-white text-[11px] font-bold">✓</span>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-avaa-muted hover:text-avaa-dark transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleCreate}
                        disabled={!name.trim() || selected.length === 0 || creating}
                        className="px-5 py-2 bg-avaa-primary hover:bg-avaa-dark disabled:opacity-40 text-white text-[13px] font-semibold rounded-xl transition-colors">
                        {creating ? <IcoSpinner /> : `Create Group (${selected.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   EMPTY CHAT STATE
══════════════════════════════════════════════════════════ */
function EmptyChat({ onNewMessage }: { onNewMessage: () => void }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
            <div className="w-20 h-20 rounded-3xl bg-avaa-primary-light flex items-center justify-center text-avaa-primary">
                <IcoMsg />
            </div>
            <div>
                <p className="text-[15px] font-semibold text-avaa-dark">No conversation selected</p>
                <p className="text-[13px] text-avaa-muted mt-1 max-w-[220px] leading-relaxed">
                    Select a conversation from the list or start a new one
                </p>
            </div>
            <button
                onClick={onNewMessage}
                className="mt-1 px-5 py-2.5 bg-avaa-primary hover:bg-avaa-dark text-white text-[13.5px] font-semibold rounded-xl transition-colors"
            >
                Start a Conversation
            </button>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function MessagingIndex({
    conversations: initConvos,
    activeConversationId: initActiveId,
    initialMessages: initMsgs,
    activeConversation: initActive,
    unreadNotificationsCount,
}: {
    conversations: ConversationSummary[];
    activeConversationId: number | null;
    initialMessages: Message[];
    activeConversation: ConversationSummary | null;
    unreadNotificationsCount: number;
}) {
const [showBlockModal, setShowBlockModal] = useState(false);
    const [blocking, setBlocking] = useState(false);

    const { auth } = usePage<PageProps>().props;
    const me = auth.user;

    const [convos, setConvos] = useState<ConversationSummary[]>(initConvos);
    const [activeConvo, setActiveConvo] = useState<ConversationSummary | null>(initActive);
    const [messages, setMessages] = useState<Message[]>(initMsgs);
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [tab, setTab] = useState<'all' | 'archived'>('all');
    const [mobileView, setMobileView] = useState<'list' | 'chat'>(initActiveId ? 'chat' : 'list');
    const [loadingConvo, setLoadingConvo] = useState(false);
    const [showNewMsg, setShowNewMsg] = useState(false);
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showComposeMenu, setShowComposeMenu] = useState(false);
    const toast = useToast();
    const composeRef = useRef<HTMLDivElement>(null);
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastMsgId = useRef<number>(initMsgs.length > 0 ? initMsgs[initMsgs.length - 1].id : 0);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    useEffect(() => {
        if (messages.length > 0) lastMsgId.current = messages[messages.length - 1].id;
    }, [messages]);

    /* ── Polling ── */
    const startPolling = useCallback((convoId: number) => {
        if (pollTimer.current) clearInterval(pollTimer.current);
        pollTimer.current = setInterval(async () => {
            try {
                const res = await axios.get(route('messages.poll', convoId), {
                    params: { after_id: lastMsgId.current },
                });
                const newMsgs: Message[] = res.data.messages;
                if (newMsgs.length > 0) {
                    setMessages(prev => {
                        const ids = new Set(prev.map(m => m.id));
                        const fresh = newMsgs.filter(m => !ids.has(m.id));
                        return fresh.length > 0 ? [...prev, ...fresh] : prev;
                    });
                    const last = newMsgs[newMsgs.length - 1];
                    setConvos(prev => prev.map(c =>
                        c.id === convoId
                            ? { ...c, latest_message: { body: last.body, sender_id: last.sender_id, created_at: last.created_at }, last_message_at: last.created_at }
                            : c
                    ));
                }
            } catch { /* silent */ }
        }, 3000);
    }, []);

    const stopPolling = useCallback(() => {
        if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; }
    }, []);

    useEffect(() => {
        if (activeConvo) startPolling(activeConvo.id);
        return stopPolling;
    }, [activeConvo?.id]);
    useEffect(() => () => stopPolling(), []);

    /* ── Open conversation ── */
    const openConvo = useCallback((convo: ConversationSummary) => {
        if (activeConvo?.id === convo.id) { setMobileView('chat'); return; }
        setLoadingConvo(true);
        stopPolling();
        router.visit(route('messages.show', convo.id), {
            only: ['initialMessages', 'activeConversation', 'conversations', 'activeConversationId'],
            preserveState: true,
            onSuccess: (page: any) => {
                const p = page.props as any;
                setMessages(p.initialMessages ?? []);
                setActiveConvo(p.activeConversation ?? null);
                setConvos(p.conversations ?? convos);
                lastMsgId.current = p.initialMessages?.length > 0
                    ? p.initialMessages[p.initialMessages.length - 1].id : 0;
                setConvos(prev => prev.map(c => c.id === convo.id ? { ...c, unread_count: 0 } : c));
                setMobileView('chat');
                setLoadingConvo(false);
            },
            onError: () => setLoadingConvo(false),
        });
    }, [activeConvo?.id, convos, stopPolling]);

    /* ── Group created callback ── */
    const handleGroupCreated = useCallback((
        updatedConvos: ConversationSummary[],
        newActive: ConversationSummary | null,
        newMessages: Message[]
    ) => {
        setConvos(updatedConvos);
        setActiveConvo(newActive);
        setMessages(newMessages);
        lastMsgId.current = newMessages.length > 0
            ? newMessages[newMessages.length - 1].id
            : 0;
        setMobileView('chat');
        setShowNewGroup(false);
    }, []);

    /* ── Start new conversation (FIXED) ── */
    const handleStartConversation = useCallback((userId: number) => {
        setShowNewMsg(false);
        router.post(
            route('messages.start'),
            { user_id: userId },
            {
                onSuccess: (page: any) => {
                    const p = page.props as any;
                    const updatedConvos: ConversationSummary[] = p.conversations ?? [];
                    const newActive: ConversationSummary | null = p.activeConversation ?? null;
                    const newMessages: Message[] = p.initialMessages ?? [];

                    setConvos(updatedConvos);
                    setActiveConvo(newActive);
                    setMessages(newMessages);
                    lastMsgId.current = newMessages.length > 0
                        ? newMessages[newMessages.length - 1].id
                        : 0;
                    setMobileView('chat');
                },
            }
        );
    }, []);

    /* ── Send message ── */
    const sendMsg = useCallback(async () => {
        if (!activeConvo || (!body.trim() && !fileRef.current?.files?.length)) return;
        setSending(true);
        try {
            const fd = new FormData();
            if (body.trim()) fd.append('body', body.trim());
            if (fileRef.current?.files?.[0]) fd.append('attachment', fileRef.current.files[0]);
            const res = await axios.post(route('messages.send', activeConvo.id), fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const msg: Message = res.data;
            setMessages(prev => [...prev, msg]);
            setBody('');
            if (fileRef.current) fileRef.current.value = '';
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
            setConvos(prev => {
                const exists = prev.some(c => c.id === activeConvo.id);
                const updated = {
                    ...activeConvo,
                    latest_message: { body: msg.body, sender_id: me.id, created_at: msg.created_at },
                    last_message_at: msg.created_at,
                    unread_count: 0,
                    // ✅ Unarchive optimistically — mirrors Messenger behaviour where
                    // sending a message into an archived chat moves it back to All tab
                    is_archived: false,
                };
                if (!exists) return [updated, ...prev];
                return prev.map(c => c.id === activeConvo.id ? updated : c);
            });
        } catch { /* handle error */ }
        finally { setSending(false); }
    }, [activeConvo, body, me.id]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
    };

    const archiveConvo = async (id: number) => {
        await axios.post(route('messages.archive', id));
        setConvos(prev => prev.map(c => c.id === id ? { ...c, is_archived: true } : c));
    };
    const muteConvo = async (id: number) => {
        try {
            const res = await axios.post(route('messages.mute', id));
            const nowMuted = res.data.is_muted;
            setConvos(prev => prev.map(c => c.id === id ? { ...c, is_muted: nowMuted } : c));
            if (activeConvo?.id === id) setActiveConvo(prev => prev ? { ...prev, is_muted: nowMuted } : prev);
            toast.show(nowMuted ? 'Notifications muted' : 'Notifications unmuted');
        } catch { toast.show('Failed to update mute setting'); }
    };
    const deleteConvo = async (id: number) => {
        await axios.delete(route('messages.destroy', id));
        setConvos(prev => prev.filter(c => c.id !== id));
        if (activeConvo?.id === id) { setActiveConvo(null); setMessages([]); stopPolling(); }
    };

    const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<number | null>(null);

    const deleteGroup = async (id: number) => {
        try {
            await axios.delete(route('messages.destroy-group', id));
            setConvos(prev => prev.filter(c => c.id !== id));
            if (activeConvo?.id === id) { setActiveConvo(null); setMessages([]); stopPolling(); }
            toast.show('Group chat deleted for everyone');
        } catch {
            toast.show('Failed to delete group chat');
        } finally {
            setConfirmDeleteGroup(null);
        }
    };
    /* ── PLACE THE BLOCK HANDLER HERE ── */
    const handleBlockConfirm = async () => {
        if (!activeConvo?.other_user) return;
        setBlocking(true);
        try {
            // Replace with your actual backend block route
            await axios.post(route('messages.block', activeConvo.other_user.id));
            toast.show(`${activeConvo.name} has been blocked`);
            
            // Clean up: Remove the convo from the sidebar and clear chat
            const blockedId = activeConvo.id;
            setActiveConvo(null);
            setMessages([]);
            setConvos(prev => prev.filter(c => c.id !== blockedId));
            stopPolling();
        } catch (err) {
            toast.show('Failed to block user');
        } finally {
            setBlocking(false);
            setShowBlockModal(false);
        }
    };

    // Sidebar user search
    const handleSidebarSearch = (val: string) => {
        setSearchQuery(val);
        if (searchDebounce.current) clearTimeout(searchDebounce.current);
        if (!val.trim()) { setSearchResults([]); return; }
        searchDebounce.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await axios.get(route('messages.search-users'), { params: { q: val } });
                setSearchResults(res.data);
            } catch { setSearchResults([]); }
            finally { setSearchLoading(false); }
        }, 300);
    };

    const clearSearch = () => { setSearchQuery(''); setSearchResults([]); };

    const handleReportUser = () => {
        if (activeConvo?.other_user?.id) {
            router.visit(route('messages.report', activeConvo.other_user.id));
        } else {
            toast.show('Cannot report in group conversations');
        }
    };

    const filtered = convos.filter(c => {
        const matchesTab = tab === 'archived' ? c.is_archived : !c.is_archived;
        return matchesTab;
    });

    const grouped = groupByDate(messages);

    /* ══ RENDER ══ */
    return (
        <AppLayout activeNav="Messages" pageTitle="Messages">

            {/* Toast */}
            {toast.Toast}
            {/* Modals go here, at the top level of the return */}
            <BlockUserModal 
                isOpen={showBlockModal}
                onClose={() => setShowBlockModal(false)}
                onConfirm={handleBlockConfirm}
                userName={activeConvo?.name || 'this person'}
                isProcessing={blocking}
            />

            {/* New Message Modal */}
            {showNewMsg && (
                <NewMessageModal
                    onClose={() => setShowNewMsg(false)}
                    onStart={handleStartConversation}
                />
            )}

            {/* New Group Modal (employer) */}
            {showNewGroup && (
                <NewGroupModal
                    onClose={() => setShowNewGroup(false)}
                    onCreated={handleGroupCreated}
                />
            )}

            {/* Confirm Delete Group Modal */}
            {confirmDeleteGroup !== null && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="px-6 py-5">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
                                <IcoTrash />
                            </div>
                            <h3 className="text-[15px] font-bold text-avaa-dark mb-1">Delete Group Chat?</h3>
                            <p className="text-[13px] text-avaa-muted leading-relaxed">
                                This will permanently delete the group chat and all its messages for <span className="font-semibold text-avaa-dark">everyone</span> in the conversation. This cannot be undone.
                            </p>
                        </div>
                        <div className="px-6 pb-5 flex gap-2 justify-end">
                            <button
                                onClick={() => setConfirmDeleteGroup(null)}
                                className="px-4 py-2 text-[13px] font-semibold text-avaa-muted hover:text-avaa-dark transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteGroup(confirmDeleteGroup)}
                                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-xl transition-colors"
                            >
                                Delete for Everyone
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm"
                style={{ height: 'calc(100vh - 9rem)' }}>

                {/* ════════ LEFT: Conversation List ════════ */}
                <div className={`flex flex-col border-r border-gray-100 w-full md:w-[300px] lg:w-[320px] flex-shrink-0
                    ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>

                    <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-[16px] font-bold text-avaa-dark">Messages</h2>
                            <div className="relative" ref={composeRef}>
                                {me.role === 'employer' ? (
                                    <>
                                        <button
                                            onClick={() => setShowComposeMenu(v => !v)}
                                            title="New Conversation"
                                            className="p-1.5 rounded-lg hover:bg-avaa-primary-light text-avaa-muted hover:text-avaa-dark transition-colors"
                                        >
                                            <IcoEdit />
                                        </button>
                                        {showComposeMenu && (
                                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-1 overflow-hidden">
                                                <button onClick={() => { setShowNewMsg(true); setShowComposeMenu(false); }}
                                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-avaa-text hover:bg-avaa-primary-light transition-colors text-left">
                                                    <IcoEdit /> New Message
                                                </button>
                                                <button onClick={() => { setShowNewGroup(true); setShowComposeMenu(false); }}
                                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-avaa-text hover:bg-avaa-primary-light transition-colors text-left">
                                                    <IcoUsers /> New Group Chat
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setShowNewMsg(true)}
                                        title="New Message"
                                        className="p-1.5 rounded-lg hover:bg-avaa-primary-light text-avaa-muted hover:text-avaa-dark transition-colors"
                                    >
                                        <IcoEdit />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Search users */}
                        <div className="relative">
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 h-9 focus-within:border-avaa-primary/40 focus-within:bg-white transition-all">
                                <span className="text-avaa-muted flex-shrink-0"><IcoSearch /></span>
                                <input
                                    value={searchQuery}
                                    onChange={e => handleSidebarSearch(e.target.value)}
                                    placeholder="Search users..."
                                    className="flex-1 bg-transparent text-[13px] text-avaa-dark placeholder-avaa-muted outline-none border-0"
                                />
                                {searchQuery && (
                                    <button onClick={clearSearch} className="text-avaa-muted hover:text-avaa-dark transition-colors flex-shrink-0">
                                        <IcoClose />
                                    </button>
                                )}
                            </div>
                            {searchQuery.trim() && (
                                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-40 max-h-60 overflow-y-auto">
                                    {searchLoading ? (
                                        <div className="flex justify-center py-4">
                                            <IcoSpinner />
                                        </div>
                                    ) : searchResults.length === 0 ? (
                                        <p className="text-center py-4 text-[13px] text-avaa-muted">No users found</p>
                                    ) : searchResults.map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => { handleStartConversation(user.id); clearSearch(); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-avaa-primary-light transition-colors text-left"
                                        >
                                            <Avatar src={user.avatar} initials={user.initials} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-semibold text-avaa-dark truncate">{user.name}</p>
                                                <p className="text-[11.5px] text-avaa-muted truncate">{user.subtitle}</p>
                                            </div>
                                            <span className={`text-[10px] font-semibold flex-shrink-0 px-2 py-0.5 rounded-full
                                                ${user.role === 'employer' ? 'bg-blue-50 text-blue-600' : 'bg-avaa-primary-light text-avaa-primary'}`}>
                                                {user.role === 'job_seeker' ? 'Job Seeker' : 'Employer'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-1 mt-2.5">
                            {(['all', 'archived'] as const).map(t => (
                                <button key={t} onClick={() => setTab(t)}
                                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-colors ${tab === t
                                        ? 'bg-avaa-primary-light text-avaa-dark border border-avaa-primary/20'
                                        : 'text-avaa-muted hover:text-avaa-dark'
                                        }`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-[13px] text-avaa-muted mb-3">
                                    {tab === 'archived' ? 'No archived conversations' : 'No conversations yet'}
                                </p>
                                {tab === 'all' && (
                                    <button
                                        onClick={() => setShowNewMsg(true)}
                                        className="px-4 py-2 bg-avaa-primary hover:bg-avaa-dark text-white text-[12.5px] font-semibold rounded-xl transition-colors"
                                    >
                                        Start a Conversation
                                    </button>
                                )}
                            </div>
                        ) : filtered.map(c => (
                            <ConvoRow
                                key={c.id}
                                convo={c}
                                active={activeConvo?.id === c.id}
                                currentUserId={me.id}
                                onClick={() => openConvo(c)}
                            />
                        ))}
                    </div>
                </div>

                {/* ════════ RIGHT: Chat Window ════════ */}
                <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
                    {activeConvo ? (
                        <>
                            <div className="flex items-center gap-3 px-5 h-[65px] border-b border-gray-100 bg-white flex-shrink-0">
                                <button onClick={() => setMobileView('list')}
                                    className="md:hidden p-1 rounded-lg hover:bg-gray-100 text-avaa-muted transition-colors flex-shrink-0">
                                    <IcoBack />
                                </button>
                                <Avatar src={activeConvo.avatar} initials={activeConvo.initials} size="md" online />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[14px] text-avaa-dark truncate">{activeConvo.name}</p>
                                    {activeConvo.type === 'group' ? (
                                        <p className="text-[11.5px] text-avaa-primary flex items-center gap-1 mt-0.5">
                                            <IcoUsers /> {activeConvo.participants.length} members
                                            {activeConvo.job_listing && ` · ${activeConvo.job_listing.title}`}
                                        </p>
                                    ) : (
                                        <p className="text-[11.5px] text-emerald-500 font-medium">● Online</p>
                                    )}
                                </div>
                                <div className="relative">
                                    <button onClick={() => setShowMenu(v => !v)}
                                        className="p-2 rounded-xl hover:bg-avaa-primary-light text-avaa-muted hover:text-avaa-dark transition-colors">
                                        <IcoMore />
                                    </button>
                                    {showMenu && (
                                        <ContextMenu
                                            onArchive={() => archiveConvo(activeConvo.id)}
                                            onMute={() => muteConvo(activeConvo.id)}
                                            onDelete={() => deleteConvo(activeConvo.id)}
                                            onDeleteGroup={() => setConfirmDeleteGroup(activeConvo.id)}
                                            onReport={handleReportUser}
                                            onBlock={() => setShowBlockModal(true)}
                                            onClose={() => setShowMenu(false)}
                                            isMuted={activeConvo.is_muted}
                                            isGroup={activeConvo.type === 'group'}
                                            isEmployer={me.role === 'employer'}
                                            showToast={toast.show}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-2 bg-[#f7fafa]">
                                {loadingConvo ? (
                                    <div className="flex justify-center pt-16">
                                        <div className="w-6 h-6 border-2 border-avaa-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : grouped.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-[13px] text-avaa-muted">No messages yet — say hello! 👋</p>
                                    </div>
                                ) : grouped.map(group => (
                                    <div key={group.label}>
                                        <div className="flex items-center gap-3 my-4">
                                            <div className="flex-1 h-px bg-gray-200" />
                                            <span className="text-[11px] text-avaa-muted font-medium px-1">{group.label}</span>
                                            <div className="flex-1 h-px bg-gray-200" />
                                        </div>
                                        <div className="space-y-1.5">
                                            {group.items.map((msg, idx) => (
                                                <Bubble
                                                    key={msg.id}
                                                    msg={msg}
                                                    isOwn={msg.sender_id === me.id}
                                                    showAvatar={!group.items[idx - 1] || group.items[idx - 1].sender_id !== msg.sender_id}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>

                            <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                                <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5
                                    focus-within:border-avaa-primary/50 focus-within:bg-white focus-within:shadow-sm transition-all">
                                    <button onClick={() => fileRef.current?.click()}
                                        className="p-1.5 rounded-lg text-avaa-muted hover:text-avaa-primary transition-colors flex-shrink-0 mb-0.5"
                                        title="Attach file">
                                        <IcoAttach />
                                    </button>
                                    <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx"
                                        onChange={() => {
                                            const f = fileRef.current?.files?.[0];
                                            if (f && !body.trim()) setBody(f.name);
                                        }} />
                                    <textarea
                                        ref={textareaRef}
                                        value={body}
                                        onChange={e => setBody(e.target.value)}
                                        onKeyDown={onKeyDown}
                                        placeholder="Write a message..."
                                        rows={1}
                                        className="flex-1 bg-transparent text-[13.5px] text-avaa-dark placeholder-avaa-muted outline-none border-0 resize-none leading-relaxed overflow-y-auto"
                                        style={{ minHeight: '22px', maxHeight: '120px' }}
                                        onInput={e => {
                                            const t = e.currentTarget;
                                            t.style.height = 'auto';
                                            t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                                        }}
                                    />
                                    <button onClick={sendMsg}
                                        disabled={sending || (!body.trim() && !fileRef.current?.files?.length)}
                                        className="flex-shrink-0 w-9 h-9 rounded-xl bg-avaa-primary hover:bg-avaa-dark disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors mb-0.5">
                                        {sending ? <IcoSpinner /> : <IcoSend />}
                                    </button>
                                </div>
                                <p className="text-[11px] text-avaa-muted mt-1.5 ml-1">
                                    Enter to send · Shift+Enter for new line
                                </p>
                            </div>
                        </>
                    ) : (
                        <EmptyChat onNewMessage={() => setShowNewMsg(true)} />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}