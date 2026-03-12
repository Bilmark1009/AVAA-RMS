import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';

/* ── Icons ── */
const IcoFlag = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
);

const IcoEye = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

/* ── Types ── */
interface Report {
    id: number;
    job_title: string;
    company: string;
    location: string;
    reason_title: string;
    reason_description: string;
    reported_by: string;
    reported_at: string;
    active_jobs_count: number;
    previous_reports_count: number;
    report_count_total: number;
}

interface Props {
    reports: Report[];
    filters: { status: string };
}

export default function ReportView({ reports = [], filters }: Props) {
    const [status, setStatus] = useState(filters?.status ?? 'pending');

    // ── PLACEHOLDER DATA ──
    const mockReports: Report[] = [
        {
            id: 1,
            job_title: "Junior UI/UX Designer",
            company: "NexusFlow",
            location: "New York, NY",
            reason_title: "Inappropriate language in job description",
            reason_description: "The job posting contains offensive language that violates our community guidelines.",
            reported_by: "Victoria Quinn",
            reported_at: "2 hours ago",
            active_jobs_count: 12,
            previous_reports_count: 1,
            report_count_total: 3
        },
        {
            id: 2,
            job_title: "DevOps Engineer",
            company: "Global Synergies",
            location: "Austin, TX",
            reason_title: "Misleading job requirements",
            reason_description: "The job posting advertises 'entry-level' but requires 5+ years of experience. This is misleading to job seekers.",
            reported_by: "Sarah Mitchell",
            reported_at: "5 hours ago",
            active_jobs_count: 6,
            previous_reports_count: 0,
            report_count_total: 2
        }
    ];

    // Use mock data if reports prop is empty
    const displayReports = reports.length > 0 ? reports : mockReports;

    const handleTabChange = (newStatus: string) => {
        setStatus(newStatus);
        // Only call router if the route exists, otherwise just update local state for preview
        try {
            router.get(route('admin.reports.index'), { status: newStatus }, { preserveState: true });
        } catch (e) {
            console.log("Routing not setup yet, just previewing state:", newStatus);
        }
    };

    return (
        <>
            <Head title="Report View Center" />
            <AppLayout
                pageTitle="Report View Center"
                pageSubtitle="Review reported job postings and take action on violations."
                activeNav="Report View"
            >
                {/* ── Status Tabs ── */}
                <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1 w-fit mb-8 shadow-sm">
                    {['pending', 'approved', 'decline'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all capitalize
                                ${status === tab 
                                    ? 'bg-[#76a09a] text-white shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ── Reports List ── */}
                <div className="space-y-6">
                    {displayReports.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
                            <p className="text-gray-400 font-medium">No reports found in this category.</p>
                        </div>
                    ) : (
                        displayReports.map((report) => (
                            <div key={report.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex gap-4">
                                            <div className="mt-1 text-orange-500">
                                                <IcoFlag />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 leading-tight">
                                                    {report.job_title}
                                                </h3>
                                                <p className="text-sm text-gray-400 font-medium">
                                                    {report.company} • {report.location}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                                            {report.report_count_total} reports
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-50 mb-6">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reported Reason:</p>
                                        <p className="text-sm font-bold text-gray-800 mb-1">{report.reason_title}</p>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {report.reason_description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase">Reported By</p>
                                            <p className="text-sm font-bold text-gray-700">{report.reported_by}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase">Reported Date</p>
                                            <p className="text-sm font-bold text-gray-700">{report.reported_at}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase">Active Jobs</p>
                                            <p className="text-sm font-bold text-gray-700">{report.active_jobs_count}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase">Previous Reports</p>
                                            <p className="text-sm font-bold text-gray-700">{report.previous_reports_count}</p>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full py-4 bg-white border-t border-gray-50 flex items-center justify-center gap-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                    <IcoEye /> View Details
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </AppLayout>
        </>
    );
}