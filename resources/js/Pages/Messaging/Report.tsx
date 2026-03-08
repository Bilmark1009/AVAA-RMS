import { useState, FormEvent } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

interface ReportedUser {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string | null;
    role: string;
    subtitle: string;
}

interface PageProps {
    reportedUser: ReportedUser;
    conversationId: number | null;
    flash?: { success?: string } | null;
    auth: { user: any };
    [key: string]: any;
}

const reasons = [
    {
        value: 'inappropriate_behavior',
        label: 'Inappropriate behavior',
        description: 'Unprofessional language, harassment, or offensive communication style.',
    },
    {
        value: 'spam',
        label: 'Spam or automated content',
        description: 'Unsolicited marketing, bots, or excessive repetitive messages.',
    },
    {
        value: 'suspicious_job',
        label: 'Suspicious job offer or scam',
        description: 'Asking for bank details, external payments, or "get rich quick" schemes.',
    },
    {
        value: 'identity_theft',
        label: 'Identity theft or faking profile',
        description: "Using a fake name, photo, or pretending to represent a company they don't.",
    },
    {
        value: 'other',
        label: 'Other concern',
        description: "None of the above matches my specific concern.",
    },
];

export default function ReportPage({ reportedUser, conversationId }: PageProps) {
    const { flash } = usePage<PageProps>().props;
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!reason) return;
        setSubmitting(true);
        router.post(route('messages.report.store', reportedUser.id), {
            reason,
            details: details.trim() || null,
        } as any, {
            onFinish: () => setSubmitting(false),
        });
    };

    const initials = `${reportedUser.first_name?.[0] ?? ''}${reportedUser.last_name?.[0] ?? ''}`.toUpperCase();

    return (
        <AppLayout activeNav="Messages" pageTitle="Report Safety Concern">
            <div className="max-w-2xl mx-auto">

                {/* Back link */}
                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center gap-1.5 text-[13.5px] text-avaa-primary font-medium hover:text-avaa-dark transition-colors mb-5"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to Messages
                </button>

                {/* Success message */}
                {flash?.success && (
                    <div className="mb-5 px-5 py-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[13.5px] text-emerald-700 font-medium">
                        {flash.success}
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4">
                        <h1 className="text-[20px] font-bold text-avaa-dark">Report Safety Concern</h1>
                        <p className="text-[13.5px] text-avaa-muted mt-1 leading-relaxed">
                            Your safety is our priority. Reports are handled confidentially by our trust and safety team.
                        </p>
                    </div>

                    {/* Reported user card */}
                    <div className="mx-6 mb-5 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-avaa-dark flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                            {reportedUser.avatar
                                ? <img src={reportedUser.avatar} alt="" className="w-full h-full object-cover" />
                                : initials
                            }
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-avaa-dark">
                                Reporting: {reportedUser.first_name} {reportedUser.last_name}
                            </p>
                            <p className="text-[12px] text-avaa-muted">{reportedUser.subtitle}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Reason selection */}
                        <div className="px-6 pb-5">
                            <h3 className="text-[14px] font-semibold text-avaa-dark mb-3">
                                What's the main reason for your report?
                            </h3>
                            <div className="space-y-2.5">
                                {reasons.map(r => (
                                    <label
                                        key={r.value}
                                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all
                                            ${reason === r.value
                                                ? 'border-avaa-primary bg-avaa-primary-light shadow-sm'
                                                : 'border-gray-200 hover:border-avaa-primary/30 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={r.value}
                                            checked={reason === r.value}
                                            onChange={() => setReason(r.value)}
                                            className="mt-0.5 w-4 h-4 text-avaa-primary border-gray-300 focus:ring-avaa-primary"
                                        />
                                        <div>
                                            <p className="text-[13.5px] font-semibold text-avaa-dark">{r.label}</p>
                                            <p className="text-[12px] text-avaa-muted mt-0.5 leading-relaxed">{r.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="px-6 pb-5">
                            <h3 className="text-[14px] font-semibold text-avaa-dark mb-2">
                                Additional details <span className="text-avaa-muted font-normal">(Optional)</span>
                            </h3>
                            <textarea
                                value={details}
                                onChange={e => setDetails(e.target.value)}
                                maxLength={1000}
                                rows={4}
                                placeholder="Please provide more context or specific examples to help us investigate..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13.5px] text-avaa-dark placeholder-avaa-muted outline-none resize-none focus:border-avaa-primary/50 focus:bg-white transition-all"
                            />
                            <p className="text-[11.5px] text-avaa-muted mt-1.5">
                                Maximum 1000 characters.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="px-5 py-2.5 text-[13.5px] font-semibold text-avaa-muted hover:text-avaa-dark transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!reason || submitting}
                                className="px-6 py-2.5 bg-avaa-primary hover:bg-avaa-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13.5px] font-semibold rounded-xl transition-colors"
                            >
                                {submitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>

                    {/* Footer commitment */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <h4 className="text-[13px] font-semibold text-avaa-dark mb-1">Our Professional Commitment</h4>
                        <p className="text-[12px] text-avaa-muted leading-relaxed">
                            We take every report seriously. Our moderation team reviews all safety reports within 24 hours.
                            If we find violations of our Terms of Service, appropriate actions ranging from warnings to
                            account suspension will be taken.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
