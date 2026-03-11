import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import InputError from '@/Components/InputError';
import { FormEventHandler, useRef, useState } from 'react';
import { PageProps, EmployerProfile } from '@/types';

/* ── Icons ── */
const IcoCamera = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);
const IcoEye = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const IcoEyeOff = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

/* ── Shared styles ── */
const inputClass = "block w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:border-transparent transition-all placeholder-gray-400";
const labelClass = "block text-sm font-semibold text-gray-500 mb-1.5";

/* ── Reusable components ── */
function Card({ children }: { children: React.ReactNode }) {
    return <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">{children}</div>;
}
function CardHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-avaa-dark">{title}</h3>
            <p className="text-sm text-avaa-muted mt-0.5">{subtitle}</p>
        </div>
    );
}
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:ring-offset-2 flex-shrink-0
                ${checked ? 'bg-avaa-primary' : 'bg-gray-200'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
                ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}

function passwordStrength(pw: string): { score: number; label: string; color: string } {
    if (!pw) return { score: 0, label: '', color: '' };
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const map = [
        { score: 1, label: 'Weak', color: 'bg-red-400' },
        { score: 2, label: 'Fair', color: 'bg-amber-400' },
        { score: 3, label: 'Good', color: 'bg-blue-400' },
        { score: 4, label: 'Strong', color: 'bg-avaa-primary' },
    ];
    return map[s - 1] ?? { score: 0, label: '', color: '' };
}

