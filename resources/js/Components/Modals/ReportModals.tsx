import { useState } from 'react';

/* ── Types ── */
export interface Report {
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
    salary_range?: string;
    posted?: string;
    type?: 'job' | 'message';
    employer_name?: string;
    is_high_priority?: boolean;
    action_taken?: string;
    employer_status?: string;
    approved_by?: string;
    approved_date?: string;
    declined_by?: string;
    declined_date?: string;
}

export type ModalType = 'details' | 'decline' | 'suspend' | 'ban' | null;

/* ── Icons ── */
const IcoFlag = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
);

const IcoClose = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const IcoAlert = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const IcoWarning = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const IcoCheck = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const IcoBriefcase = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

const IcoCircleOff = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
);

const IcoEye = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

const IcoImage = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
);

/* ── Shared: Modal Overlay Wrapper ── */
function ModalOverlay({ children }: { children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {children}
        </div>
    );
}

/* ── Shared: Section Label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{children}</p>
    );
}

/* ── Shared: Info Grid Row ── */
function InfoRow({ label, value, valueClass = 'text-gray-800' }: { label: string; value: React.ReactNode; valueClass?: string }) {
    return (
        <div>
            <SectionLabel>{label}</SectionLabel>
            <p className={`text-sm font-bold ${valueClass}`}>{value}</p>
        </div>
    );
}

