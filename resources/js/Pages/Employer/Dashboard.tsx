import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import EmployerOnboarding from '@/Components/Modals/EmployerOnboarding';

/* ── Types ─────────────────────────────────────────────────── */
interface RecentJob {
    id: number;
    title: string;
    location: string | null;
    status: string;
    applications_count: number;
    created_at: string;
}

interface Props {
    user: { first_name: string; last_name: string; email: string; role: string };
    profile: any;
    profileComplete: boolean;
    isVerified: boolean;
    needsPhone: boolean;
    activeUsersCount: number;
    jobsPostedCount: number;
    applicationsCount: number;
    totalVisitsCount: number;
    recentJobs: RecentJob[];
}

/* ── Icons ─────────────────────────────────────────────────── */
const IcoActiveUsers = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);
const IcoJobPosted = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IcoApplications = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
);
const IcoVisits = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const IcoTrendUp = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
);
const IcoEye = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

/* ── Stat Card ─────────────────────────────────────────────── */
function StatCard({
    label, value, sub, icon, color, badge,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    color: string;
    badge?: string;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    {icon}
                </span>
                {badge && (
                    <span className={`inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full ${color}`}>
                        <IcoTrendUp />
                        {badge}
                    </span>
                )}
            </div>
            <p className="text-base text-gray-500 font-medium mb-1">{label}</p>
            <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

/* ── Status Badge ──────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase();
    const map: Record<string, { bg: string; dot: string; text: string }> = {
        active: { bg: 'bg-emerald-50', dot: 'bg-emerald-400', text: 'text-emerald-700' },
        inactive: { bg: 'bg-gray-100', dot: 'bg-gray-400', text: 'text-gray-600' },
        closed: { bg: 'bg-red-50', dot: 'bg-red-400', text: 'text-red-600' },
        draft: { bg: 'bg-amber-50', dot: 'bg-amber-400', text: 'text-amber-700' },
    };
    const st = map[s] ?? map.active;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold ${st.bg} ${st.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

/* ── Initials avatar ───────────────────────────────────────── */
function InitialsAvatar({ name, color }: { name: string; color: string }) {
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return (
        <span className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${color}`}>
            {initials}
        </span>
    );
}

/* ── Format date ───────────────────────────────────────────── */
function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-CA');
}

/* ── Deterministic color from string ───────────────────────── */
const avatarColors = [
    'bg-emerald-600', 'bg-teal-600', 'bg-cyan-600', 'bg-sky-600',
    'bg-violet-600', 'bg-pink-600', 'bg-rose-600', 'bg-amber-600',
];
function pickColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
}

/* ══════════════════════════════════════════════════════════════
   MONTHLY APPLICATIONS CHART
   ══════════════════════════════════════════════════════════════ */
type Period = 'weekly' | 'monthly' | 'yearly';

interface ChartPeriodData {
    labels: string[];
    values: number[];
    total: string;
    peak: string;
    avg: string;
    peakLbl: string;
    avgLbl: string;
    badge: string;
}

const CHART_DATA: Record<Period, ChartPeriodData> = {
    weekly: {
        labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8'],
        values: [120, 95, 140, 175, 110, 190, 160, 210],
        total: '1,200', peak: '210', avg: '150',
        peakLbl: 'Peak week', avgLbl: 'Weekly avg', badge: '+12%',
    },
    monthly: {
        labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        values: [480, 390, 510, 470, 610, 680],
        total: '3,140', peak: '680', avg: '523',
        peakLbl: 'Peak month', avgLbl: 'Monthly avg', badge: '+8%',
    },
    yearly: {
        labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
        values: [2400, 3100, 4200, 5800, 7200, 9400],
        total: '32,100', peak: '9,400', avg: '5,350',
        peakLbl: 'Peak year', avgLbl: 'Yearly avg', badge: '+30%',
    },
};

const TEAL_SOLID = '#1D9E75';
const TEAL_LIGHT = 'rgba(29,158,117,0.13)';

function MonthlyApplicationsChart() {
    const [period, setPeriod] = useState<Period>('monthly');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        let Chart: any;

        async function loadAndDraw() {
            // Dynamically import Chart.js (works with Vite / Laravel + Inertia setups)
            // Install via: npm install chart.js
            const mod = await import('chart.js/auto');
            Chart = mod.default;
            drawChart(Chart);
        }

        function drawChart(Chart: any) {
            if (!canvasRef.current) return;
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }

            const d = CHART_DATA[period];
            const maxVal = Math.max(...d.values);

            chartRef.current = new Chart(canvasRef.current, {
                type: 'bar',
                data: {
                    labels: d.labels,
                    datasets: [
                        {
                            data: d.values,
                            backgroundColor: d.values.map(v => (v === maxVal ? TEAL_SOLID : TEAL_LIGHT)),
                            hoverBackgroundColor: d.values.map(v => (v === maxVal ? '#0f6e56' : 'rgba(29,158,117,0.25)')),
                            borderRadius: 6,
                            borderSkipped: false,
                            barPercentage: 0.55,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#fff',
                            borderColor: '#e5e7eb',
                            borderWidth: 1,
                            titleColor: '#111827',
                            bodyColor: '#6b7280',
                            padding: 10,
                            cornerRadius: 8,
                            callbacks: {
                                label: (ctx: any) => ` ${ctx.parsed.y.toLocaleString()} applications`,
                            },
                        },
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            border: { display: false },
                            ticks: {
                                font: { size: 12, family: 'inherit' },
                                color: '#9ca3af',
                                autoSkip: false,
                            },
                        },
                        y: {
                            grid: { color: 'rgba(0,0,0,0.05)' },
                            border: { display: false },
                            ticks: {
                                font: { size: 11, family: 'inherit' },
                                color: '#d1d5db',
                                maxTicksLimit: 5,
                                callback: (v: number) =>
                                    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v,
                            },
                        },
                    },
                },
            });
        }

        loadAndDraw();

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [period]);

    const d = CHART_DATA[period];
    const periods: { key: Period; label: string }[] = [
        { key: 'weekly', label: 'Weekly' },
        { key: 'monthly', label: 'Monthly' },
        { key: 'yearly', label: 'Yearly' },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Monthly Applications</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Application submissions over time</p>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    {periods.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setPeriod(key)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                period === key
                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary stats */}
            <div className="flex items-center gap-8 mb-5">
                <div>
                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{d.total}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-400">Total applications</p>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            <IcoTrendUp />
                            {d.badge}
                        </span>
                    </div>
                </div>
                <div className="w-px h-10 bg-gray-100" />
                <div>
                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{d.peak}</p>
                    <p className="text-sm text-gray-400 mt-1">{d.peakLbl}</p>
                </div>
                <div className="w-px h-10 bg-gray-100" />
                <div>
                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{d.avg}</p>
                    <p className="text-sm text-gray-400 mt-1">{d.avgLbl}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="relative w-full" style={{ height: '220px' }}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════ */
/*   MAIN COMPONENT                                            */
/* ════════════════════════════════════════════════════════════ */
export default function EmployerDashboard({
    user,
    profile,
    profileComplete,
    isVerified,
    needsPhone,
    activeUsersCount,
    jobsPostedCount,
    applicationsCount,
    totalVisitsCount,
    recentJobs,
}: Props) {
    const companyName = profile?.company_name ?? `${user.first_name} ${user.last_name}`;

    return (
        <>
            <Head title="Employer Dashboard" />
            {!profileComplete && <EmployerOnboarding needsPhone={needsPhone} />}

            <AppLayout
                pageTitle="Dashboard"
                pageSubtitle={`Welcome back ${companyName}, here's what's happening today.`}
                activeNav="Dashboard"
            >
                {/* Verification status banner */}
                {profileComplete && (
                    <div className={`mb-6 flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-base
                        ${isVerified
                            ? 'bg-avaa-primary-light border-avaa-primary/30 text-avaa-teal'
                            : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                        {isVerified ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
                                </svg>
                                <span><strong>Verified Employer</strong> — You can now post jobs.</span>
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                                <span><strong>Pending Verification</strong> — Our admin team is reviewing your profile. You'll be notified once approved.</span>
                            </>
                        )}
                    </div>
                )}

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="Active Users"
                        value={activeUsersCount}
                        sub="Users currently active"
                        icon={<IcoActiveUsers />}
                        color="bg-emerald-50 text-emerald-600"
                        badge="+12%"
                    />
                    <StatCard
                        label="Job Posted"
                        value={jobsPostedCount}
                        sub="Open positions available"
                        icon={<IcoJobPosted />}
                        color="bg-amber-50 text-amber-600"
                        badge="+8%"
                    />
                    <StatCard
                        label="Applications"
                        value={applicationsCount}
                        sub="Submitted this month"
                        icon={<IcoApplications />}
                        color="bg-sky-50 text-sky-600"
                        badge="+8%"
                    />
                    <StatCard
                        label="Total Visits"
                        value={totalVisitsCount}
                        sub="Visits recorded this month"
                        icon={<IcoVisits />}
                        color="bg-violet-50 text-violet-600"
                        badge="+18%"
                    />
                </div>

                {/* ── Monthly Applications Chart ── */}
                <MonthlyApplicationsChart />

                {/* ── Posted Jobs Table ── */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {/* header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Posted Jobs</h2>
                            <p className="text-base text-gray-400">{recentJobs.length} total jobs</p>
                        </div>
                        <Link
                            href={route('employer.jobs.index')}
                            className="text-base font-semibold text-avaa-primary hover:text-avaa-primary-hover transition-colors"
                        >
                            View All Posted Jobs →
                        </Link>
                    </div>

                    {recentJobs.length === 0 ? (
                        /* empty state */
                        <div className="p-12 text-center">
                            <div className="w-14 h-14 rounded-full bg-avaa-primary-light flex items-center justify-center mx-auto mb-4 text-avaa-teal">
                                <IcoJobPosted />
                            </div>
                            <p className="text-gray-500 text-base mb-4">No job listings yet. Post your first job to start receiving applications.</p>
                            <Link
                                href={route('employer.jobs.index')}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-avaa-primary
                                           hover:bg-avaa-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-block"
                            >
                                {isVerified ? 'Post New Job' : 'Post New Job (Requires Verification)'}
                            </Link>
                        </div>
                    ) : (
                        /* table */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-sm uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                        <th className="px-6 py-3 font-semibold">Job</th>
                                        <th className="px-6 py-3 font-semibold">Status</th>
                                        <th className="px-6 py-3 font-semibold">Applications</th>
                                        <th className="px-6 py-3 font-semibold">Posted</th>
                                        <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentJobs.map(job => (
                                        <tr key={job.id} className="hover:bg-gray-50/60 transition-colors">
                                            {/* Job info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <InitialsAvatar name={job.title} color={pickColor(job.title)} />
                                                    <div className="min-w-0">
                                                        <p className="text-base font-semibold text-gray-900 truncate">{job.title}</p>
                                                        <p className="text-sm text-gray-400 truncate">{profile?.company_name ?? 'Company'} · {job.location ?? 'Remote'}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <StatusBadge status={job.status} />
                                            </td>

                                            {/* Applications */}
                                            <td className="px-6 py-4 text-base text-gray-600 font-medium">
                                                {job.applications_count}
                                            </td>

                                            {/* Posted date */}
                                            <td className="px-6 py-4 text-base text-gray-500">
                                                {fmtDate(job.created_at)}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={route('employer.jobs.applications', job.id)}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl
                                                               text-gray-400 hover:text-avaa-primary hover:bg-avaa-primary-light
                                                               transition-colors"
                                                    title="View Applicants"
                                                >
                                                    <IcoEye />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}