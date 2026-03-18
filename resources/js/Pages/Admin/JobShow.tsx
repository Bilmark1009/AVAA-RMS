import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ImageInitialsFallback from '@/Components/ImageInitialsFallback';

/* ── Types ── */
interface Employer {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string | null;
}

interface Job {
    id: number;
    title: string;
    company: string;
    logo_url?: string | null;
    location: string;
    employment_type: string;
    is_remote: boolean;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    description: string;
    skills_required: string[];
    experience_level: string | null;
    industry: string | null;
    status: string;
    deadline: string | null;
    created_at: string;
    employer: Employer | null;
}

interface AppCounts {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

interface Props { job: Job; appCounts: AppCounts }

/* ── Helpers ── */
function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) !== 1 ? 's' : ''} ago`;
    const days = Math.floor(diff / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function formatSalary(min: number | null, max: number | null, currency: string) {
    if (!min && !max) return null;
    const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;
    if (min && max) return `${currency} ${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${currency} ${fmt(min)}`;
    return `Up to ${currency} ${fmt(max!)}`;
}

const AVATAR_BG = ['bg-[#3d9e9e]', 'bg-slate-700', 'bg-emerald-600', 'bg-violet-600', 'bg-rose-500', 'bg-amber-600'];

/* ── Icons ── */
const IcoMapPin = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z" />
    </svg>
);
const IcoClock2 = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const IcoEye = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const IcoChevLeft = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const IcoUsers2 = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);

function InsightRow({ label, value, badge }: { label: string; value: string | number; badge?: string }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            {badge ? (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge === 'active' ? 'bg-emerald-50 text-emerald-700' :
                        badge === 'inactive' ? 'bg-gray-100 text-gray-500' :
                            'bg-amber-50 text-amber-700'}`}>{badge.charAt(0).toUpperCase() + badge.slice(1)}</span>
            ) : (
                <span className="text-sm font-semibold text-gray-800">{value}</span>
            )}
        </div>
    );
}

