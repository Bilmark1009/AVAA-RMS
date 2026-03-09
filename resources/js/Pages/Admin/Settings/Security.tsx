import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

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

/* ── Toggle ── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:ring-offset-2 flex-shrink-0 cursor-pointer
                ${checked ? 'bg-avaa-primary' : 'bg-gray-200'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
                ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}

/* ── Card ── */
function Card({ children }: { children: React.ReactNode }) {
    return <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">{children}</div>;
}
function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-avaa-dark">{title}</h3>
            {subtitle && <p className="text-xs text-avaa-muted mt-0.5">{subtitle}</p>}
        </div>
    );
}

/* ── Toggle row ── */
function ToggleRow({ label, description, checked, onChange }: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-4 py-4">
            <div className="min-w-0">
                <p className="text-sm font-medium text-avaa-dark">{label}</p>
                <p className="text-xs text-avaa-muted mt-0.5">{description}</p>
            </div>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    );
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
interface SecuritySettings {
    two_factor_enabled: boolean;
    login_alert_email: boolean;
    login_alert_push: boolean;
    restrict_by_ip: boolean;
    session_timeout: number;
}

interface Props {
    settings: SecuritySettings;
}

export default function AdminSettingsSecurity({ settings }: Props) {
    const [form, setForm] = useState<SecuritySettings>({
        two_factor_enabled: settings?.two_factor_enabled ?? false,
        login_alert_email: settings?.login_alert_email ?? true,
        login_alert_push: settings?.login_alert_push ?? true,
        restrict_by_ip: settings?.restrict_by_ip ?? false,
        session_timeout: settings?.session_timeout ?? 30,
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const update = (key: keyof SecuritySettings, value: any) => {
        const next = { ...form, [key]: value };
        setForm(next);
        setSaving(true);
        router.patch(route('admin.settings.security.update'), next, {
            preserveScroll: true,
            onSuccess: () => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); },
            onError: () => setSaving(false),
        });
    };

    return (
        <>
            <Head title="Security & Privacy" />
            <AppLayout pageTitle="Account Settings" pageSubtitle="Manage your account, security, preferences, and notifications." activeNav="Settings">

                <TabNav active="security" />

                <div className="space-y-5">

                    {/* ── 2FA ── */}
                    <Card>
                        <div className="px-6 py-5 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-semibold text-avaa-dark">Two-Factor Authentication (2FA)</h3>
                                <p className="text-xs text-avaa-muted mt-0.5 max-w-md">
                                    Protect your account with an extra layer of security. We will ask for a verification code when you log in on a new device.
                                </p>
                            </div>
                            <Toggle checked={form.two_factor_enabled} onChange={v => update('two_factor_enabled', v)} />
                        </div>
                    </Card>

                    {/* ── Login Alerts ── */}
                    <Card>
                        <CardHeader title="Login Alerts" subtitle="Choose how you want to be notified when a new login is detected on your account." />
                        <div className="px-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-50">
                                <div className="py-4 sm:pr-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-avaa-dark">Email Notifications</p>
                                            <p className="text-xs text-avaa-muted mt-0.5">Send an alert your email</p>
                                        </div>
                                        <Toggle checked={form.login_alert_email} onChange={v => update('login_alert_email', v)} />
                                    </div>
                                </div>
                                <div className="py-4 sm:pl-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-avaa-dark">Push Notifications</p>
                                            <p className="text-xs text-avaa-muted mt-0.5">Alerts via desktop or mobile app</p>
                                        </div>
                                        <Toggle checked={form.login_alert_push} onChange={v => update('login_alert_push', v)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* ── Privacy & Security ── */}
                    <Card>
                        <CardHeader title="Privacy & Security" />
                        <div className="px-6 divide-y divide-gray-50">
                            <ToggleRow
                                label="Restrict Access by IP"
                                description="Only allow access from specific IP addresses"
                                checked={form.restrict_by_ip}
                                onChange={v => update('restrict_by_ip', v)}
                            />
                            <div className="flex items-start justify-between gap-4 py-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-avaa-dark">Automatic Session Timeout</p>
                                    <p className="text-xs text-avaa-muted mt-0.5">Require MFA for all administrative accounts</p>
                                </div>
                                <select
                                    value={form.session_timeout}
                                    onChange={e => update('session_timeout', parseInt(e.target.value))}
                                    className="flex-shrink-0 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-avaa-primary"
                                >
                                    <option value={15}>15 Minutes</option>
                                    <option value={30}>30 Minutes</option>
                                    <option value={60}>60 Minutes</option>
                                    <option value={120}>2 Hours</option>
                                </select>
                            </div>
                        </div>

                        {/* Auto-save indicator */}
                        <div className="px-6 py-3 border-t border-gray-50 flex justify-end h-10 items-center">
                            {saving && <span className="text-xs text-avaa-muted">Saving…</span>}
                            {saved && <span className="text-xs text-avaa-teal font-medium">✓ Changes saved</span>}
                        </div>
                    </Card>

                </div>
            </AppLayout>
        </>
    );
}
