import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';

/* ── Types ── */
interface JobListing {
    id: number;
    title: string;
    location: string;
    company: string;
    employment_type?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    salary_currency?: string;
    skills_required?: string[];
    posted_date: string;
    description?: string;
    responsibilities?: string[];
    qualifications?: string[];
    project_timeline?: string;        
    application_process?: string;     
    onboarding_process?: string;
    experience_level?: string | null;
    is_remote?: boolean;
    has_applied?: boolean;
    industry?: string | null;
}

interface Recruiter { name: string; title: string; avatar?: string }

interface SimilarJob {
    id: number; title: string; company: string; location: string;
    salary_min?: number | null; salary_max?: number | null; salary_currency?: string; is_remote?: boolean;
}

interface Props {
    job: JobListing;
    recruiter?: Recruiter | null;
    similarJobs?: SimilarJob[];
    isSaved?: boolean;
    hasApplied?: boolean;
}

/* ── Helpers ── */
const AVATAR_COLORS = ['bg-[#3d6b6b]', 'bg-[#4a7c6f]', 'bg-[#5a6e7e]', 'bg-[#4e5f6d]', 'bg-[#3b7070]', 'bg-[#566474]'];
const getInitials = (name: string) => name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function formatSalary(min?: number | null, max?: number | null, currency = 'USD') {
    if (!min && !max) return null;
    const sym = currency === 'PHP' ? '₱' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    const fmt = (n: number) => {
        const num = Number(n);
        return num >= 1000 ? `${sym}${Math.round(num / 1000)}k` : `${sym}${num.toLocaleString()}`;
    };
    if (min && max) return `${fmt(min)}-${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max!)}`;
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function JobDetail({ job, recruiter, similarJobs = [], isSaved: initialSaved = false, hasApplied: initialApplied = false }: Props) {
    const [saved, setSaved] = useState(initialSaved);
    const [applied, setApplied] = useState(initialApplied || job.has_applied || false);

    const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

    const handleApply = () => {
        router.visit(route('job-seeker.jobs.apply.form', job.id));
    };

    const toggleSave = () => {
        if (saved) { setSaved(false); router.delete(route('job-seeker.jobs.unsave', job.id), { preserveScroll: true }); }
        else { setSaved(true); router.post(route('job-seeker.jobs.save', job.id), {}, { preserveScroll: true }); }
    };

    return (
        <AppLayout activeNav="Jobs" pageTitle="Job Details">
            <Head title={job.title} />

            {/* Breadcrumb — 14px standard */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href={route('job-seeker.jobs.browse')} className="hover:text-avaa-teal transition-colors font-medium">Home</Link>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
                <span className="text-avaa-teal font-semibold">Job Details</span>
            </nav>

            <div className="flex gap-7 items-start">

                {/* ── Main content ── */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                        {/* Job header */}
                        <div className="p-8 border-b border-gray-100">
                            <div className="flex items-start gap-5">
                                <div className={`w-16 h-16 rounded-full ${avatarColor(job.id)} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                                    {getInitials(job.company)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl font-extrabold text-avaa-dark leading-tight">{job.title}</h1>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span className="font-semibold text-gray-700">{job.company}</span>
                                        <span className="flex items-center gap-1.5">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z" />
                                            </svg>
                                            {job.is_remote ? 'Remote' : job.location}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            {timeAgo(job.posted_date)}
                                        </span>
                                    </div>
                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {job.employment_type && (
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full">
                                                {job.employment_type}
                                            </span>
                                        )}
                                        {salary && (
                                            <span className="px-3 py-1 bg-avaa-primary-light text-avaa-teal text-sm font-semibold rounded-full">
                                                {salary}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CTA buttons — 44px tall standard */}
                            <div className="flex items-center gap-3 mt-6">
                                <button onClick={handleApply} disabled={applied}
                                    className="flex-1 h-11 bg-avaa-primary hover:bg-avaa-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-[15px]">
                                    {applied ? 'Applied ✓' : 'Apply Now'}
                                </button>
                                <button onClick={toggleSave}
                                    className={`flex items-center gap-2 px-5 h-11 rounded-xl border font-semibold text-sm transition-all ${saved
                                        ? 'border-avaa-primary/30 bg-avaa-primary-light text-avaa-teal'
                                        : 'border-gray-200 text-gray-600 hover:border-avaa-primary/30 hover:text-avaa-teal hover:bg-avaa-primary-light'}`}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                    </svg>
                                    {saved ? 'Saved' : 'Save Job'}
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-7">

                            {/* Skills */}
                            {job.skills_required && job.skills_required.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {job.skills_required.map(s => (
                                        <span key={s} className="px-3 py-1.5 bg-avaa-primary-light text-avaa-teal text-sm font-semibold rounded-full border border-avaa-primary/20">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Description */}
                            {job.description && (
                                <div>
                                    <h3 className="text-base font-bold text-avaa-dark mb-3">Job Description</h3>
                                    <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                                </div>
                            )}

                            {/* Responsibilities */}
                            {job.responsibilities && job.responsibilities.length > 0 && (
                                <div>
                                    <h3 className="text-base font-bold text-avaa-dark mb-3">Responsibilities</h3>
                                    <ul className="space-y-2">
                                        {job.responsibilities.map((r, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[15px] text-gray-600">
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-avaa-teal flex-shrink-0" />{r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Qualifications */}
                            {job.qualifications && job.qualifications.length > 0 && (
                                <div>
                                    <h3 className="text-base font-bold text-avaa-dark mb-3">Qualifications</h3>
                                    <ul className="space-y-2">
                                        {job.qualifications.map((q, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[15px] text-gray-600">
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-avaa-teal flex-shrink-0" />{q}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {/* ─── NEW SECTIONS ─── */}

                            {/* Project Timeline */}
                            {job.project_timeline && (
                                <div>
                                    <h3 className="text-base font-bold text-avaa-dark mb-3">Project Timeline</h3>
                                    <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        {job.project_timeline}
                                    </p>
                                </div>
                            )}

                            {/* Application Process */}
                            {job.application_process && (
                                <div>
                                    <h3 className="text-base font-bold text-avaa-dark mb-3">Application Process</h3>
                                    <div className="relative border-l-2 border-dashed border-avaa-teal/30 ml-2 pl-6 py-1 space-y-4">
                                        <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line">
                                            {job.application_process}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Onboarding Process */}
                            {job.onboarding_process && (
                                <div>
                                    <h3 className="text-base font-bold text-avaa-dark mb-3">Onboarding Process</h3>
                                    <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl">
                                        <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
                                            {job.onboarding_process}
                                        </p>
                                    </div>
                                </div>
                            )}

                        {/* Footer */}
                        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
                            <span className="hover:text-gray-600 cursor-pointer transition-colors">Report this job posting</span>
                            <div className="flex items-center gap-4">
                                <button className="hover:text-avaa-teal transition-colors">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                    </svg>
                                </button>
                                <button className="hover:text-red-400 transition-colors">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right sidebar ── */}
                <div className="hidden lg:flex flex-col gap-5 w-72 flex-shrink-0">

                    {/* Meet the Recruiter */}
                    {recruiter && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h3 className="text-base font-bold text-avaa-dark mb-5">Meet the Recruiter</h3>
                            <div className="flex items-center gap-4 mb-5">
                                {recruiter.avatar ? (
                                    <img src={recruiter.avatar} alt={recruiter.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-avaa-dark flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {getInitials(recruiter.name)}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-[15px] font-semibold text-avaa-dark">{recruiter.name}</p>
                                    <p className="text-sm text-gray-500 truncate">{recruiter.title}</p>
                                </div>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 h-10 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-avaa-primary hover:text-avaa-teal hover:bg-avaa-primary-light transition-all">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                </svg>
                                Message {recruiter.name.split(' ')[0]}
                            </button>
                        </div>
                    )}

                    {/* Similar Jobs */}
                    {similarJobs.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h3 className="text-base font-bold text-avaa-dark mb-5">Similar Jobs</h3>
                            <div className="space-y-5">
                                {similarJobs.slice(0, 3).map(sj => {
                                    const sjSalary = formatSalary(sj.salary_min, sj.salary_max, sj.salary_currency);
                                    return (
                                        <div key={sj.id} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                                            <button onClick={() => router.visit(route('job-seeker.jobs.show', sj.id))}
                                                className="text-[15px] font-semibold text-avaa-dark hover:text-avaa-teal transition-colors text-left block leading-snug">
                                                {sj.title}
                                            </button>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {sj.company} · {sj.is_remote ? 'Remote' : sj.location}
                                            </p>
                                            {sjSalary && <p className="text-sm font-semibold text-avaa-teal mt-1">{sjSalary}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={() => router.visit(route('job-seeker.jobs.browse'))}
                                className="w-full mt-5 h-10 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-avaa-primary-light hover:text-avaa-teal hover:border-avaa-primary/30 transition-all">
                                View All
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}