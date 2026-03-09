import { Head, Link } from '@inertiajs/react';
import { ReactNode } from 'react';
import AppLayout from '@/Layouts/AppLayout';

/* ── Types ── */
interface Trend { month: string; count: number }
interface RecentJob {
    id: number; title: string; location: string;
    status: string; created_at: string; employer: string;
}
interface RecentUser {
    id: number; first_name: string; last_name: string;
    email: string; role: string; created_at: string;
    applications_count: number;
}

interface RecentJobSeeker {
    id: number; first_name: string; last_name: string;
    email: string; role: string; status: string;
    created_at: string; applications_count: number;
}

interface Props {
    auth: { user: { first_name: string; last_name: string; email: string; role: string } };
    stats: { total: number; employers: number; jobSeekers: number };
    jobCount: number;
    applicationCount: number;
    applicationTrends: Trend[];
    recentJobs: RecentJob[];
    recentUsers: RecentUser[];
    recentJobSeekers: RecentJobSeeker[];
    pendingCount?: number;
}

/* ── Icons ── */
const IcoUsers = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);
const IcoBag = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IcoDoc = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);
const IcoEye = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const IcoCalendar = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const IcoMapPin = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);
const IcoArrow = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);
const IcoBriefcaseSm = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IcoUserSm = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const IcoCheckCircle = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
    </svg>
);
const IcoXCircle = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
);

