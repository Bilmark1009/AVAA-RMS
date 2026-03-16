import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

/* ── Types ── */
interface Invitation {
    id: number;
    status: string;
    created_at: string;
    job: {
        id: number;
        title: string;
        company: string;
        location: string;
    };
    inviter: {
        name: string;
        email: string;
        avatar?: string | null;
        company?: string | null;
    };
}

interface Props {
    user: any;
    profile: any;
    invitations: Invitation[];
}

function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Invitations({ user, profile, invitations }: Props) {
    const handleAccept = (id: number) => {
        router.post(route('employer.jobs.invitations.accept', id), {}, { preserveScroll: true });
    };

    const handleDecline = (id: number) => {
        router.post(route('employer.jobs.invitations.decline', id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout pageTitle="Collaboration Invitations" pageSubtitle="Pending invitations to collaborate on jobs" activeNav="Manage Jobs">
            <Head title="Invitations" />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
                <button onClick={() => router.visit(route('employer.jobs.index'))} className="hover:text-[#6D9886] transition-colors font-medium">Manage Jobs</button>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                <span className="text-gray-800 font-medium">Invitations</span>
            </nav>

            {invitations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 mx-auto mb-4">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                        </svg>
                    </div>
                    <p className="font-semibold text-gray-800 mb-1">No pending invitations</p>
                    <p className="text-sm text-gray-400">You'll see collaboration invitations here when other recruiters invite you to work on their jobs.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {invitations.map(inv => (
                        <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                            {/* Inviter avatar */}
                            <div className="w-12 h-12 rounded-xl bg-[#6D9886] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                                {inv.inviter.avatar ? (
                                    <img src={inv.inviter.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    getInitials(inv.inviter.name)
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800">
                                    <span className="text-[#6D9886]">{inv.inviter.name}</span> invited you to collaborate
                                </p>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    <span className="font-semibold">{inv.job.title}</span>
                                    {inv.job.company && <span className="text-gray-400"> · {inv.job.company}</span>}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z"/></svg>
                                        {inv.job.location}
                                    </span>
                                    <span>Invited {inv.created_at}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => handleDecline(inv.id)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Decline
                                </button>
                                <button
                                    onClick={() => handleAccept(inv.id)}
                                    className="px-4 py-2 bg-[#6D9886] hover:bg-[#5a8371] text-white text-sm font-semibold rounded-xl transition-colors"
                                >
                                    Accept
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
