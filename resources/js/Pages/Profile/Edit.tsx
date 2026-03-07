import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AppLayout
            pageTitle="Profile"
            pageSubtitle="Manage your account information and settings"
            activeNav="Profile"
        >
            <Head title="Profile" />

            <div className="space-y-6">
                {/* Profile Information */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </div>

                {/* Update Password */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <UpdatePasswordForm />
                </div>

                {/* Delete Account */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <DeleteUserForm />
                </div>
            </div>
        </AppLayout>
    );
}