/* ── Job Details Modal ── */
export function JobDetailsModal({ report, onClose, onDecline, onSuspend, onBan }: {
    report: Report;
    onClose: () => void;
    onDecline: () => void;
    onSuspend: () => void;
    onBan: () => void;
}) {
    return (
        <ModalOverlay>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{report.job_title}</h2>
                            <p className="text-sm text-gray-400 mt-0.5">{report.company} • {report.location}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mt-1 -mr-1">
                            <IcoClose />
                        </button>
                    </div>

                    {/* Report Information */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-orange-400"><IcoFlag /></span>
                            <h3 className="text-sm font-bold text-gray-700">Report Information</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-4">
                            <InfoRow label="Reported By" value={report.reported_by} />
                            <InfoRow label="Reported Date" value={report.reported_at} />
                            <InfoRow label="Total Reports" value={report.report_count_total} valueClass="text-orange-500" />
                            <InfoRow label="Reason" value={report.reason_title} />
                        </div>
                        <div className="bg-orange-50 border border-orange-100 rounded-xl px-5 py-4">
                            <p className="text-sm text-orange-600 leading-relaxed">{report.reason_description}</p>
                        </div>
                    </div>

                    <hr className="border-gray-100 mb-6" />

                    {/* Job Details */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-4">Job Details</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <InfoRow label="Title" value={report.job_title} />
                            <InfoRow label="Company" value={report.company} />
                            <InfoRow label="Salary Range" value={report.salary_range || 'N/A'} />
                            <InfoRow label="Posted" value={report.posted || 'N/A'} />
                        </div>
                    </div>

                    <hr className="border-gray-100 mb-6" />

                    {/* Company History */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-4">Company History</h3>
                        <div className="border border-gray-100 rounded-xl p-5">
                            <SectionLabel>Previous Reports</SectionLabel>
                            <p className="text-3xl font-bold text-gray-800">{report.previous_reports_count}</p>
                        </div>
                    </div>

                    {/* Warning */}
                    {report.previous_reports_count > 0 && (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 mb-6 flex gap-3">
                            <span className="text-gray-400 flex-shrink-0 mt-0.5"><IcoAlert /></span>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                This employer has {report.previous_reports_count} previous approved report{report.previous_reports_count > 1 ? 's' : ''}. Approving this report will lower their priority ranking.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button onClick={onDecline} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-2">
                            <IcoCircleOff /> Decline Report
                        </button>
                        <button onClick={onSuspend} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-orange-500 border border-orange-200 hover:bg-orange-50 transition-colors flex items-center gap-2">
                            <IcoWarning /> Suspend
                        </button>
                        <button onClick={onBan} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-2">
                            <IcoCircleOff /> Ban Account
                        </button>
                    </div>
                </div>
            </div>
        </ModalOverlay>
    );
}

/* ── Message Details Modal ── */
export function MessageDetailsModal({ report, onClose, onDecline, onSuspend, onBan }: {
    report: Report;
    onClose: () => void;
    onDecline: () => void;
    onSuspend: () => void;
    onBan: () => void;
}) {
    return (
        <ModalOverlay>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h2 className="text-xl font-bold text-gray-900">{report.employer_name || report.job_title}</h2>
                                <span className="bg-[#76a09a]/10 text-[#76a09a] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#76a09a]/20">Employer</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mt-1 -mr-1">
                            <IcoClose />
                        </button>
                    </div>

                    {/* Report Information */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-orange-400"><IcoFlag /></span>
                            <h3 className="text-sm font-bold text-gray-700">Report Information</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-4">
                            <InfoRow label="Reported By" value={report.reported_by} />
                            <InfoRow label="Reported Date" value={report.reported_at} />
                            <InfoRow label="Total Reports" value={report.report_count_total} valueClass="text-orange-500" />
                            <InfoRow label="Reason" value={report.reason_title} />
                        </div>
                        <div className="bg-orange-50 border border-orange-100 rounded-xl px-5 py-4">
                            <p className="text-sm text-orange-600 leading-relaxed">The message contains offensive language that violates our community guidelines</p>
                        </div>
                    </div>

                    <hr className="border-gray-100 mb-6" />

                    {/* Recruiter Details */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-4">Recruiter Details</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <InfoRow label="Title" value={report.employer_name || report.job_title} />
                            <InfoRow label="Company" value={report.company} />
                        </div>
                    </div>

                    <hr className="border-gray-100 mb-6" />

                    {/* Recruiter History */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-4">Recruiter History</h3>
                        <div className="border border-gray-100 rounded-xl p-5">
                            <SectionLabel>Previous Reports</SectionLabel>
                            <p className="text-3xl font-bold text-gray-800">{report.previous_reports_count}</p>
                        </div>
                    </div>

                    <hr className="border-gray-100 mb-6" />

                    {/* Uploaded Evidences */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-4">Uploaded Evidences</h3>
                        <div className="border border-gray-100 rounded-xl p-10 flex items-center justify-center text-gray-300">
                            <IcoImage />
                        </div>
                    </div>

                    {/* Warning */}
                    {report.previous_reports_count > 0 && (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 mb-6 flex gap-3">
                            <span className="text-gray-400 flex-shrink-0 mt-0.5"><IcoAlert /></span>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                This employer has {report.previous_reports_count} previous approved report{report.previous_reports_count > 1 ? 's' : ''}. Approving this report will lower their priority ranking.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button onClick={onDecline} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-2">
                            <IcoCircleOff /> Decline Report
                        </button>
                        <button onClick={onSuspend} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-orange-500 border border-orange-200 hover:bg-orange-50 transition-colors flex items-center gap-2">
                            <IcoWarning /> Suspend
                        </button>
                        <button onClick={onBan} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-2">
                            <IcoCircleOff /> Ban Account
                        </button>
                    </div>
                </div>
            </div>
        </ModalOverlay>
    );
}

/* ── Decline Modal ── */
export function DeclineModal({ report, onClose, onConfirm, tab }: {
    report: Report;
    onClose: () => void;
    onConfirm: () => void;
    tab: string;
}) {
    const [reason, setReason] = useState('');
    const isMessage = tab === 'messages';

    return (
        <ModalOverlay>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Decline Report</h2>
                            <p className="text-sm text-gray-400 mt-0.5">Mark this report as invalid or unfounded</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 -mt-1 -mr-1"><IcoClose /></button>
                    </div>

                    <hr className="border-gray-100 my-6" />

                    {/* Report Info */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Report Information</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                            <div className="flex justify-between col-span-2 sm:col-span-1">
                                <span className="text-gray-400">Company:</span>
                                <span className="font-semibold text-gray-700">{report.company}</span>
                            </div>
                            <div className="flex justify-between col-span-2 sm:col-span-1">
                                {isMessage ? (
                                    <>
                                        <span className="text-gray-400">Employer Name:</span>
                                        <span className="font-semibold text-gray-700">{report.employer_name || report.job_title}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-gray-400">Job Title:</span>
                                        <span className="font-semibold text-gray-700">{report.job_title}</span>
                                    </>
                                )}
                            </div>
                            <div className="flex justify-between col-span-2 sm:col-span-1">
                                <span className="text-gray-400">Reported By:</span>
                                <span className="font-semibold text-gray-700">{report.reported_by}</span>
                            </div>
                            <div className="flex justify-between col-span-2 sm:col-span-1">
                                <span className="text-gray-400">Total Reports:</span>
                                <span className="font-semibold text-gray-700">{report.report_count_total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Reported Reason */}
                    <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 mb-6">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-orange-500"><IcoFlag /></span>
                            <p className="text-xs font-bold text-orange-600">Reported Reason</p>
                        </div>
                        <p className="text-sm text-orange-700">{report.reason_title}</p>
                    </div>

                    {/* Reason for Declining */}
                    <div className="mb-6">
                        <p className="text-sm font-bold text-gray-700 mb-3">Reason for Declining</p>
                        <div className="space-y-2">
                            {['Content does not violate community guidelines', 'Report appears to be in bad faith', 'Duplicate report — already reviewed'].map((opt) => (
                                <label key={opt} className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input type="radio" name="decline_reason" value={opt} checked={reason === opt} onChange={() => setReason(opt)} className="accent-[#76a09a] w-4 h-4" />
                                    <span className="text-sm text-gray-700">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* What Happens */}
                    <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-green-500"><IcoCheck /></span>
                            <p className="text-sm font-bold text-green-700">What Happens After Declining</p>
                        </div>
                        <div className="space-y-2.5">
                            <div className="flex items-start gap-2.5">
                                <span className="text-green-500 mt-0.5 flex-shrink-0"><IcoCheck /></span>
                                <p className="text-xs text-green-700">
                                    <span className="font-bold">Report is dismissed</span> · {isMessage
                                        ? 'The reported message will remain in the conversation since no violation was found.'
                                        : 'This report will be marked as invalid and closed'}
                                </p>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <span className="text-green-500 mt-0.5 flex-shrink-0"><IcoBriefcase /></span>
                                <p className="text-xs text-green-700">
                                    <span className="font-bold">Job posting remains active</span> · {isMessage
                                        ? 'The reported user or recruiter will not receive any penalty.'
                                        : "The employer's listing will continue to be visible"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="bg-gray-50 rounded-xl px-5 py-4 mb-8 flex gap-3">
                        <span className="text-gray-400 flex-shrink-0 mt-0.5"><IcoAlert /></span>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Declining a report does <span className="font-bold">not</span> penalize the reporter. However, repeated bad-faith reports from the same user may be flagged separately.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                        <button onClick={onConfirm} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-2">
                            <IcoCircleOff /> Confirm Decline
                        </button>
                    </div>
                </div>
            </div>
        </ModalOverlay>
    );
}

/* ── Suspend Modal ── */
export function SuspendModal({ report, onClose, onConfirm, tab }: {
    report: Report;
    onClose: () => void;
    onConfirm: () => void;
    tab: string;
}) {
    const [duration, setDuration] = useState('7 Days');
    const isMessage = tab === 'messages';

    return (
        <ModalOverlay>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Confirm Account Suspension</h2>
                            <p className="text-sm text-gray-400 mt-0.5">Temporary restriction on account activity</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 -mt-1 -mr-1"><IcoClose /></button>
                    </div>

                    <hr className="border-gray-100 my-6" />

                    {/* Report Info */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Report Information</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Company:</span>
                                <span className="font-semibold text-gray-700">{report.company}</span>
                            </div>
                            <div className="flex justify-between">
                                {isMessage ? (
                                    <>
                                        <span className="text-gray-400">Employer Name:</span>
                                        <span className="font-semibold text-gray-700">{report.employer_name || report.job_title}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-gray-400">Job Title:</span>
                                        <span className="font-semibold text-gray-700">{report.job_title}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Active Jobs */}
                    {!isMessage && (
                        <div className="border border-gray-100 rounded-xl p-5 mb-6 flex items-center gap-4">
                            <span className="text-[#76a09a]"><IcoEye /></span>
                            <div>
                                <SectionLabel>Active Jobs</SectionLabel>
                                <p className="text-2xl font-bold text-gray-800">{report.active_jobs_count}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Currently posted positions</p>
                            </div>
                        </div>
                    )}

                    {/* Suspension Duration */}
                    <div className="border border-orange-100 rounded-xl p-5 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-orange-500 text-base">⏱</span>
                            <p className="text-sm font-bold text-orange-600">Suspension Duration</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {['7 Days', '14 Days', '30 Days'].map((d) => (
                                <button key={d} onClick={() => setDuration(d)}
                                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${duration === d
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                        : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500'}`}>
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Consequences */}
                    <div className="border border-orange-100 rounded-xl p-5 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <IcoWarning />
                            <p className="text-sm font-bold text-orange-600">Suspension Consequences</p>
                        </div>
                        {isMessage ? (
                            <div className="space-y-3">
                                <div className="flex items-start gap-2.5">
                                    <span className="text-red-400 mt-0.5 flex-shrink-0"><IcoCircleOff /></span>
                                    <p className="text-xs text-gray-600"><span className="font-bold">Messaging is Disabled</span> · The employer will not be able to send messages to job seekers while the suspension is active.</p>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <span className="text-red-400 mt-0.5 flex-shrink-0"><IcoBriefcase /></span>
                                    <p className="text-xs text-gray-600"><span className="font-bold">Existing conversations remain visible</span> · Previous messages will stay in the conversation history but cannot be replied to.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-start gap-2.5">
                                    <span className="text-red-400 mt-0.5 flex-shrink-0"><IcoCircleOff /></span>
                                    <p className="text-xs text-gray-600"><span className="font-bold">Temporarily restrict account access</span> · The employer cannot log in or manage listings during suspension</p>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <span className="text-red-400 mt-0.5 flex-shrink-0"><IcoBriefcase /></span>
                                    <p className="text-xs text-gray-600"><span className="font-bold">Hide all active job postings</span> · All {report.active_jobs_count} active jobs will be hidden from public view</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Note */}
                    <div className="bg-gray-50 rounded-xl px-5 py-4 mb-8 flex gap-3">
                        <span className="text-gray-400 flex-shrink-0 mt-0.5"><IcoAlert /></span>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Suspension is a <span className="font-bold">temporary</span> measure. The account will be automatically restored after the selected duration unless further action is taken.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                        <button onClick={onConfirm} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors flex items-center gap-2">
                            <IcoWarning /> Confirm Suspension
                        </button>
                    </div>
                </div>
            </div>
        </ModalOverlay>
    );
}

/* ── Ban Modal ── */
export function BanModal({ report, onClose, onConfirm, tab }: {
    report: Report;
    onClose: () => void;
    onConfirm: () => void;
    tab: string;
}) {
    const isMessage = tab === 'messages';

    return (
        <ModalOverlay>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Confirm Account Ban</h2>
                            <p className="text-sm text-gray-400 mt-0.5">This action cannot be undone</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 -mt-1 -mr-1"><IcoClose /></button>
                    </div>

                    <hr className="border-gray-100 my-6" />

                    {/* Report Info */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Report Information</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Company:</span>
                                <span className="font-semibold text-gray-700">{report.company}</span>
                            </div>
                            <div className="flex justify-between">
                                {isMessage ? (
                                    <>
                                        <span className="text-gray-400">Employer Name:</span>
                                        <span className="font-semibold text-gray-700">{report.employer_name || report.job_title}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-gray-400">Job Title:</span>
                                        <span className="font-semibold text-gray-700">{report.job_title}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Active Jobs */}
                    <div className="border border-gray-100 rounded-xl p-5 mb-6 flex items-center gap-4">
                        <span className="text-[#76a09a]"><IcoEye /></span>
                        <div>
                            <SectionLabel>Active Jobs</SectionLabel>
                            <p className="text-2xl font-bold text-gray-800">{report.active_jobs_count}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Currently posted positions</p>
                        </div>
                    </div>

                    {/* Ban Consequences */}
                    <div className="border border-red-100 bg-red-50/40 rounded-xl p-5 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <IcoWarning />
                            <p className="text-sm font-bold text-red-600">Ban Consequences</p>
                        </div>
                        {isMessage ? (
                            <div className="space-y-3">
                                <div className="flex items-start gap-2.5">
                                    <span className="text-red-500 mt-0.5 flex-shrink-0"><IcoCircleOff /></span>
                                    <p className="text-xs text-red-700"><span className="font-bold">Permanently deactivate account</span> · The employer will lose all access to the platform</p>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <span className="text-red-500 mt-0.5 flex-shrink-0"><IcoBriefcase /></span>
                                    <p className="text-xs text-red-700"><span className="font-bold">Disable all messaging activity</span> · The account will no longer be able to send or receive messages</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-start gap-2.5">
                                    <span className="text-red-500 mt-0.5 flex-shrink-0"><IcoCircleOff /></span>
                                    <p className="text-xs text-red-700"><span className="font-bold">Permanently deactivate account</span> · The employer will lose all access to the platform</p>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <span className="text-red-500 mt-0.5 flex-shrink-0"><IcoBriefcase /></span>
                                    <p className="text-xs text-red-700"><span className="font-bold">Remove all active jobs</span> · All {report.active_jobs_count} active job postings will be immediately removed</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Note */}
                    <div className="bg-gray-50 rounded-xl px-5 py-4 mb-8 flex gap-3">
                        <span className="text-gray-400 flex-shrink-0 mt-0.5"><IcoAlert /></span>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Please ensure you have thoroughly reviewed all evidence and reports before proceeding. This action is <span className="font-bold">permanent</span> and cannot be reversed.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                        <button onClick={onConfirm} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-2">
                            <IcoCircleOff /> Confirm Ban
                        </button>
                    </div>
                </div>
            </div>
        </ModalOverlay>
    );
}