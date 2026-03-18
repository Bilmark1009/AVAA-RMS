import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import SettingsLayout from '@/Layouts/SettingsLayout';
import InputError from '@/Components/InputError';
import ImageInitialsFallback from '@/Components/ImageInitialsFallback';
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
const IcoTrash = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
);

/* ── Shared styles ── */
const inputClass = "block w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:border-transparent transition-all placeholder-gray-400";
const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";

/* ── Section card wrapper ── */
function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {children}
        </div>
    );
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

/* ── Delete confirmation modal ── */
function DeleteModal({ onClose }: { onClose: () => void }) {
    const { data, setData, delete: destroy, processing, errors, reset } = useForm({ password: '' });
    const [show, setShow] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(route('settings.account.destroy'), {
            preserveScroll: true,
            onSuccess: () => { onClose(); },
            onError: () => { },
            onFinish: () => reset(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <IcoTrash />
                </div>
                <h3 className="text-base font-bold text-avaa-dark text-center">Delete Account?</h3>
                <p className="text-sm text-avaa-muted text-center mt-1 mb-5">
                    All your data will be permanently removed. This cannot be undone.
                </p>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Enter your password to confirm</label>
                        <div className="relative">
                            <input
                                type={show ? 'text' : 'password'}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className={inputClass}
                                placeholder="Your current password"
                                autoFocus
                            />
                            <button type="button" onClick={() => setShow(s => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {show ? <IcoEyeOff /> : <IcoEye />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                            {processing ? 'Deleting…' : 'Delete Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
interface Props extends PageProps {
    mustVerifyEmail: boolean;
    status?: string;
    user: {
        first_name: string;
        last_name: string;
        email: string;
        username?: string;
        phone?: string;
        avatar?: string;
        email_verified_at?: string | null;
        google_id?: string | null;
        role?: string;
        profile_frame?: string | null;
    };
}

export default function AccountSettings({ mustVerifyEmail, status, user }: Props) {

    /* ── Personal info form ── */
    const { data: infoData, setData: setInfoData, patch: patchInfo, processing: infoProcessing,
        errors: infoErrors, recentlySuccessful: infoSaved, reset: resetInfo } = useForm({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            username: user.username ?? '',
            phone: user.phone ?? '',
        });

    const submitInfo: FormEventHandler = (e) => {
        e.preventDefault();
        patchInfo(route('settings.account.update'));
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

    /* ── Avatar upload ── */
    const avatarRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Show local preview immediately
        setAvatarPreview(URL.createObjectURL(file));
        setUploadingAvatar(true);
        const fd = new FormData();
        fd.append('avatar', file);
        router.post(route('settings.account.avatar'), fd, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setUploadingAvatar(false),
            onError: () => setAvatarPreview(null),
        });
    };

    const handleAvatarRemove = () => {
        setAvatarPreview(null);
        router.delete(route('settings.account.avatar.remove'), { preserveScroll: true });
    };

    /* ── Delete modal ── */
    const [showDelete, setShowDelete] = useState(false);

    const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();
    const hasGoogle = !!user.google_id;
    const isJobSeeker = user.role === 'job_seeker';

    /* ── Profile frame state (3 choices) ── */
    const [profileFrame, setProfileFrame] = useState<string>(user.profile_frame ?? 'default');
    const [frameSaving, setFrameSaving] = useState(false);
    const [frameSaved, setFrameSaved] = useState(false);

    const saveFrame = () => {
        setFrameSaving(true);
        router.patch(route('settings.account.update'), {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            username: user.username ?? '',
            phone: user.phone ?? '',
            profile_frame: profileFrame,
        }, {
            preserveScroll: true,
            onSuccess: () => { setFrameSaved(true); setTimeout(() => setFrameSaved(false), 2500); },
            onFinish: () => setFrameSaving(false),
        });
    };

    return (
        <>
            <Head title="Account Settings" />
            {showDelete && <DeleteModal onClose={() => setShowDelete(false)} />}

            <AppLayout pageTitle="Settings" pageSubtitle="Manage your preferences" activeNav="Profile">
                <SettingsLayout title="Account Settings" subtitle="Manage and update your personal information.">

                    {/* ── Personal Information ── */}
                    <Card>
                        <CardHeader title="Personal Information" subtitle="Edit your name, email, and other essential information." />
                        <form onSubmit={submitInfo} className="p-6 space-y-5">

                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0 group">
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
                                        <IcoCamera /> {uploadingAvatar ? 'Uploading…' : 'Change Image'}
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

                            {/* Name + Username */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>First Name</label>
                                    <input type="text" value={infoData.first_name}
                                        onChange={e => setInfoData('first_name', e.target.value)}
                                        className={inputClass} placeholder="John" />
                                    <InputError message={(infoErrors as any).first_name} className="mt-1" />
                                </div>
                                <div>
                                    <label className={labelClass}>Last Name</label>
                                    <input type="text" value={infoData.last_name}
                                        onChange={e => setInfoData('last_name', e.target.value)}
                                        className={inputClass} placeholder="Doe" />
                                    <InputError message={(infoErrors as any).last_name} className="mt-1" />
                                </div>
                                <div>
                                    <label className={labelClass}>Username</label>
                                    <input type="text" value={infoData.username}
                                        onChange={e => setInfoData('username', e.target.value)}
                                        className={inputClass} placeholder="@johndoe" />
                                    <InputError message={infoErrors.username} className="mt-1" />
                                </div>
                                <div>
                                    <label className={labelClass}>Email</label>
                                    <input type="email" value={infoData.email}
                                        onChange={e => setInfoData('email', e.target.value)}
                                        className={inputClass} placeholder="john.doe@email.com" />
                                    <InputError message={infoErrors.email} className="mt-1" />
                                    {mustVerifyEmail && !user.email_verified_at && (
                                        <p className="mt-1.5 text-xs text-amber-600">
                                            Email unverified. &nbsp;
                                            <Link href={route('verification.send')} method="post" as="button"
                                                className="underline hover:text-amber-700">Resend link</Link>
                                        </p>
                                    )}
                                    {status === 'verification-link-sent' && (
                                        <p className="mt-1.5 text-xs text-avaa-teal font-medium">Verification link sent!</p>
                                    )}
                                </div>
                            </div>

                            {/* Email + Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Phone Number</label>
                                    <input type="tel" value={infoData.phone}
                                        onChange={e => setInfoData('phone', e.target.value)}
                                        className={inputClass} placeholder="+1 (555) 123-4567" />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100">
                                {infoSaved && <span className="text-xs text-avaa-teal font-medium">✓ Saved</span>}
                                <button type="button" onClick={() => resetInfo()}
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

                    {/* ── Profile Frame (job seekers only) ── */}
                    {isJobSeeker && (
                        <Card>
                            <CardHeader
                                title="Profile Frame"
                                subtitle="Let employers know your current job-seeking status with a profile frame."
                            />
                            <div className="p-6">
                                {/* Live avatar preview */}
                                <div className="flex justify-center mb-8">
                                    <div className="relative">
                                        {/* Pulsing glow — Open to Work */}
                                        {profileFrame === 'open_to_work' && (
                                            <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-25 z-0" />
                                        )}
                                        {/* Pulsing glow — Not Open to Work */}
                                        {profileFrame === 'not_open_to_work' && (
                                            <span className="absolute inset-0 rounded-full animate-pulse bg-red-300 opacity-20 z-0" />
                                        )}
                                        <div
                                            className={`relative z-10 rounded-full p-1 transition-all duration-300 ${
                                                profileFrame === 'open_to_work'
                                                    ? 'ring-4 ring-emerald-400 shadow-lg shadow-emerald-200'
                                                    : profileFrame === 'not_open_to_work'
                                                    ? 'ring-4 ring-red-400 shadow-lg shadow-red-100'
                                                    : 'ring-4 ring-gray-200'
                                            }`}
                                        >
                                            <ImageInitialsFallback
                                                src={user.avatar}
                                                alt={`${user.first_name} ${user.last_name}`}
                                                initials={initials}
                                                className="w-20 h-20 rounded-full overflow-hidden bg-avaa-dark"
                                                textClassName="text-white text-2xl font-bold flex items-center justify-center"
                                            />
                                        </div>
                                        {/* Open to Work badge */}
                                        {profileFrame === 'open_to_work' && (
                                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow z-20">
                                                Open to Work
                                            </span>
                                        )}
                                        {/* Not Open to Work badge */}
                                        {profileFrame === 'not_open_to_work' && (
                                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow z-20">
                                                Not Open to Work
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Frame options — 3 tiles */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">

                                    {/* ── Default ── */}
                                    <button
                                        type="button"
                                        onClick={() => setProfileFrame('default')}
                                        className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${
                                            profileFrame === 'default'
                                                ? 'border-gray-300 bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                                        }`}
                                    >
                                        {/* Mini avatar with default ring */}
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full ring-2 ring-gray-200 bg-avaa-dark flex items-center justify-center text-white text-xs font-bold">
                                                {initials}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-xs font-semibold ${profileFrame === 'default' ? 'text-gray-800' : 'text-gray-600'}`}>
                                                Default
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                                                No frame
                                            </p>
                                        </div>
                                        {profileFrame === 'default' && (
                                            <span className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0" />
                                        )}
                                    </button>

                                    {/* ── Open to Work ── */}
                                    <button
                                        type="button"
                                        onClick={() => setProfileFrame('open_to_work')}
                                        className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${
                                            profileFrame === 'open_to_work'
                                                ? 'border-emerald-400 bg-emerald-50'
                                                : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/40'
                                        }`}
                                    >
                                        {/* Mini avatar preview with green ring */}
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full ring-2 ring-emerald-400 ring-offset-1 bg-avaa-dark flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-emerald-200">
                                                {initials}
                                            </div>
                                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[7px] font-bold px-1.5 py-px rounded-full whitespace-nowrap z-10 leading-tight">
                                                OTW
                                            </span>
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-xs font-semibold ${profileFrame === 'open_to_work' ? 'text-emerald-700' : 'text-gray-700'}`}>
                                                Open to Work
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                                                Green frame
                                            </p>
                                        </div>
                                        {profileFrame === 'open_to_work' && (
                                            <span className="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0" />
                                        )}
                                    </button>

                                    {/* ── Not Open to Work ── */}
                                    <button
                                        type="button"
                                        onClick={() => setProfileFrame('not_open_to_work')}
                                        className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${
                                            profileFrame === 'not_open_to_work'
                                                ? 'border-red-400 bg-red-50'
                                                : 'border-gray-200 hover:border-red-200 hover:bg-red-50/40'
                                        }`}
                                    >
                                        {/* Mini avatar preview with red ring + X badge */}
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full ring-2 ring-red-400 ring-offset-1 bg-avaa-dark flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-red-100">
                                                {initials}
                                            </div>
                                            {/* Red X overlay */}
                                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-bold px-1.5 py-px rounded-full whitespace-nowrap z-10 leading-tight flex items-center gap-0.5">
                                                <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                                    <line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" />
                                                </svg>
                                                Off
                                            </span>
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-xs font-semibold ${profileFrame === 'not_open_to_work' ? 'text-red-600' : 'text-gray-700'}`}>
                                                Not Open to Work
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                                                Red frame
                                            </p>
                                        </div>
                                        {profileFrame === 'not_open_to_work' && (
                                            <span className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0" />
                                        )}
                                    </button>
                                </div>

                                {/* Save button */}
                                <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100">
                                    {frameSaved && (
                                        <span className="text-xs text-avaa-teal font-medium">✓ Frame saved</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={saveFrame}
                                        disabled={frameSaving}
                                        className="px-5 py-2 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {frameSaving ? 'Saving…' : 'Save Frame'}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    )}


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

                    {/* ── Delete Account ── */}
                    <Card>
                        <div className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-avaa-dark">Delete Account</h3>
                                <p className="text-xs text-avaa-muted mt-0.5">
                                    Once you delete your account, all your data will be permanently removed.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDelete(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 text-sm font-semibold transition-colors flex-shrink-0 ml-4">
                                <IcoTrash />
                                Delete Account
                            </button>
                        </div>
                    </Card>

                </SettingsLayout>
            </AppLayout>
        </>
    );
}