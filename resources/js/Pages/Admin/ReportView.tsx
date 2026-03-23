import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';

import {
    JobDetailsModal,
    MessageDetailsModal,
    DeclineModal,
    SuspendModal,
    BanModal,
} from '@/Components/Modals/ReportModals';

import type { Report, ModalType } from '@/Components/Modals/ReportModals';


/* ── Icons ── */
const IcoFlag = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
);

const IcoEye = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

const IcoHighPriority = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const IcoChat = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

interface Props {
    reports?: Report[];
    filters?: { status: string; tab: string };
}



/* ── Evidence Screenshots Component ── */
function EvidenceScreenshots({ evidence }: { evidence?: string[] }) {
    if (!evidence || evidence.length === 0) {
        return (
            <p className="text-xs text-gray-400 italic">No screenshots uploaded</p>
        );
    }
    return (
        <div className="flex flex-col gap-1.5">
            {evidence.map((url, i) => {
                const filename = url.split('/').pop() || `screenshot_${i + 1}`;
                return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-avaa-primary hover:underline truncate">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span className="truncate">{filename}</span>
                    </a>
                );
            })}
        </div>
    );
}

/* ── Pending Job Report Card ── */
function PendingJobCard({ report, onViewDetails }: { report: Report; onViewDetails: () => void }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3">
                        <div className="mt-1 text-orange-400"><IcoFlag /></div>
                        <div>
                            <h3 className="text-base font-bold text-gray-800">{report.job_title}</h3>
                            <p className="text-sm text-gray-400">{report.company} • {report.location}</p>
                        </div>
                    </div>
                    <span className="bg-orange-50 text-orange-500 border border-orange-100 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        {report.report_count_total} reports
                    </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-5">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Reported Reason:</p>
                    <p className="text-sm font-bold text-gray-800 mb-1">{report.reason_title}</p>
                    <p className="text-sm text-gray-500">{report.reason_description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <button
                onClick={onViewDetails}
                className="w-full py-3.5 bg-white border-t border-gray-100 flex items-center justify-center gap-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
                <IcoEye /> View Details
            </button>
        </div>
    );
}

/* ── Pending Message Card ── */
function PendingMessageCard({ report, onViewDetails }: { report: Report; onViewDetails: () => void }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3">
                        <div className="mt-1 text-orange-400"><IcoFlag /></div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-base font-bold text-gray-800">{report.employer_name || report.job_title}</h3>
                                <span className="bg-[#76a09a]/10 text-[#76a09a] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#76a09a]/20">Employer</span>
                            </div>
                            <p className="text-xs text-gray-400">Reported by {report.reported_by}</p>
                        </div>
                    </div>
                    {report.is_high_priority && (
                        <span className="flex items-center gap-1 bg-red-50 text-red-500 border border-red-100 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                            <IcoHighPriority /> High Priority
                        </span>
                    )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Reported Reason:</p>
                    <p className="text-sm font-bold text-gray-800 mb-1">{report.reason_title}</p>
                    <p className="text-sm text-gray-500">{report.reason_description}</p>
                </div>

                <div className="mb-2">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-gray-400"><IcoChat /></span>
                        <p className="text-sm font-bold text-gray-700">Uploaded Chat Evidences</p>
                    </div>
                    <div className="border border-gray-100 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                            </span>
                            <p className="text-xs font-bold text-gray-600">Screenshot{report.evidence && report.evidence.length > 1 ? 's' : ''}</p>
                        </div>
                        <EvidenceScreenshots evidence={report.evidence} />
                    </div>
                </div>
            </div>
            <button
                onClick={onViewDetails}
                className="w-full py-3.5 bg-white border-t border-gray-100 flex items-center justify-center gap-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
                <IcoEye /> View Details
            </button>
        </div>
    );
}