/* ── Tab component ── */
function TabBar({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
    return (
        <div className="flex gap-1 border-b border-gray-200 mb-6">
            {tabs.map((tab, i) => (
                <button
                    key={tab}
                    onClick={() => onChange(i)}
                    className={`px-4 py-2.5 text-base font-semibold transition-colors relative
                        ${active === i
                            ? 'text-avaa-teal'
                            : 'text-avaa-muted hover:text-avaa-dark'
                        }`}
                >
                    {tab}
                    {active === i && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-avaa-teal rounded-full" />
                    )}
                </button>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════
   PROPS
══════════════════════════════════════════════ */
interface Props extends PageProps {
    user: {
        first_name: string;
        last_name: string;
        email: string;
        phone?: string | null;
        avatar?: string | null;
        role: string;
        email_verified_at?: string | null;
        google_id?: string | null;
    };
    profile: EmployerProfile | null;
    security: {
        two_factor_enabled: boolean;
        login_alert_email: boolean;
        login_alert_push: boolean;
    };
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function EmployerSettings({ user, profile, security }: Props) {
    const [activeTab, setActiveTab] = useState(0);

    /* ── Personal info form ── */
    const { data: infoData, setData: setInfoData, patch: patchInfo, processing: infoProcessing,
        errors: infoErrors, recentlySuccessful: infoSaved } = useForm({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone ?? '',
        });

    const submitInfo: FormEventHandler = (e) => {
        e.preventDefault();
        patchInfo(route('employer.settings.personal.update'));
    };

    /* ── Company details form ── */
    const { data: compData, setData: setCompData, patch: patchComp, processing: compProcessing,
        errors: compErrors, recentlySuccessful: compSaved } = useForm({
            company_name: profile?.company_name ?? '',
            company_description: profile?.company_description ?? '',
            company_website: profile?.company_website ?? '',
            industry: profile?.industry ?? '',
            company_size: profile?.company_size ?? '',
            headquarters_address: profile?.headquarters_address ?? '',
            city: profile?.city ?? '',
            state: profile?.state ?? '',
            country: profile?.country ?? '',
            postal_code: profile?.postal_code ?? '',
        });

    const submitComp: FormEventHandler = (e) => {
        e.preventDefault();
        patchComp(route('employer.settings.company.update'));
    };

    /* ── Avatar ── */
    const avatarRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
        setUploadingAvatar(true);
        const fd = new FormData();
        fd.append('avatar', file);
        router.post(route('employer.profile.avatar'), fd, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setUploadingAvatar(false),
            onError: () => setAvatarPreview(null),
        });
    };

    const handleAvatarRemove = () => {
        setAvatarPreview(null);
        router.delete(route('employer.profile.avatar.remove'), { preserveScroll: true });
    };

    /* ── Password form ── */
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data: pwData, setData: setPwData, put: putPw, processing: pwProcessing,
        errors: pwErrors, reset: resetPw, recentlySuccessful: pwSaved } = useForm({
            current_password: '',
            password: '',
            password_confirmation: '',
        });

    const submitPw: FormEventHandler = (e) => {
        e.preventDefault();
        putPw(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => resetPw(),
        });
    };

    const strength = passwordStrength(pwData.password);

    /* ── Security toggles ── */
    const [secForm, setSecForm] = useState(security);
    const [secSaving, setSecSaving] = useState(false);
    const [secSaved, setSecSaved] = useState(false);

    const updateSecurity = (key: keyof typeof secForm, value: boolean) => {
        const next = { ...secForm, [key]: value };
        setSecForm(next);
        setSecSaving(true);
        router.patch(route('settings.security.update'), next as any, {
            preserveScroll: true,
            onSuccess: () => { setSecSaving(false); setSecSaved(true); setTimeout(() => setSecSaved(false), 2000); },
            onError: () => setSecSaving(false),
        });
    };

    const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();
    const hasGoogle = !!user.google_id;
    const location = profile ? `${profile.city}, ${profile.state}` : '';

    return (
        <>
            <Head title="Account Settings" />
            <AppLayout pageTitle="Account Settings" pageSubtitle="Manage your account, security, preferences, and notifications." activeNav="Settings">
                <div className="max-w-4xl mx-auto">

                    {/* ── Tab Bar ── */}
                    <TabBar
                        tabs={['Platform Settings', 'Security & Privacy']}
                        active={activeTab}
                        onChange={setActiveTab}
                    />

                    {/* ═══ TAB 0: Platform Settings ═══ */}
                    {activeTab === 0 && (
                        <div className="space-y-6">

                            {/* ── Personal Information ── */}
                            <Card>
                                <CardHeader title="Personal Information" subtitle="Edit your name, email, and other essential information." />
                                <form onSubmit={submitInfo} className="p-6 space-y-5">

                                    {/* Avatar */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex-shrink-0">
                                            {(avatarPreview || user.avatar) ? (
                                                <img
                                                    src={avatarPreview ?? user.avatar!}
                                                    alt={`${user.first_name} ${user.last_name}`}
                                                    className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-avaa-dark flex items-center justify-center text-white text-lg font-bold ring-2 ring-gray-100">
                                                    {initials}
                                                </div>
                                            )}
                                            {uploadingAvatar && (
                                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => avatarRef.current?.click()}
                                                disabled={uploadingAvatar}
                                                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-avaa-primary hover:text-avaa-teal transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <IcoCamera /> {uploadingAvatar ? 'Uploading…' : 'Change Profile'}
                                            </button>
                                            {(avatarPreview || user.avatar) && !uploadingAvatar && (
                                                <button
                                                    type="button"
                                                    onClick={handleAvatarRemove}
                                                    className="px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl text-red-400 hover:bg-red-50 hover:border-red-300 transition-all"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            ref={avatarRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                        />
                                    </div>

                                    {/* Name fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-1">
                                            <label className={labelClass}>Name</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <input type="text" value={infoData.first_name}
                                                        onChange={e => setInfoData('first_name', e.target.value)}
                                                        className={inputClass} placeholder="First" />
                                                    <InputError message={(infoErrors as any).first_name} className="mt-1" />
                                                </div>
                                                <div>
                                                    <input type="text" value={infoData.last_name}
                                                        onChange={e => setInfoData('last_name', e.target.value)}
                                                        className={inputClass} placeholder="Last" />
                                                    <InputError message={(infoErrors as any).last_name} className="mt-1" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Location</label>
                                            <input type="text" readOnly value={location}
                                                className={inputClass + ' read-only:cursor-default read-only:text-gray-500'} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Email</label>
                                            <input type="email" value={infoData.email}
                                                onChange={e => setInfoData('email', e.target.value)}
                                                className={inputClass} placeholder="you@email.com" />
                                            <InputError message={infoErrors.email} className="mt-1" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Phone Number</label>
                                            <input type="tel" value={infoData.phone}
                                                onChange={e => setInfoData('phone', e.target.value)}
                                                className={inputClass} placeholder="+1 (555) 123-4567" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100">
                                        {infoSaved && <span className="text-xs text-avaa-teal font-medium">✓ Saved</span>}
                                        <button type="button"
                                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-avaa-dark rounded-xl hover:bg-gray-50 transition-colors">
                                            Discard
                                        </button>
                                        <button type="submit" disabled={infoProcessing}
                                            className="px-5 py-2 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                                            {infoProcessing ? 'Saving…' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </Card>

                            {/* ── Company Details ── */}
                            <Card>
                                <CardHeader title="Company Details" subtitle="Edit your name, email, and other essential information." />
                                <form onSubmit={submitComp} className="p-6 space-y-5">

                                    <div>
                                        <label className={labelClass}>Company Description</label>
                                        <textarea
                                            value={compData.company_description}
                                            onChange={e => setCompData('company_description', e.target.value)}
                                            rows={4}
                                            className={inputClass + ' resize-none'}
                                            placeholder="Describe your company..."
                                        />
                                        <InputError message={(compErrors as any).company_description} className="mt-1" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Company Name</label>
                                            <input type="text" value={compData.company_name}
                                                onChange={e => setCompData('company_name', e.target.value)}
                                                className={inputClass} />
                                            <InputError message={(compErrors as any).company_name} className="mt-1" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Location</label>
                                            <input type="text" value={compData.city}
                                                onChange={e => setCompData('city', e.target.value)}
                                                className={inputClass} placeholder="City" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Industry</label>
                                            <input type="text" value={compData.industry}
                                                onChange={e => setCompData('industry', e.target.value)}
                                                className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Company Size</label>
                                            <input type="text" value={compData.company_size}
                                                onChange={e => setCompData('company_size', e.target.value)}
                                                className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>State</label>
                                            <input type="text" value={compData.state}
                                                onChange={e => setCompData('state', e.target.value)}
                                                className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Country</label>
                                            <input type="text" value={compData.country}
                                                onChange={e => setCompData('country', e.target.value)}
                                                className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Postal Code</label>
                                            <input type="text" value={compData.postal_code}
                                                onChange={e => setCompData('postal_code', e.target.value)}
                                                className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Headquarters Address</label>
                                            <input type="text" value={compData.headquarters_address}
                                                onChange={e => setCompData('headquarters_address', e.target.value)}
                                                className={inputClass} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100">
                                        {compSaved && <span className="text-xs text-avaa-teal font-medium">✓ Saved</span>}
                                        <button type="button"
                                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-avaa-dark rounded-xl hover:bg-gray-50 transition-colors">
                                            Discard
                                        </button>
                                        <button type="submit" disabled={compProcessing}
                                            className="px-5 py-2 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                                            {compProcessing ? 'Saving…' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    )}

                    {/* ═══ TAB 1: Security & Privacy ═══ */}
                    {activeTab === 1 && (
                        <div className="space-y-6">

                            {/* ── Account Settings (2FA + Login Alerts) ── */}
                            <Card>
                                <CardHeader title="Account Settings" subtitle="Manage and update your personal information." />
                                <div className="p-6 space-y-5">

                                    {/* 2FA */}
                                    <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="text-base font-semibold text-avaa-dark">Two-Factor Authentication (2FA)</p>
                                            <p className="text-sm text-avaa-muted mt-0.5 max-w-md">
                                                Protect your account with an extra layer of security. We will ask for a verification code when you log in on a new device.
                                            </p>
                                        </div>
                                        <Toggle checked={secForm.two_factor_enabled} onChange={v => updateSecurity('two_factor_enabled', v)} />
                                    </div>

                                    {/* Login Alerts */}
                                    <div>
                                        <h4 className="text-base font-semibold text-avaa-dark mb-1">Login Alerts</h4>
                                        <p className="text-sm text-avaa-muted mb-3">Choose how you want to be notified when a new login is detected on your account.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100">
                                                <div>
                                                    <p className="text-base font-medium text-avaa-dark">Email Notifications</p>
                                                    <p className="text-sm text-avaa-muted mt-0.5">Send an alert your email</p>
                                                </div>
                                                <Toggle checked={secForm.login_alert_email} onChange={v => updateSecurity('login_alert_email', v)} />
                                            </div>
                                            <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100">
                                                <div>
                                                    <p className="text-base font-medium text-avaa-dark">Push Notifications</p>
                                                    <p className="text-sm text-avaa-muted mt-0.5">Alerts via desktop or mobile app</p>
                                                </div>
                                                <Toggle checked={secForm.login_alert_push} onChange={v => updateSecurity('login_alert_push', v)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* ── Change Password ── */}
                            <Card>
                                <CardHeader title="Change Password" subtitle="Update your password to keep your account secure." />
                                {hasGoogle ? (
                                    <div className="p-6">
                                        <p className="text-sm text-avaa-muted">
                                            Your account uses Google Sign-In. Password management is handled through Google.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={submitPw} className="p-6 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {/* Old password */}
                                            <div>
                                                <label className={labelClass}>Old Password</label>
                                                <div className="relative">
                                                    <input type={showOld ? 'text' : 'password'}
                                                        value={pwData.current_password}
                                                        onChange={e => setPwData('current_password', e.target.value)}
                                                        className={inputClass} autoComplete="current-password" />
                                                    <button type="button" onClick={() => setShowOld(s => !s)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                        {showOld ? <IcoEyeOff /> : <IcoEye />}
                                                    </button>
                                                </div>
                                                <InputError message={pwErrors.current_password} className="mt-1" />
                                            </div>
                                            {/* New password */}
                                            <div>
                                                <label className={labelClass}>New Password</label>
                                                <div className="relative">
                                                    <input type={showNew ? 'text' : 'password'}
                                                        value={pwData.password}
                                                        onChange={e => setPwData('password', e.target.value)}
                                                        className={inputClass} autoComplete="new-password" />
                                                    <button type="button" onClick={() => setShowNew(s => !s)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                        {showNew ? <IcoEyeOff /> : <IcoEye />}
                                                    </button>
                                                </div>
                                                <InputError message={pwErrors.password} className="mt-1" />
                                            </div>
                                            {/* Confirm password */}
                                            <div>
                                                <label className={labelClass}>Confirm Password</label>
                                                <div className="relative">
                                                    <input type={showConfirm ? 'text' : 'password'}
                                                        value={pwData.password_confirmation}
                                                        onChange={e => setPwData('password_confirmation', e.target.value)}
                                                        className={inputClass} autoComplete="new-password" />
                                                    <button type="button" onClick={() => setShowConfirm(s => !s)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                        {showConfirm ? <IcoEyeOff /> : <IcoEye />}
                                                    </button>
                                                </div>
                                                <InputError message={pwErrors.password_confirmation} className="mt-1" />
                                            </div>
                                        </div>

                                        {/* Strength bar */}
                                        {pwData.password && (
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-400">Password Strength</span>
                                                    <span className={`text-xs font-semibold ${strength.label === 'Strong' ? 'text-avaa-teal' :
                                                        strength.label === 'Good' ? 'text-blue-500' :
                                                            strength.label === 'Fair' ? 'text-amber-500' : 'text-red-500'
                                                        }`}>{strength.label}</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                                                        style={{ width: `${(strength.score / 4) * 100}%` }} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100">
                                            {pwSaved && <span className="text-xs text-avaa-teal font-medium">✓ Saved</span>}
                                            <button type="button" onClick={() => resetPw()}
                                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-avaa-dark rounded-xl hover:bg-gray-50 transition-colors">
                                                Discard
                                            </button>
                                            <button type="submit" disabled={pwProcessing}
                                                className="px-5 py-2 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                                                {pwProcessing ? 'Saving…' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </Card>
                        </div>
                    )}

                </div>
            </AppLayout>
        </>
    );
}