/* ── Stat Card ── */
function StatCard({ label, value, sub, trend, trendUp, icon }: {
    label: string; value: string | number; sub: string; trend: string; trendUp?: boolean; icon: ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#e8f4f4] flex items-center justify-center text-[#3d9e9e]">
                    {icon}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${trendUp !== false
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-red-600 bg-red-50'
                    }`}>
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium mb-0.5">{label}</p>
                <p className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                <p className="text-xs text-gray-400 mt-1.5">{sub}</p>
            </div>
        </div>
    );
}

/* ── Bar Chart ── */
function TrendsChart({ trends }: { trends: Trend[] }) {
    const max = Math.max(...trends.map(t => t.count), 1);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <p className="font-bold text-gray-900 text-base">Application Trends</p>
                    <p className="text-xs text-gray-400 mt-0.5">Monthly application volume</p>
                </div>
                <span className="text-xs font-semibold text-[#3d9e9e] bg-[#e8f4f4] px-3 py-1.5 rounded-lg">
                    Last 6 Months
                </span>
            </div>

            {/* Chart */}
            <div className="flex items-end gap-3 h-48">
                {trends.map((t, i) => {
                    const pct = max === 0 ? 0 : (t.count / max) * 100;
                    const isLast = i === trends.length - 1;
                    return (
                        <div key={t.month} className="flex-1 flex flex-col items-center gap-2 group">
                            <span className="text-xs font-semibold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                {t.count}
                            </span>
                            <div className="w-full relative flex items-end" style={{ height: '168px' }}>
                                <div
                                    className={`w-full rounded-t-lg transition-all duration-700 ${isLast
                                        ? 'bg-[#3d9e9e]'
                                        : 'bg-[#3d9e9e]/40 group-hover:bg-[#3d9e9e]/70'
                                        }`}
                                    style={{ height: `${Math.max(pct, 4)}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 font-medium">{t.month}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Avatar helper ── */
const AVATAR_BG = [
    'bg-[#3d9e9e]', 'bg-slate-700', 'bg-emerald-600',
    'bg-violet-600', 'bg-rose-500', 'bg-amber-600',
];

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
}

/* ── Recent Jobs Panel ── */
function RecentJobsPanel({ jobs }: { jobs: RecentJob[] }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <p className="font-bold text-gray-900 text-sm">Recent Job Postings</p>
                    <p className="text-xs text-gray-400 mt-0.5">Latest published positions</p>
                </div>
                <a
                    href={route('employer.jobs.index')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#3d9e9e] hover:text-[#2d7e7e] transition-colors"
                >
                    View All Jobs <IcoArrow />
                </a>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-50 flex-1">
                {jobs.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <div className="w-10 h-10 rounded-xl bg-[#e8f4f4] flex items-center justify-center text-[#3d9e9e] mx-auto mb-2">
                            <IcoBag />
                        </div>
                        <p className="text-sm text-gray-400">No job postings yet</p>
                    </div>
                ) : (
                    jobs.map((job, i) => (
                        <div key={job.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/60 transition-colors">
                            <div className={`w-9 h-9 rounded-xl ${AVATAR_BG[i % AVATAR_BG.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                {job.title.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm truncate leading-tight">{job.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <IcoMapPin /> {job.location || '—'}
                                    </span>
                                    <span className="text-gray-200">·</span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <IcoCalendar /> {timeAgo(job.created_at)}
                                    </span>
                                </div>
                            </div>
                            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${job.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                {job.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

/* ── Recent Users Panel ── */
function RecentUsersPanel({ users }: { users: RecentUser[] }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <p className="font-bold text-gray-900 text-sm">Recent User Registrations</p>
                    <p className="text-xs text-gray-400 mt-0.5">Newly registered accounts</p>
                </div>
                <a
                    href="#"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#3d9e9e] hover:text-[#2d7e7e] transition-colors"
                >
                    View All Users <IcoArrow />
                </a>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-50 flex-1">
                {users.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <div className="w-10 h-10 rounded-xl bg-[#e8f4f4] flex items-center justify-center text-[#3d9e9e] mx-auto mb-2">
                            <IcoUsers />
                        </div>
                        <p className="text-sm text-gray-400">No recent registrations</p>
                    </div>
                ) : (
                    users.map((u, i) => {
                        const initials = `${(u.first_name ?? '').charAt(0)}${(u.last_name ?? '').charAt(0)}`.toUpperCase();
                        return (
                            <div key={u.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/60 transition-colors">
                                <div className={`w-9 h-9 rounded-full ${AVATAR_BG[i % AVATAR_BG.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-sm truncate leading-tight">
                                        {u.first_name} {u.last_name}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">{u.email}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${u.role === 'employer'
                                        ? 'bg-[#e8f4f4] text-[#3d9e9e]'
                                        : 'bg-violet-50 text-violet-700'
                                        }`}>
                                        {u.role === 'employer' ? 'Employer' : 'Job Seeker'}
                                    </span>
                                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                        <IcoCalendar /> {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

/* ── Main Page ── */
export default function AdminDashboard({
    auth, stats, jobCount, applicationCount, applicationTrends, recentJobs, recentUsers, recentJobSeekers, pendingCount = 0
}: Props) {
    const user = auth.user;

    return (
        <>
            <Head title="Admin Dashboard" />
            <AppLayout
                pageTitle="Dashboard"
                pageSubtitle={`Welcome back ${user.first_name}, here's what's happening today.`}
                activeNav="Dashboard"
            >
                {/* ── ROW 1: Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="Active Users"
                        value={stats.total}
                        sub="Users currently active"
                        trend="↑ +12%"
                        trendUp={true}
                        icon={<IcoUsers />}
                    />
                    <StatCard
                        label="Job Posted"
                        value={jobCount}
                        sub="Open positions available"
                        trend="↑ +8%"
                        trendUp={true}
                        icon={<IcoBag />}
                    />
                    <StatCard
                        label="Applications"
                        value={applicationCount}
                        sub="Submitted this month"
                        trend="↑ +8%"
                        trendUp={true}
                        icon={<IcoDoc />}
                    />
                    <StatCard
                        label="Total Visits"
                        value="18,200"
                        sub="Visits recorded this month"
                        trend="↑ +18%"
                        trendUp={true}
                        icon={<IcoEye />}
                    />
                </div>

                {/* ── ROW 2: Application Trends Chart ── */}
                <div className="mb-6">
                    <TrendsChart trends={applicationTrends} />
                </div>

                {/* ── ROW 3: Recent Jobs | Recent Users ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    <RecentJobsPanel jobs={recentJobs} />
                    <RecentUsersPanel users={recentUsers} />
                </div>

                {/* ── ROW 4: Job Seeker Summary ── */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-gray-900 text-base">Job Seeker Summary</p>
                            <p className="text-xs text-gray-400 mt-0.5">Recent job seeker registrations</p>
                        </div>
                        <a
                            href="#"
                            className="flex items-center gap-1.5 text-sm font-semibold text-[#3d9e9e] hover:text-[#2d7e7e] transition-colors"
                        >
                            View all Job Seekers →
                        </a>
                    </div>

                    {/* Table */}
                    {recentJobSeekers.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <p className="text-sm text-gray-400">No job seeker registrations yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[640px]">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {['User', 'Email', 'Status', 'Joined', 'Applications'].map(h => (
                                            <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentJobSeekers.map((js, i) => {
                                        const initials = `${(js.first_name ?? '').charAt(0)}${(js.last_name ?? '').charAt(0)}`.toUpperCase();
                                        const isActive = js.status === 'active';
                                        return (
                                            <tr key={js.id} className="hover:bg-gray-50/70 transition-colors">
                                                {/* User */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-full ${AVATAR_BG[i % AVATAR_BG.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800 leading-tight">
                                                                {js.first_name} {js.last_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Email */}
                                                <td className="px-6 py-4 text-gray-500">
                                                    {js.email}
                                                </td>
                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isActive
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {isActive ? <IcoCheckCircle /> : <IcoXCircle />}
                                                        {isActive ? 'Active' : js.status === 'suspended' ? 'Suspended' : 'Inactive'}
                                                    </span>
                                                </td>
                                                {/* Joined */}
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-500 flex items-center gap-1.5">
                                                        <IcoCalendar />
                                                        {new Date(js.created_at).toISOString().slice(0, 10)}
                                                    </span>
                                                </td>
                                                {/* Applications */}
                                                <td className="px-6 py-4 font-semibold text-gray-700">
                                                    {js.applications_count}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}