/* ── Approved / Declined Summary Card ── */
function SummaryCard({ report, type, onViewAppeal }: { report: Report; type: 'approved' | 'declined'; onViewAppeal?: () => void }) {
    const isApproved = type === 'approved';
    const isMessage = report.type === 'message';
    const title = isMessage ? (report.employer_name || report.job_title) : report.job_title;
    const subtitle = isMessage ? null : `${report.company} • ${report.location}`;
    const hasAppeal = report.appeal_message && report.appealed_at;

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all ${
            hasAppeal ? 'border-orange-100' : 'border-gray-100'
        }`}>
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-base font-bold text-gray-800">{title}</h3>
                        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        {hasAppeal ? (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap ${
                                report.appeal_status === 'pending'
                                    ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                    : report.appeal_status === 'approved'
                                    ? 'bg-green-50 text-green-600 border-green-100'
                                    : 'bg-red-50 text-red-600 border-red-100'
                            }`}>
                                Appeal {report.appeal_status || 'pending'}
                            </span>
                        ) : (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap ${
                                isApproved
                                    ? 'bg-[#76a09a]/10 text-[#76a09a] border-[#76a09a]/20'
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                                {isApproved ? 'Approved' : 'Declined'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">{isApproved ? 'Action Taken' : 'Action'}</p>
                        <p className="text-sm font-bold text-gray-700">{report.action_taken || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Employer Status</p>
                        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${
                            report.employer_status === 'Suspended'
                                ? 'bg-red-50 text-red-500 border-red-100'
                                : 'text-green-600 bg-green-50 border-green-100'
                        }`}>
                            {report.employer_status || 'Active'}
                        </span>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">{isApproved ? 'Approved By' : 'Declined By'}</p>
                        <p className="text-sm font-bold text-gray-700">{isApproved ? report.approved_by : report.declined_by}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">{isApproved ? 'Approved Date' : 'Declined Date'}</p>
                        <p className="text-sm font-bold text-gray-700">{isApproved ? report.approved_date : report.declined_date}</p>
                    </div>
                </div>

                {/* Appeal Section */}
                {hasAppeal && (
                    <div className="mt-4 pt-4 border-t border-orange-100">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-sm font-bold text-gray-800 mb-1">Appeal Submitted</p>
                                <p className="text-xs text-gray-500">{report.appealed_at}</p>
                            </div>
                            <button
                                onClick={onViewAppeal}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold rounded-lg transition-colors border border-orange-100"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                View Appeal
                            </button>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                            <p className="text-xs text-orange-700 line-clamp-2">{report.appeal_message}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Main Component ── */
export default function ReportView({ reports = [], filters }: Props) {
    const [tab, setTab] = useState<'job_posts' | 'messages'>(
        (filters?.tab as 'job_posts' | 'messages') ?? 'job_posts'
    );
    const [status, setStatus] = useState(filters?.status ?? 'pending');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [modal, setModal] = useState<ModalType | 'appeal'>(null);

    const openModal = (report: Report, type: ModalType | 'appeal') => {
        setSelectedReport(report);
        setModal(type);
    };

    const closeAllModals = () => {
        setModal(null);
        setSelectedReport(null);
    };

    const refreshReports = () => {
        try {
            router.get(route('admin.reports.index'), { status, tab }, { preserveState: true, preserveScroll: true });
        } catch (e) {
            // preview mode
        }
    };

    const handleTabChange = (newTab: 'job_posts' | 'messages') => {
        setTab(newTab);
        setStatus('pending');
        try {
            router.get(route('admin.reports.index'), { status: 'pending', tab: newTab }, { preserveState: true });
        } catch (e) {
            // preview mode
        }
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        try {
            router.get(route('admin.reports.index'), { status: newStatus, tab }, { preserveState: true });
        } catch (e) {
            // preview mode
        }
    };

    const displayReports = reports;

    return (
        <>
            <Head title="Report View Center" />
            <AppLayout
                pageTitle="Report View Center"
                pageSubtitle="Review reported job postings and take action on violations."
                activeNav="Report View"
            >
                {/* ── Top Tab: Job Posts / Messages ── */}
                <div className="flex gap-6 border-b border-gray-100 mb-6">
                    {[
                        { key: 'job_posts', label: 'Job Posts' },
                        { key: 'messages', label: 'Messages' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handleTabChange(key as 'job_posts' | 'messages')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                                tab === key
                                    ? 'border-gray-800 text-gray-800'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Status Tabs ── */}
                <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1 w-fit mb-8 shadow-sm">
                    {['pending', 'approved', 'decline', 'appeals'].map((s) => (
                        <button
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                                status === s
                                    ? 'bg-[#76a09a] text-white shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {s === 'appeals' ? 'Appeals' : s}
                        </button>
                    ))}
                </div>

                {/* ── Report Cards ── */}
                <div className="space-y-6">
                    {displayReports.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
                            <p className="text-gray-400 font-medium">No reports found in this category.</p>
                        </div>
                    ) : status === 'pending' ? (
                        displayReports.map((report) =>
                            report.type === 'message' ? (
                                <PendingMessageCard
                                    key={report.id}
                                    report={report}
                                    onViewDetails={() => openModal(report, 'details')}
                                />
                            ) : (
                                <PendingJobCard
                                    key={report.id}
                                    report={report}
                                    onViewDetails={() => openModal(report, 'details')}
                                />
                            )
                        )
                    ) : status === 'appeals' ? (
                        displayReports.map((report) => (
                            <SummaryCard
                                key={report.id}
                                report={report}
                                type={report.action_taken?.toLowerCase().includes('suspend') ? 'approved' : 'declined'}
                                onViewAppeal={() => openModal(report, 'appeal')}
                            />
                        ))
                    ) : status === 'approved' ? (
                        displayReports.map((report) => (
                            <SummaryCard
                                key={report.id}
                                report={report}
                                type="approved"
                                onViewAppeal={() => openModal(report, 'appeal')}
                            />
                        ))
                    ) : (
                        displayReports.map((report) => (
                            <SummaryCard
                                key={report.id}
                                report={report}
                                type="declined"
                                onViewAppeal={() => openModal(report, 'appeal')}
                            />
                        ))
                    )}
                </div>

                {/* ── Modals (from ReportModals.tsx) ── */}
                {selectedReport && modal === 'details' && (
                    tab === 'messages' ? (
                        <MessageDetailsModal
                            report={selectedReport}
                            onClose={closeAllModals}
                            onDecline={() => setModal('decline')}
                            onSuspend={() => setModal('suspend')}
                            // onBan={() => setModal('ban')}
                        />
                    ) : (
                        <JobDetailsModal
                            report={selectedReport}
                            onClose={closeAllModals}
                            onDecline={() => setModal('decline')}
                            onSuspend={() => setModal('suspend')}
                            // onBan={() => setModal('ban')}
                        />
                    )
                )}

                {selectedReport && modal === 'decline' && (
                    <DeclineModal
                        report={selectedReport}
                        tab={tab}
                        onClose={closeAllModals}
                        onConfirm={() => {
                            closeAllModals();
                            refreshReports();
                        }}
                    />
                )}

                {selectedReport && modal === 'suspend' && (
                    <SuspendModal
                        report={selectedReport}
                        tab={tab}
                        onClose={closeAllModals}
                        onConfirm={() => {
                            closeAllModals();
                            refreshReports();
                        }}
                    />
                )}

                {selectedReport && modal === 'ban' && (
                    <BanModal
                        report={selectedReport}
                        tab={tab}
                        onClose={closeAllModals}
                        onConfirm={() => {
                            closeAllModals();
                            refreshReports();
                        }}
                    />
                )}

                {/* Appeal Details Modal */}
                {selectedReport && modal === 'appeal' && selectedReport.appeal_message && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAllModals} />
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                            <div className="h-12 bg-gradient-to-r from-orange-600 to-orange-500 flex-shrink-0 flex items-center px-5 justify-between">
                                <h2 className="text-white font-bold text-sm">Appeal Details</h2>
                                <button onClick={closeAllModals} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 mb-1">Job/Posting</p>
                                    <p className="text-sm text-gray-600">{selectedReport.job_title || selectedReport.employer_name}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-900 mb-1">Appeal Status</p>
                                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${
                                        selectedReport.appeal_status === 'pending'
                                            ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                            : selectedReport.appeal_status === 'approved'
                                            ? 'bg-green-50 text-green-600 border-green-100'
                                            : 'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                        {selectedReport.appeal_status || 'Pending'}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-900 mb-1">Submitted Date</p>
                                    <p className="text-sm text-gray-600">{selectedReport.appealed_at}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-900 mb-2">Employer's Message</p>
                                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                                        <p className="text-sm text-orange-700 whitespace-pre-wrap">{selectedReport.appeal_message}</p>
                                    </div>
                                </div>

                                {selectedReport.appeal_status === 'pending' && (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 mb-2">Admin Decision Note <span className="text-gray-400 font-normal">(optional)</span></p>
                                        <textarea
                                            id="appeal-decision-note"
                                            placeholder="Add a note about your decision..."
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 text-gray-800 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 resize-none"
                                        />
                                    </div>
                                )}

                                {selectedReport.appeal_decision_note && selectedReport.appeal_status !== 'pending' && (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 mb-2">Admin Decision Note</p>
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReport.appeal_decision_note}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-end flex-shrink-0 bg-gray-50/50 gap-2">
                                {selectedReport.appeal_status === 'pending' ? (
                                    <>
                                        <button 
                                            onClick={() => {
                                                const noteEl = document.getElementById('appeal-decision-note') as HTMLTextAreaElement | null;
                                                const decisionNote = noteEl?.value?.trim() || '';
                                                router.patch(route('admin.appeals.reject', selectedReport.id), { decision_note: decisionNote }, { 
                                                    onSuccess: () => {
                                                        closeAllModals();
                                                        refreshReports();
                                                    }
                                                });
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                                        >
                                            Decline Appeal
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const noteEl = document.getElementById('appeal-decision-note') as HTMLTextAreaElement | null;
                                                const decisionNote = noteEl?.value?.trim() || '';
                                                router.patch(route('admin.appeals.approve', selectedReport.id), { decision_note: decisionNote }, { 
                                                    onSuccess: () => {
                                                        closeAllModals();
                                                        refreshReports();
                                                    }
                                                });
                                            }}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors"
                                        >
                                            Approve Appeal
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={closeAllModals} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </AppLayout>
        </>
    );
}