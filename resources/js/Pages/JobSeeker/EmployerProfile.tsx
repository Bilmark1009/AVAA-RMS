import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ImageInitialsFallback from "@/Components/ImageInitialsFallback";
import { useState, useEffect, useRef } from 'react';
interface Props {
    member: any;
    postedJobs: any[];
}

export default function EmployerProfile({ member, postedJobs = [] }: Props) {
    // Prevent crash if member prop is missing
    if (!member) return null;

    const displayName = member.name ?? "Recruiter";
    const [savedIds, setSavedIds] = useState<Set<number>>(
        new Set(postedJobs.filter(j => j.is_saved).map(j => j.id))
    );
    
    // Helper to format salary: Removes decimals and adds 'k' shorthand
    const formatSalary = (min: number, max: number, currency: string) => {
        if (!min && !max) return "Negotiable";

        const formatValue = (val: number) => {
            if (val >= 1000) return `${Math.floor(val / 1000)}k`;
            return Math.floor(val).toString();
        };

        const symbol = currency === "USD" ? "$" : currency;
        return `${symbol}${formatValue(min)}-${symbol}${formatValue(max)}`;
    };

    // Helper for relative time
    const timeAgo = (dateString: string) => {
        if (!dateString) return "Recently";
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 3600 * 24),
        );
        return diffInDays === 0 ? "Today" : `${diffInDays}d ago`;
    };

    return (
        <AppLayout activeNav="Jobs" pageTitle={`${displayName}'s Profile`}>
            <Head title={`${displayName} - Profile`} />

            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
                {/* ══ LEFT COLUMN: Profile & Job Timeline ══ */}
                <div className="flex-1 space-y-6">
                    {/* Profile Header Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="h-32 bg-gradient-to-r from-[#5a8b8b] to-[#7db0a1]" />
                        <div className="px-8 pb-8">
                            <div className="flex justify-between items-end -mt-12 mb-6">
                                <ImageInitialsFallback
                                    src={member.avatar}
                                    alt={`${member.name ?? "Recruiter"}'s profile picture`}
                                    initials={member.name?.charAt(0) ?? "R"}
                                    className="w-24 h-24 rounded-2xl ring-4 ring-white shadow-md bg-avaa-dark object-cover overflow-hidden"
                                />
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">
                                    Active
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {member.name ?? "Unknown Name"}
                            </h1>
                            <p className="text-gray-500 font-medium">
                                {member.title ?? "Recruiter"}
                            </p>

                            {member.email && (
                                <a
                                    href={`mailto:${member.email}`}
                                    className="text-sm text-avaa-teal hover:underline mt-1 block"
                                >
                                    {member.email}
                                </a>
                            )}

                            <div className="mt-8 border-t border-gray-100 pt-6">
                                <h3 className="font-bold text-gray-800 mb-3">
                                    About
                                </h3>
                                <p className="text-gray-600 text-[15px] leading-relaxed">
                                    {member.about ||
                                        "This recruiter hasn't provided a bio yet."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Posted Jobs Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-avaa-teal rounded-full" />
                            Posted Jobs
                        </h3>

                        {postedJobs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {postedJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all flex flex-col gap-4"
                                    >
                                        {/* 1. Header: Avatar + Title (Centered) */}
                                        <div className="flex items-center gap-4">
                                            <ImageInitialsFallback
                                                src={job.company_logo}
                                                alt={`${job.company_name} logo`}
                                                initials={
                                                    job.company_name?.charAt(
                                                        0,
                                                    ) ?? "A"
                                                }
                                                className="w-12 h-12 rounded-full border border-gray-100 flex-shrink-0 object-cover overflow-hidden"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-[16px] font-bold text-gray-800 leading-tight truncate">
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-0.5 font-medium truncate">
                                                    {job.company_name}
                                                </p>
                                            </div>
                                        </div>

                                        {/* 2. Info Row: Location, Time, Type */}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <svg
                                                    className="w-4 h-4 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                </svg>
                                                {job.is_remote
                                                    ? "Remote"
                                                    : job.location}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg
                                                    className="w-4 h-4 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                {timeAgo(job.posted_date)}
                                            </span>
                                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full uppercase tracking-wide">
                                                {job.employment_type ||
                                                    "Full-time"}
                                            </span>
                                        </div>

                                        {/* 3. Skill Pills */}
                                        <div className="flex flex-wrap gap-2">
                                            {job.skills_required
                                                ?.slice(0, 3)
                                                .map((skill: string) => (
                                                    <span
                                                        key={skill}
                                                        className="text-[12px] px-3 py-1 bg-gray-50 text-gray-600 rounded-lg font-medium border border-gray-100"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                        </div>

                                        {/* 4. Footer: Salary + Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                            <div className="flex-shrink-0">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                                                    Salary Range
                                                </p>
                                                <p className="text-[15px] font-black text-gray-800 tracking-tight">
                                                    {formatSalary(
                                                        job.salary_min,
                                                        job.salary_max,
                                                        job.salary_currency,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                                    </svg>
                                                </button>
                                                <Link
                                                    href={route(
                                                        "job-seeker.jobs.show",
                                                        job.id,
                                                    )}
                                                    className="px-3 py-1.5 border border-gray-200 text-gray-700 text-[13px] font-bold rounded-xl hover:border-gray-400 transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                                {job.has_applied ? (
                                                    <button className="px-4 py-1.5 bg-emerald-100/80 text-emerald-700 text-[13px] font-bold rounded-xl">
                                                        Applied ✓
                                                    </button>
                                                ) : (
                                                    <button className="px-4 py-1.5 bg-avaa-teal text-white text-[13px] font-bold rounded-xl shadow-sm hover:bg-opacity-90">
                                                        Apply
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                                <p className="text-gray-500">
                                    No active job posts at the moment.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ══ RIGHT COLUMN: Stats & Details ══ */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">
                            Operational Overview
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                                <p className="text-xl font-bold text-avaa-teal">
                                    {postedJobs.length}
                                </p>
                                <p className="text-[10px] text-gray-400 font-black uppercase">
                                    Total Job Post
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                                <p className="text-xl font-bold text-avaa-teal">
                                    0
                                </p>
                                <p className="text-[10px] text-gray-400 font-black uppercase">
                                    Total Applicant
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">
                            Company Details
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: "Company", value: member.company },
                                { label: "Industry", value: member.industry },
                                { label: "Location", value: member.location },
                                {
                                    label: "Company Size",
                                    value: member.company_size,
                                },
                                {
                                    label: "Established",
                                    value: member.year_established
                                        ? `Since ${member.year_established}`
                                        : "N/A",
                                },
                            ].map((detail) => (
                                <div key={detail.label}>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                                        {detail.label}
                                    </p>
                                    <p className="text-sm font-bold text-gray-700">
                                        {detail.value || "N/A"}
                                    </p>
                                </div>
                            ))}
                            {member.website && (
                                <div className="pt-2">
                                    <a
                                        href={member.website}
                                        target="_blank"
                                        className="text-xs font-bold text-avaa-teal hover:underline"
                                    >
                                        Visit Website →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
