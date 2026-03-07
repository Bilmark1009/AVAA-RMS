import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

interface Props {
    auth: { user: { name: string; email: string; role: string } };
    stats: { total: number; employers: number; jobSeekers: number };
    recentUsers: Array<{ id: number; name: string; email: string; role: string; created_at: string }>;
    pendingCount?: number;
}

/* ── stat card — matches Figma exactly ── */
function StatCard({ label, value, sub, trend, icon }: {
    label: string; value: string | number; sub: string; trend: string; icon: ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-avaa-primary-light flex items-center justify-center text-avaa-teal">
                    {icon}
                </div>
                <span className="text-xs font-semibold text-avaa-teal bg-avaa-primary-light px-2 py-0.5 rounded-full">
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-sm text-avaa-muted font-medium mb-1">{label}</p>
                <p className="text-3xl font-extrabold text-avaa-dark tracking-tight">{value}</p>
                <p className="text-xs text-avaa-muted mt-1">{sub}</p>
            </div>
        </div>
    );
}

import { ReactNode } from 'react';

const IcoUsers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
    </svg>
);
const IcoBag = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IcoDoc = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);
const IcoEye2 = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const IcoEye = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

/* avatar colors pool */
const AVATAR_BG = [
    'bg-avaa-dark', 'bg-avaa-teal', 'bg-avaa-dark2',
    'bg-emerald-600', 'bg-violet-600', 'bg-rose-500',
];

const MOCK_JOBS = [
    { initials: 'TN', bg: 'bg-avaa-teal', title: 'Senior Frontend Developer', company: 'TechNova', location: 'San Francisco, CA', status: 'Active', apps: 52, date: '2026-02-07' },
    { initials: 'DS', bg: 'bg-avaa-dark', title: 'Backend Engineer', company: 'TechNova', location: 'San Francisco, CA', status: 'Active', apps: 31, date: '2026-02-06' },
    { initials: 'CH', bg: 'bg-emerald-500', title: 'UX/UI Designer', company: 'TechNova', location: 'San Francisco, CA', status: 'Active', apps: 43, date: '2026-02-05' },
    { initials: 'CS', bg: 'bg-avaa-dark2', title: 'DevOps Engineer', company: 'TechNova', location: 'San Francisco, CA', status: 'Active', apps: 19, date: '2026-02-04' },
    { initials: 'IT', bg: 'bg-avaa-teal', title: 'Product Manager', company: 'TechNova', location: 'San Francisco, CA', status: 'Active', apps: 20, date: '2026-02-03' },
    { initials: 'AP', bg: 'bg-slate-600', title: 'Data Scientist', company: 'TechNova', location: 'San Francisco, CA', status: 'Inactive', apps: 12, date: '2026-02-02' },
];

export default function AdminDashboard({ auth, stats, recentUsers, pendingCount = 0 }: Props) {
    const user = auth.user;

    return (
        <>
            <Head title="Admin Dashboard" />
            <AppLayout
                pageTitle="Dashboard"
                pageSubtitle={`Welcome back ${user.name}, here's what's happening today.`}
                activeNav="Dashboard"
            >
                {/* ── Stats row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard label="Active Users" value={stats.total} sub="Users currently active" trend="↑ +12%" icon={<IcoUsers />} />
                    <StatCard label="Job Posted" value={6} sub="Open positions available" trend="↑ +8%" icon={<IcoBag />} />
                    <StatCard label="Applications" value={200} sub="Submitted this month" trend="↑ +8%" icon={<IcoDoc />} />
                    <StatCard label="Total Visits" value="10,800" sub="Visits recorded this month" trend="↑ +18%" icon={<IcoEye2 />} />
                </div>

                {/* ── Pending verification banner ── */}
                {pendingCount > 0 && (
                    <div className="mb-6 flex items-center justify-between gap-4 px-5 py-3.5
                                    bg-amber-50 border border-amber-200 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                            <p className="text-sm font-medium text-amber-800">
                                <span className="font-bold">{pendingCount} employer{pendingCount > 1 ? 's' : ''}</span> waiting for verification review.
                            </p>
                        </div>
                        <a href={route('admin.verifications')}
                            className="flex-shrink-0 text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900">
                            Review now →
                        </a>
                    </div>
                )}

                {/* ── Posted Jobs table ── */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <p className="font-semibold text-avaa-dark text-sm">Posted Jobs</p>
                        <p className="text-xs text-avaa-teal font-medium mt-0.5">6 total jobs</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[560px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {['Job', 'Status', 'Applications', 'Posted', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-avaa-muted uppercase tracking-wide first:pl-5">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {MOCK_JOBS.map(job => (
                                    <tr key={job.title} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl ${job.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                    {job.initials}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-avaa-dark leading-tight">{job.title}</p>
                                                    <p className="text-xs text-avaa-muted">{job.company} · {job.location}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                                                ${job.status === 'Active'
                                                    ? 'bg-avaa-primary-light text-avaa-teal'
                                                    : 'bg-gray-100 text-avaa-muted'}`}>
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                    {job.status === 'Active'
                                                        ? <polyline points="20 6 9 17 4 12" />
                                                        : <circle cx="12" cy="12" r="10" />}
                                                </svg>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-avaa-text font-medium">{job.apps}</td>
                                        <td className="px-5 py-3.5 text-avaa-muted text-xs">{job.date}</td>
                                        <td className="px-5 py-3.5">
                                            <button className="p-1.5 rounded-lg hover:bg-avaa-primary-light text-avaa-muted hover:text-avaa-teal transition-colors">
                                                <IcoEye />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Recent registrations ── */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <p className="font-semibold text-avaa-dark text-sm">Recent Registrations</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[440px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {['Name', 'Email', 'Role', 'Joined'].map(h => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-avaa-muted uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentUsers.map((u, i) => (
                                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-7 h-7 rounded-full ${AVATAR_BG[i % AVATAR_BG.length]} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                                    {u.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-avaa-dark">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-avaa-muted">{u.email}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                                                ${u.role === 'employer'
                                                    ? 'bg-avaa-primary-light text-avaa-teal'
                                                    : u.role === 'job_seeker'
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-avaa-dark/10 text-avaa-dark'}`}>
                                                {u.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-avaa-muted text-xs">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}