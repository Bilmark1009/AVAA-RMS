import { useState, useRef, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

const INDUSTRIES = [
    'Information Technology', 'Healthcare', 'Finance', 'Education',
    'Manufacturing', 'Retail', 'Hospitality', 'Construction',
    'Real Estate', 'Marketing', 'Legal', 'Transportation', 'Other',
];

const COMPANY_SIZES = [
    '1-10 employees', '11-50 employees', '51-200 employees',
    '201-500 employees', '500-1000 employees', '1000+ employees',
];

const COUNTRIES = [
    'Philippines', 'United States', 'United Kingdom', 'Canada',
    'Australia', 'Singapore', 'Japan', 'Germany', 'France', 'Other',
];

interface StepIndicatorProps {
    current: number;
    total: number;
    labels: string[];
}

function StepIndicator({ current, total, labels }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center mb-8">
            {labels.map((label, i) => (
                <div key={i} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            i + 1 < current
                                ? 'bg-avaa-primary text-white'
                                : i + 1 === current
                                    ? 'bg-avaa-primary text-white ring-4 ring-avaa-primary/20'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                            {i + 1 < current ? '✓' : i + 1}
                        </div>
                        <span className={`text-xs mt-1 hidden sm:block ${
                            i + 1 === current ? 'text-avaa-primary font-medium' : 'text-gray-400'
                        }`}>
                            {label}
                        </span>
                    </div>
                    {i < total - 1 && (
                        <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-4 transition-colors ${
                            i + 1 < current ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                    )}
                </div>
            ))}
        </div>
    );
}

interface Props {
    /** Pass true when the authenticated user has a google_id but no phone number */
    needsPhone?: boolean;
}

export default function EmployerOnboarding({ needsPhone = false }: Props) {
    const [step, setStep] = useState(1);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [stepWarning, setStepWarning] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // When the user registered via Google they have no phone → add an extra step
    const totalSteps = needsPhone ? 4 : 3;
    const stepLabels = needsPhone
        ? ['Company Info', 'Location', 'Verification', 'Contact']
        : ['Company Info', 'Location', 'Verification'];

    const { data, setData, post, processing, errors, clearErrors } = useForm<{
        company_name: string;
        company_website: string;
        industry: string;
        company_size: string;
        company_description: string;
        logo: File | null;
        headquarters_address: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
        fein_tax_id: string;
        business_registration_number: string;
        year_established: string;
        linkedin_url: string;
        facebook_url: string;
        twitter_url: string;
        instagram_url: string;
        phone: string;
    }>({
        company_name: '', company_website: '', industry: '',
        company_size: '', company_description: '', logo: null,
        headquarters_address: '', city: '', state: '', country: '',
        postal_code: '', fein_tax_id: '', business_registration_number: '',
        year_established: '', linkedin_url: '', facebook_url: '',
        twitter_url: '', instagram_url: '',
        phone: '',
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const validateStep = (s: number): boolean => {
        clearErrors();
        setStepWarning(null);

        if (s === 1) {
            const ok = !!(data.company_name && data.company_website && data.industry && data.company_size && data.company_description);
            if (!ok) setStepWarning('Please fill in all required company information before continuing.');
            return ok;
        }
        if (s === 2) {
            const ok = !!(data.headquarters_address && data.city && data.state && data.country && data.postal_code);
            if (!ok) setStepWarning('Please complete all required location details before continuing.');
            return ok;
        }
        if (s === 3) {
            const ok = !!(data.fein_tax_id);
            if (!ok) setStepWarning('Please provide your FEIN / Tax ID before submitting for verification.');
            return ok;
        }
        // Step 4 (phone) — only reached when needsPhone is true
        if (s === 4) {
            const ok = !!(data.phone && data.phone.trim().length >= 7);
            if (!ok) setStepWarning('Please enter a valid phone number (at least 7 digits).');
            return ok;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) setStep(s => s + 1);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setSubmitError(null);
        if (!validateStep(step)) return;

        post(route('employer.profile.complete'), {
            forceFormData: true,
            onError: () => {
                setSubmitError('There was a problem saving your company profile. Please review the highlighted fields and try again.');
            },
        });
    };

    const inputClass =
        "mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-avaa-primary/60 focus:border-transparent";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-4 sm:mb-6">
                        <h2 className="text-2xl font-bold text-avaa-dark dark:text-white">
                            Complete Your Company Profile
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            This helps job seekers learn about your company
                        </p>
                    </div>

                    {/* Global error / warning banners */}
                    {submitError && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {submitError}
                        </div>
                    )}
                    {stepWarning && !submitError && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700">
                            {stepWarning}
                        </div>
                    )}

                    <StepIndicator
                        current={step}
                        total={totalSteps}
                        labels={stepLabels}
                    />

                    <form onSubmit={submit}>
                        {/* ── Step 1: Company Information ── */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Company Information</h3>

                                <div>
                                    <label className={labelClass}>Company Name *</label>
                                    <input type="text" value={data.company_name} onChange={e => setData('company_name', e.target.value)} className={inputClass} required />
                                    <InputError message={errors.company_name} className="mt-1" />
                                </div>

                                <div>
                                    <label className={labelClass}>Company Website *</label>
                                    <input type="text" value={data.company_website} onChange={e => setData('company_website', e.target.value)} className={inputClass} placeholder="https://example.com" />
                                    <InputError message={errors.company_website} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Industry *</label>
                                        <select value={data.industry} onChange={e => setData('industry', e.target.value)} className={inputClass} required>
                                            <option value="">Select industry</option>
                                            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                        </select>
                                        <InputError message={errors.industry} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Company Size *</label>
                                        <select value={data.company_size} onChange={e => setData('company_size', e.target.value)} className={inputClass} required>
                                            <option value="">Select size</option>
                                            {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <InputError message={errors.company_size} className="mt-1" />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Company Description *
                                        <span className={`ml-2 text-xs ${data.company_description.length < 50 ? 'text-red-400' : 'text-emerald-500'}`}>
                                            ({data.company_description.length} chars, min 50)
                                        </span>
                                    </label>
                                    <textarea
                                        value={data.company_description}
                                        onChange={e => setData('company_description', e.target.value)}
                                        rows={4}
                                        className={inputClass}
                                        placeholder="Tell job seekers about your company culture, mission, and what makes you unique..."
                                        required
                                    />
                                    <InputError message={errors.company_description} className="mt-1" />
                                </div>

                                {/* Logo Upload */}
                                <div>
                                    <label className={labelClass}>Company Logo (optional)</label>
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        className="mt-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                                    >
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo preview" className="h-16 mx-auto object-contain" />
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm text-gray-500">Click to upload logo</p>
                                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG up to 2MB</p>
                                            </>
                                        )}
                                    </div>
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Location ── */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Location Details</h3>

                                <div>
                                    <label className={labelClass}>Headquarters Address *</label>
                                    <input type="text" value={data.headquarters_address} onChange={e => setData('headquarters_address', e.target.value)} className={inputClass} required />
                                    <InputError message={errors.headquarters_address} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>City *</label>
                                        <input type="text" value={data.city} onChange={e => setData('city', e.target.value)} className={inputClass} required />
                                        <InputError message={errors.city} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>State / Province *</label>
                                        <input type="text" value={data.state} onChange={e => setData('state', e.target.value)} className={inputClass} required />
                                        <InputError message={errors.state} className="mt-1" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Country *</label>
                                        <select value={data.country} onChange={e => setData('country', e.target.value)} className={inputClass} required>
                                            <option value="">Select country</option>
                                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <InputError message={errors.country} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Postal Code *</label>
                                        <input type="text" value={data.postal_code} onChange={e => setData('postal_code', e.target.value)} className={inputClass} required />
                                        <InputError message={errors.postal_code} className="mt-1" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Verification & Social ── */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Verification & Social Links</h3>

                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-300">
                                    Your profile will be reviewed by our admin team before you can post jobs. This usually takes 1-2 business days.
                                </div>

                                <div>
                                    <label className={labelClass}>FEIN / Tax ID *</label>
                                    <input type="text" value={data.fein_tax_id} onChange={e => setData('fein_tax_id', e.target.value)} className={inputClass} placeholder="XX-XXXXXXX" required />
                                    <InputError message={errors.fein_tax_id} className="mt-1" />
                                </div>

                                <div>
                                    <label className={labelClass}>Business Registration Number</label>
                                    <input type="text" value={data.business_registration_number} onChange={e => setData('business_registration_number', e.target.value)} className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Year Established</label>
                                    <input type="number" value={data.year_established} onChange={e => setData('year_established', e.target.value)} className={inputClass} placeholder="e.g. 2010" min="1800" max={new Date().getFullYear()} />
                                </div>

                                <div className="pt-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Social Links (optional)</p>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'linkedin_url', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/...' },
                                            { key: 'facebook_url', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                                            { key: 'twitter_url', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
                                            { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                                        ].map(({ key, label, placeholder }) => (
                                            <div key={key}>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                                                <input
                                                    type="text"
                                                    value={(data as any)[key]}
                                                    onChange={e => setData(key as any, e.target.value)}
                                                    className={inputClass}
                                                    placeholder={placeholder}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 4: Phone (Google users only) ── */}
                        {step === 4 && needsPhone && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Contact Information</h3>

                                {/* Explanation banner */}
                                <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Because you signed in with Google, we need your phone number so employers and our admin team can reach you.
                                    </p>
                                </div>

                                <div>
                                    <label className={labelClass}>Phone Number *</label>
                                    <div className="mt-1 flex rounded-lg shadow-sm">
                                        {/* Optional country-code prefix — keep it simple */}
                                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm select-none">
                                            📞
                                        </span>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="block w-full rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="+63 912 345 6789"
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">Include country code, e.g. +63 for Philippines</p>
                                    <InputError message={errors.phone} className="mt-1" />
                                </div>
                            </div>
                        )}

                        {/* ── Navigation Buttons ── */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(s => s - 1)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    ← Back
                                </button>
                            ) : <div />}

                            {step < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                                >
                                    Continue →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
                                >
                                    {processing ? 'Saving...' : 'Complete Profile'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}