export default function AdminJobShow({ job, appCounts }: Props) {
    const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
    const bgIdx = job.id % AVATAR_BG.length;
    const companyInitials = job.company.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const employerInitials = job.employer
        ? `${job.employer.first_name[0] ?? ''}${job.employer.last_name[0] ?? ''}`.toUpperCase()
        : '?';

    return (
        <>
            <Head title={`${job.title} – Admin`} />
            <AppLayout pageTitle="Job Details" pageSubtitle="Monitor and manage job details." activeNav="Jobs">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
                    <Link href={route('admin.jobs.index')} className="hover:text-[#3d9e9e] transition-colors font-medium flex items-center gap-1">
                        <IcoChevLeft />Jobs
                    </Link>
                    <span>/</span>
                    <span className="text-[#3d9e9e] font-semibold">{job.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* ── Left / main column ── */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Job header card */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="h-20 bg-gradient-to-r from-[#3d9e9e]/70 via-[#3d9e9e] to-emerald-400" />
                            <div className="px-6 pb-6 -mt-8">
                                <div className="flex items-end gap-4 mb-4">
                                    <ImageInitialsFallback
                                        src={job.logo_url}
                                        alt={job.company}
                                        initials={companyInitials}
                                        className={`w-16 h-16 rounded-2xl ring-4 ring-white overflow-hidden shadow-md ${job.logo_url ? 'bg-white border border-gray-200' : AVATAR_BG[bgIdx]}`}
                                        imgClassName="w-full h-full object-cover"
                                        textClassName="text-white text-xl font-bold flex items-center justify-center"
                                    />
                                    <div className="pb-1">
                                        <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                                        <div className="flex items-center flex-wrap gap-3 mt-1">
                                            <span className="text-sm text-gray-500 font-medium">{job.company}</span>
                                            <span className="flex items-center gap-1 text-xs text-gray-400"><IcoMapPin />{job.is_remote ? 'Remote' : job.location}</span>
                                            <span className="flex items-center gap-1 text-xs text-gray-400"><IcoClock2 />{timeAgo(job.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            {job.employment_type && (
                                                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">{job.employment_type}</span>
                                            )}
                                            {salary && (
                                                <span className="px-2.5 py-0.5 bg-[#e8f4f4] text-[#3d9e9e] text-xs font-semibold rounded-full">{salary}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* View Applicants CTA */}
                                <Link
                                    href={route('admin.jobs.applications', job.id)}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#3d9e9e] hover:bg-[#347f7f] text-white font-semibold rounded-xl transition-colors text-sm"
                                >
                                    <IcoEye /> View Applicants ({appCounts.total})
                                </Link>
                            </div>
                        </div>

                        {/* Skills */}
                        {job.skills_required.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-sm font-bold text-gray-800 mb-3">Required Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills_required.map(s => (
                                        <span key={s} className="px-3 py-1.5 rounded-xl bg-[#e8f4f4] text-[#3d9e9e] text-xs font-semibold border border-[#3d9e9e]/15">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">Job Description</h3>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                            {job.experience_level && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Experience Level</p>
                                    <p className="text-sm font-medium text-gray-700">{job.experience_level}</p>
                                </div>
                            )}
                            {job.industry && (
                                <div className="mt-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Industry</p>
                                    <p className="text-sm font-medium text-gray-700">{job.industry}</p>
                                </div>
                            )}
                            {job.deadline && (
                                <div className="mt-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Application Deadline</p>
                                    <p className="text-sm font-medium text-gray-700">{new Date(job.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right sidebar ── */}
                    <div className="space-y-4">

                        {/* Posted by (employer info) */}
                        {job.employer && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-sm font-bold text-gray-800 mb-4">Posted By</h3>
                                <div className="flex items-center gap-3">
                                    <ImageInitialsFallback
                                        src={job.employer.avatar}
                                        alt={job.employer.first_name}
                                        initials={employerInitials}
                                        className={`w-11 h-11 rounded-full flex-shrink-0 overflow-hidden ${job.employer.avatar ? 'bg-white' : AVATAR_BG[job.employer.id % AVATAR_BG.length]}`}
                                        textClassName="text-white text-sm font-bold flex items-center justify-center"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {job.employer.first_name} {job.employer.last_name}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">{job.company}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Job Insights */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">Job Insights</h3>
                            <InsightRow label="Total Applicants" value={appCounts.total} />
                            <InsightRow label="Approved" value={appCounts.approved} />
                            <InsightRow label="Pending" value={appCounts.pending} />
                            <InsightRow label="Rejected" value={appCounts.rejected} />
                            <InsightRow label="Status" value={job.status} badge={job.status} />
                            {salary && <InsightRow label="Salary" value={salary} />}
                        </div>

                        {/* Quick applicant counts */}
                        <div className="grid grid-cols-2 gap-3">
                            {([
                                { label: 'Total', val: appCounts.total, color: 'text-[#3d9e9e] bg-[#e8f4f4]' },
                                { label: 'Approved', val: appCounts.approved, color: 'text-emerald-700 bg-emerald-50' },
                                { label: 'Pending', val: appCounts.pending, color: 'text-amber-700 bg-amber-50' },
                                { label: 'Rejected', val: appCounts.rejected, color: 'text-red-600 bg-red-50' },
                            ] as const).map(item => (
                                <div key={item.label} className={`${item.color} rounded-xl p-3 text-center`}>
                                    <p className="text-xl font-bold">{item.val}</p>
                                    <p className="text-xs font-medium opacity-80 mt-0.5">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* View applicants button */}
                        <Link
                            href={route('admin.jobs.applications', job.id)}
                            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[#3d9e9e] text-[#3d9e9e] hover:bg-[#3d9e9e] hover:text-white font-semibold rounded-xl transition-all text-sm"
                        >
                            <IcoUsers2 /> View All Applicants
                        </Link>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
