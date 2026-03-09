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

/* ── Notif row ── */
function NotifRow({ label, description, checked, onChange }: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-50 last:border-b-0">
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
interface AdminNotifSettings {
    new_job_posted: boolean;
    new_user_registered: boolean;
    system_alerts: boolean;
    security_alerts: boolean;
    maintenance_notices: boolean;
}

interface Props {
    settings: AdminNotifSettings;
}

export default function AdminSettingsNotifications({ settings }: Props) {
    const [form, setForm] = useState<AdminNotifSettings>({
        new_job_posted: settings?.new_job_posted ?? true,
        new_user_registered: settings?.new_user_registered ?? true,
        system_alerts: settings?.system_alerts ?? true,
        security_alerts: settings?.security_alerts ?? true,
        maintenance_notices: settings?.maintenance_notices ?? true,
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const update = (key: keyof AdminNotifSettings, value: boolean) => {
        const next = { ...form, [key]: value };
        setForm(next);
        setSaving(true);
        router.patch(route('admin.settings.notifications.update'), next, {
            preserveScroll: true,
            onSuccess: () => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); },
            onError: () => setSaving(false),
        });
    };

    return (
        <>
            <Head title="Notification Preferences" />
            <AppLayout pageTitle="Account Settings" pageSubtitle="Manage your account, security, preferences, and notifications." activeNav="Settings">

                <TabNav active="notifications" />

                <div className="space-y-5">

                    {/* ── Email Notifications ── */}
                    <Card>
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-avaa-dark">Email Notifications</h3>
                        </div>
                        <NotifRow
                            label="New Job Posted"
                            description="Get notified when a job matches your specific skills and experience."
                            checked={form.new_job_posted}
                            onChange={v => update('new_job_posted', v)}
                        />
                        <NotifRow
                            label="New User Registered"
                            description="Stay updated on your application progress from submission to hire."
                            checked={form.new_user_registered}
                            onChange={v => update('new_user_registered', v)}
                        />
                    </Card>

                    {/* ── System Alerts ── */}
                    <Card>
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-avaa-dark">System Alerts</h3>
                        </div>
                        <NotifRow
                            label="System Alerts"
                            description="Critical system notifications"
                            checked={form.system_alerts}
                            onChange={v => update('system_alerts', v)}
                        />
                        <NotifRow
                            label="Security Alerts"
                            description="Security-related notifications"
                            checked={form.security_alerts}
                            onChange={v => update('security_alerts', v)}
                        />
                        <NotifRow
                            label="Maintenance Notices"
                            description="System maintenance notifications"
                            checked={form.maintenance_notices}
                            onChange={v => update('maintenance_notices', v)}
                        />
                    </Card>

                    {/* Auto-save indicator */}
                    <div className="flex justify-end h-6 items-center">
                        {saving && <span className="text-xs text-avaa-muted">Saving…</span>}
                        {saved && <span className="text-xs text-avaa-teal font-medium">✓ Preferences saved</span>}
                    </div>

                </div>
            </AppLayout>
        </>
    );
}
