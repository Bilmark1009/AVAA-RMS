import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FormEventHandler, useRef, useState } from 'react';
import { PageProps } from '@/types';

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
const inputClass = "block w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:border-transparent transition-all placeholder-gray-400";
const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";

/* ── Tab nav ── */
function safeRoute(name: string): string {
    try { return route(name); } catch { return '#'; }
}

function TabNav({ active }: { active: 'account' | 'security' | 'notifications' }) {
    const tabs = [
        { key: 'account', label: 'Account Settings', href: safeRoute('admin.settings') },
        { key: 'security', label: 'Security & Privacy', href: safeRoute('admin.settings.security') },
        { key: 'notifications', label: 'Notifications', href: safeRoute('admin.settings.notifications') },
    ] as const;

    return (
        <div className="flex gap-1 border-b border-gray-200 mb-6">
            {tabs.map(tab => (
                <Link
                    key={tab.key}
                    href={tab.href}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors
                        ${active === tab.key
                            ? 'border-avaa-primary text-avaa-primary'
                            : 'border-transparent text-avaa-muted hover:text-avaa-dark'
                        }`}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    );
}

/* ── Card wrappers ── */
function Card({ children }: { children: React.ReactNode }) {
    return <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">{children}</div>;
}
function CardHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-avaa-dark">{title}</h3>
            <p className="text-xs text-avaa-muted mt-0.5">{subtitle}</p>
        </div>
    );
}

/* ── Password strength ── */
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

/* ══════════════════════════════════════════════
   PAGE PROPS
══════════════════════════════════════════════ */
interface Props extends PageProps {
    mustVerifyEmail: boolean;
    status?: string;
    user: {
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
        avatar?: string;
        email_verified_at?: string | null;
        google_id?: string | null;
    };
}

export default function AdminSettingsAccount({ mustVerifyEmail, status, user }: Props) {

    /* ── Personal info form ── */
    const { data: infoData, setData: setInfoData, patch: patchInfo,
        processing: infoProcessing, errors: infoErrors, recentlySuccessful: infoSaved } = useForm({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone ?? '',
        });

    const submitInfo: FormEventHandler = (e) => {
        e.preventDefault();
        patchInfo(route('admin.settings.account.update'));
    };

    /* ── Change password form ── */
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
    const hasGoogle = !!user.google_id;

    /* ── Avatar upload ── */
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
        router.post(route('admin.settings.avatar'), fd, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setUploadingAvatar(false),
            onError: () => setAvatarPreview(null),
        });
    };

    const handleAvatarRemove = () => {
        setAvatarPreview(null);
        router.delete(route('admin.settings.avatar.remove'), { preserveScroll: true });
    };

    const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();

    return (
        <>
            <Head title="Account Settings" />
            <AppLayout pageTitle="Account Settings" pageSubtitle="Manage your account, security, preferences, and notifications." activeNav="Settings">

                <TabNav active="account" />

                <div className="space-y-5">

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
                                <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarChange} />
                            </div>

                            {/* Name + Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>First Name</label>
                                    <input type="text" value={infoData.first_name}
                                        onChange={e => setInfoData('first_name', e.target.value)}
                                        className={inputClass} placeholder="First name" />
                                    {infoErrors.first_name && <p className="mt-1 text-xs text-red-500">{(infoErrors as any).first_name}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Last Name</label>
                                    <input type="text" value={infoData.last_name}
                                        onChange={e => setInfoData('last_name', e.target.value)}
                                        className={inputClass} placeholder="Last name" />
                                    {infoErrors.last_name && <p className="mt-1 text-xs text-red-500">{(infoErrors as any).last_name}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Email Address</label>
                                    <input type="email" value={infoData.email}
                                        onChange={e => setInfoData('email', e.target.value)}
                                        className={inputClass} placeholder="admin@example.com" />
                                    {infoErrors.email && <p className="mt-1 text-xs text-red-500">{infoErrors.email}</p>}
                                    {mustVerifyEmail && !user.email_verified_at && (
                                        <p className="mt-1.5 text-xs text-amber-600">
                                            Email unverified. &nbsp;
                                            <Link href={route('verification.send')} method="post" as="button" className="underline hover:text-amber-700">Resend link</Link>
                                        </p>
                                    )}
                                    {status === 'verification-link-sent' && (
                                        <p className="mt-1.5 text-xs text-avaa-teal font-medium">Verification link sent!</p>
                                    )}
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
                                    {/* Old */}
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
                                        {pwErrors.current_password && <p className="mt-1 text-xs text-red-500">{pwErrors.current_password}</p>}
                                    </div>
                                    {/* New */}
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
                                        {pwErrors.password && <p className="mt-1 text-xs text-red-500">{pwErrors.password}</p>}
                                    </div>
                                    {/* Confirm */}
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
                                        {pwErrors.password_confirmation && <p className="mt-1 text-xs text-red-500">{pwErrors.password_confirmation}</p>}
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
            </AppLayout>
        </>
    );
}
