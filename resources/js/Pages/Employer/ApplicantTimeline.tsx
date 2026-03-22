import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ImageInitialsFallback from "@/Components/ImageInitialsFallback";

interface Props {
    applicant: any;
    currentPosition: any;
    pastPlacements: any[];
    manualExperiences: any[];
}

export default function ApplicantTimeline({
    applicant,
    currentPosition,
    pastPlacements = [],
    manualExperiences = [],
}: Props) {
    if (!applicant) return null;

    const displayName =
        applicant.full_name ?? applicant.name ?? "No Data Available";

    const formatUrl = (path?: string | null) => {
        if (!path) return null;
        // If the path already contains 'storage', don't double it
        if (path.includes("storage/")) return path;
        return path.startsWith("http") ? path : `/storage/${path}`;
    };

    return (
        <AppLayout>
            <Head title={`${displayName} - Applicant Profile`} />

            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 pb-12">
                {/* ══ LEFT COLUMN ══ */}
                <div className="flex-1 space-y-6">
                    {/* Profile Header Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="h-32 bg-gradient-to-r from-[#5a8b8b] to-[#7db0a1]" />
                        <div className="px-8 pb-8">
                            <div className="flex justify-between items-end -mt-12 mb-6">
                                <ImageInitialsFallback
                                    src={formatUrl(applicant.avatar)}
                                    alt={`${displayName}'s profile picture`}
                                    initials={
                                        applicant.first_name?.charAt(0) ?? "C"
                                    }
                                    className="w-24 h-24 rounded-2xl ring-4 ring-white shadow-lg bg-avaa-dark object-cover overflow-hidden"
                                />
                            </div>

                            {/* Name and Status Badge Container */}
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {displayName}
                                </h1>

                                {applicant.is_open_to_work ? (
                                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                        Open to Work
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                        Not Available
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-500 font-medium">
                                {applicant.title ?? "No Data Available"}
                            </p>

                            <div className="flex items-center gap-6 mt-2 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    {applicant.location ?? "No Data Available"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                    {applicant.email ?? "No Data Available"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ══ NEW ABOUT SECTION ══ */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            About
                        </h3>
                        <p className="text-gray-600 text-[15px] leading-relaxed">
                            {applicant.about ||
                                "No professional summary provided."}
                        </p>
                    </div>

                    {/* Core Skills Section */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">
                            Core Skills & Expertise
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {applicant.skills?.length > 0 ? (
                                applicant.skills.map(
                                    (skill: string, index: number) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl border border-emerald-100"
                                        >
                                            {skill}
                                        </span>
                                    ),
                                )
                            ) : (
                                <p className="text-sm text-gray-400">
                                    No Data Available
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Professional Experience Section */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-8">
                            Professional Experience
                        </h3>

                        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-100">
                            {/* 1. Current Position (Internal Platform Hire) */}
                            {currentPosition && (
                                <TimelineItem
                                    placement={currentPosition}
                                    isCurrent={true}
                                    isManual={false}
                                />
                            )}

                            {/* 2. Past Internal Placements (History within your company/platform) */}
                            {pastPlacements &&
                                pastPlacements.length > 0 &&
                                pastPlacements.map((p: any) => (
                                    <TimelineItem
                                        key={`placement-${p.id}`}
                                        placement={p}
                                        isCurrent={false}
                                        isManual={false}
                                    />
                                ))}

                            {/* 3. Manual/External Experiences (History from other companies like Denso Ten) */}
                            {manualExperiences &&
                                manualExperiences.length > 0 &&
                                manualExperiences.map((exp: any) => (
                                    <TimelineItem
                                        key={`manual-${exp.id}`}
                                        placement={exp}
                                        isCurrent={exp.is_current} // Use the specific status from the DB
                                        isManual={true}
                                    />
                                ))}

                            {/* Empty State: Only shows if all arrays are empty and currentPosition is null */}
                            {(!currentPosition ||
                                Object.keys(currentPosition).length === 0) &&
                                pastPlacements.length === 0 &&
                                manualExperiences.length === 0 && (
                                    <div className="flex items-center gap-4 ml-6 py-4">
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center flex-shrink-0">
                                            <svg
                                                className="w-5 h-5 text-gray-300"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-gray-400 italic">
                                            No professional experience records
                                            found.
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Education Section */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">
                            Education
                        </h3>
                        <div className="space-y-6">
                            {applicant.education_history &&
                            applicant.education_history.length > 0 ? (
                                applicant.education_history.map(
                                    (edu: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="flex justify-between items-start"
                                        >
                                            <div>
                                                <h4 className="font-bold text-gray-800">
                                                    {edu.institution_name ??
                                                        "Institution Not Provided"}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {edu.degree ??
                                                        "Degree Not Provided"}
                                                    {edu.field
                                                        ? ` in ${edu.field}`
                                                        : ""}
                                                </p>
                                            </div>
                                            {/* Optional: Only show the year span if the data exists. 
                            If your DB doesn't have a year column, this will remain hidden.
                        */}
                                            {edu.year && (
                                                <span className="text-xs font-bold text-gray-400">
                                                    {edu.year}
                                                </span>
                                            )}
                                        </div>
                                    ),
                                )
                            ) : (
                                <p className="text-sm text-gray-400 italic">
                                    No education history provided.
                                </p>
                            )}
                        </div>
                    </div>

                    {/*Certifications Section */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">
                            Certifications
                        </h3>
                        <div className="space-y-4">
                            {applicant.certifications?.length > 0 ? (
                                applicant.certifications.map(
                                    (cert: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 p-3 rounded-xl border border-gray-50"
                                        >
                                            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0">
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path d="M12 15l-2 5L9 9l11 4-5 2zm0 0l4 8 3-10-10-3 3 5z"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-800">
                                                    {cert.name}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {cert.issuer} • {cert.year}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                )
                            ) : (
                                <p className="text-sm text-gray-400">
                                    No Certifications Available
                                </p>
                            )}
                        </div>
                    </div>

                    {/*Portfolio & Projects Section */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">
                            Portfolio & Projects
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {applicant.projects?.length > 0 ? (
                                applicant.projects.map(
                                    (project: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-avaa-teal transition-colors group"
                                        >
                                            <h4 className="font-bold text-gray-800 text-sm mb-1">
                                                {project.title ??
                                                    "Project Title"}
                                            </h4>
                                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                                {project.description ??
                                                    "No description available."}
                                            </p>
                                            {project.url && (
                                                <a
                                                    href={project.url}
                                                    target="_blank"
                                                    className="text-xs font-bold text-avaa-teal flex items-center gap-1 group-hover:underline"
                                                >
                                                    View Project
                                                    <svg
                                                        width="12"
                                                        height="12"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2.5"
                                                    >
                                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                        <polyline points="15 3 21 3 21 9"></polyline>
                                                        <line
                                                            x1="10"
                                                            y1="14"
                                                            x2="21"
                                                            y2="3"
                                                        ></line>
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    ),
                                )
                            ) : (
                                <p className="text-sm text-gray-400">
                                    No Projects Available
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ══ RIGHT COLUMN ══ */}
                <div className="w-full lg:w-80 space-y-6">
                    {/* Availability Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
                            Availability
                        </h3>
                        <div className="space-y-4">
                            {[
                                {
                                    label: "Weekly Hours",
                                    value:
                                        applicant.availability?.weekly_hours ||
                                        "No Data Available",
                                },
                                {
                                    label: "Notice Period",
                                    value:
                                        applicant.availability?.notice_period ||
                                        "No Data Available",
                                },
                                {
                                    label: "Work Style",
                                    value:
                                        applicant.availability?.work_style ||
                                        "No Data Available",
                                },
                                {
                                    label: "Preferred Location",
                                    value:
                                        applicant.availability
                                            ?.preferred_location ||
                                        "No Data Available",
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex justify-between items-center text-sm"
                                >
                                    <span className="text-gray-400 font-medium">
                                        {stat.label}
                                    </span>
                                    <span className="text-gray-800 font-bold">
                                        {stat.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {applicant.resume_path ? (
                            <a
                                href={formatUrl(applicant.resume_path) ?? "#"}
                                download={`${applicant.full_name.replace(/\s+/g, "_")}_Resume.pdf`}
                                className="w-full mt-6 py-3 bg-avaa-teal text-white text-xs font-bold rounded-xl shadow-sm hover:bg-opacity-90 transition-all uppercase tracking-widest flex items-center justify-center no-underline"
                            >
                                Download Resume
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="w-full mt-6 py-3 bg-gray-200 text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed uppercase tracking-widest border border-gray-300"
                            >
                                No Resume Available
                            </button>
                        )}
                    </div>

                    {/* Top Matches Jobs Section */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
                            Top Matches Jobs
                        </h3>
                        <div className="space-y-4">
                            {applicant.top_matches?.length > 0 ? (
                                applicant.top_matches.map(
                                    (job: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="pb-3 border-b border-gray-50 last:border-0 last:pb-0"
                                        >
                                            <p className="text-sm font-bold text-gray-800 hover:text-avaa-teal cursor-pointer transition-colors">
                                                {job.title ??
                                                    "No Data Available"}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">
                                                {job.match_score ?? "0"}% Match
                                                Score
                                            </p>
                                        </div>
                                    ),
                                )
                            ) : (
                                <p className="text-sm text-gray-400">
                                    No Data Available
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
function TimelineItem({ placement, isCurrent, isManual }: any) {
    // 1. Logic simplified: The controller now sends 'job_title' and 'company' directly
    // We use optional chaining and fallback to the nested job_listing only as a backup
    const title = placement?.job_title || placement?.job_listing?.title;
    const company = placement?.company || placement?.job_listing?.company?.name;

    // 2. Formatting the date range
    // The controller now sends 'start_date' and 'end_date' for both types
    const dateRange =
        placement?.is_current || isCurrent
            ? `${placement?.start_date ?? "N/A"} — Present`
            : `${placement?.start_date ?? "N/A"} — ${placement?.end_date ?? "N/A"}`;

    return (
        <div className="relative flex items-start gap-6 group">
            {/* Timeline Icon & Line connector */}
            <div
                className={`relative flex items-center justify-center w-12 h-12 rounded-xl border-4 border-white shadow-sm flex-shrink-0 z-10 
                ${isCurrent || placement?.is_current ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-400"}`}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect
                        x="2"
                        y="7"
                        width="20"
                        height="14"
                        rx="2"
                        ry="2"
                    ></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
            </div>

            <div className="flex-1 pt-1">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-800 text-base">
                        {title || "No Title Provided"}
                    </h4>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tabular-nums">
                        {dateRange}
                    </span>
                </div>

                <p className="text-sm font-bold text-avaa-teal mb-3">
                    {company || "No Company Provided"}
                </p>

                <div className="text-xs text-gray-500 leading-relaxed max-w-md">
                    {/* 3. Handle description fallback */}
                    <p className="whitespace-pre-line">
                        {placement?.description || placement?.responsibilities
                            ? `• ${placement.description || placement.responsibilities}`
                            : "No details provided."}
                    </p>
                </div>
            </div>
        </div>
    );
}
