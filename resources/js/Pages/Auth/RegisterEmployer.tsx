import { Head } from '@inertiajs/react';
import RegisterForm from '@/Components/Auth/RegisterForm';

export default function RegisterEmployer() {
    return (
        <>
            <Head title="Register as Employer" />
            <RegisterForm
                role="employer"
                storeRoute={route('register.employer.store')}
                backRoute={route('register')}
                title="Create Employer Account"
                subtitle="Start hiring the best talent today"
            />
        </>
    );
}