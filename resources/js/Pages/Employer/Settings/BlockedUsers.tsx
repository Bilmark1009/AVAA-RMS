import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ImageInitialsFallback from '@/Components/ImageInitialsFallback';
import { useState, useEffect } from 'react';
import { PageProps } from '@/types';

/* ── Icons ── */
const IcoBlock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
);

const IcoUnblock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l14.14 14.14" strokeDasharray="2 2" />
    </svg>
);

const IcoSearch = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
);

const IcoBriefcase = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);

/* ── Types ── */
interface BlockedUser {
    id: number;
    name: string;
    avatar: string | null;
    role: string;
    reason: string | null;
    blocked_at: string;
    initials: string;
    job_title: string;
}

interface SearchResult {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    initials: string;
    role: string;
    job_title: string;
}

/* ── Avatar Component ── */
function Avatar({ src, initials, size = 'md' }: { src?: string | null | undefined; initials: string; size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base'
    };

    return (
        <ImageInitialsFallback
            src={src}
            alt="Avatar"
            initials={initials}
            className={`${sizeClasses[size]} rounded-full overflow-hidden border border-gray-200 bg-avaa-primary`}
            textClassName="text-white font-semibold flex items-center justify-center"
        />
    );
}

/* ── Blocked User Card ── */
function BlockedUserCard({ user, onUnblock }: { user: BlockedUser; onUnblock: (id: number) => void }) {
    const [isUnblocking, setIsUnblocking] = useState(false);

    const handleUnblock = async () => {
        setIsUnblocking(true);
        try {
            const response = await fetch(route('employer.settings.blocked-users.unblock'), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ 
                    user_id: user.id,
                    _token: (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                }),
            });
            
            if (response.ok) {
                onUnblock(user.id);
            } else {
                console.error('Failed to unblock user:', response.status);
            }
        } catch (error) {
            console.error('Error unblocking user:', error);
        } finally {
            setIsUnblocking(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <Avatar src={user.avatar} initials={user.initials} size="md" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{user.name}</h4>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-avaa-primary/10 text-avaa-primary">
                                {user.role.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{user.job_title}</p>
                        {user.reason && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{user.reason}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                            Blocked on {formatDate(user.blocked_at)}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleUnblock}
                    disabled={isUnblocking}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-avaa-primary hover:bg-avaa-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <IcoUnblock />
                    <span>{isUnblocking ? 'Unblocking...' : 'Unblock'}</span>
                </button>
            </div>
        </div>
    );
}

/* ── Search & Block Component ── */
function BlockJobSeekerForm({ onBlock }: { onBlock: (user: SearchResult & { reason?: string }) => void }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
    const [reason, setReason] = useState('');
    const [isBlocking, setIsBlocking] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (searchQuery.trim()) {
            setIsSearching(true);
            (async () => {
                try {
                    const response = await fetch(route('employer.settings.blocked-users.search') + '?q=' + encodeURIComponent(searchQuery), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        setSearchResults(result || []);
                        setShowResults(true);
                    } else {
                        setSearchResults([]);
                    }
                } catch (error) {
                    console.error('Error searching job seekers:', error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            })();
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    }, [searchQuery]);

    const handleBlock = async () => {
        if (!selectedUser) return;

        setIsBlocking(true);
        try {
            const response = await fetch(route('employer.settings.blocked-users.block'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    user_id: selectedUser.id,
                    reason: reason.trim() || undefined,
                    _token: (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                }),
            });
            
            if (response.ok) {
                const result = await response.json();
                onBlock({ ...selectedUser, reason: reason.trim() || undefined });
                setSelectedUser(null);
                setReason('');
                setSearchQuery('');
                setShowResults(false);
            } else {
                console.error('Failed to block job seeker:', response.status);
            }
        } catch (error) {
            console.error('Error blocking job seeker:', error);
        } finally {
            setIsBlocking(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Block a Job Seeker</h3>
            
            {/* Search */}
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IcoSearch />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search job seekers by email..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:border-transparent"
                />
                {isSearching && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-avaa-primary"></div>
                    </div>
                )}
            </div>

            {/* Search Results */}
            {showResults && searchResults.length > 0 && (
                <div className="mb-4 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => {
                                setSelectedUser(user);
                                setShowResults(false);
                                setSearchQuery(user.name);
                            }}
                            className="w-full px-3 py-2 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                            <Avatar src={user.avatar} initials={user.initials} size="sm" />
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.job_title}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Selected User & Reason */}
            {selectedUser && (
                <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar src={selectedUser.avatar} initials={selectedUser.initials} size="sm" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
                            <p className="text-xs text-gray-500">{selectedUser.job_title}</p>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Reason (optional)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Why are you blocking this job seeker?"
                            rows={3}
                            className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:border-transparent resize-none"
                        />
                    </div>

                    <button
                        onClick={handleBlock}
                        disabled={isBlocking}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-avaa-primary text-white text-sm font-medium rounded-lg hover:bg-avaa-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <IcoBlock />
                        <span>{isBlocking ? 'Blocking...' : 'Block Job Seeker'}</span>
                    </button>
                </div>
            )}
        </div>
    );
}

/* ── Main Component ── */
export default function EmployerBlockedUsers({ auth }: PageProps<{ auth: any }>) {
    const { blockedUsers } = usePage().props;
    const [blockedUsersList, setBlockedUsersList] = useState<BlockedUser[]>(blockedUsers as BlockedUser[] || []);

    const handleUnblock = (userId: number) => {
        setBlockedUsersList(prev => prev.filter(user => user.id !== userId));
    };

    const handleBlock = (newUser: SearchResult & { reason?: string }) => {
        const blockedUser: BlockedUser = {
            id: newUser.id,
            name: newUser.name,
            avatar: newUser.avatar,
            role: newUser.role,
            reason: newUser.reason || null,
            blocked_at: new Date().toISOString(),
            initials: newUser.initials,
            job_title: newUser.job_title
        };
        setBlockedUsersList(prev => [blockedUser, ...prev]);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-gray-900">Blocked Job Seekers</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Manage job seekers you've blocked from contacting you.
                </p>
            </div>

            {/* Block New Job Seeker */}
            <BlockJobSeekerForm onBlock={handleBlock} />

            {/* Blocked Job Seekers List */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Blocked Job Seekers ({blockedUsersList.length})
                </h3>
                
                {blockedUsersList.length === 0 ? (
                    <div className="text-center py-8 bg-white border border-gray-200 rounded-xl">
                        <IcoBriefcase />
                        <p className="text-sm text-gray-600 mt-2">No blocked job seekers</p>
                        <p className="text-xs text-gray-400 mt-1">
                            Job seekers you block will appear here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {blockedUsersList.map((user) => (
                            <BlockedUserCard
                                key={user.id}
                                user={user}
                                onUnblock={handleUnblock}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
