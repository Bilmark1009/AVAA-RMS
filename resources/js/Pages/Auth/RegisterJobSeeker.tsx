import { Head } from '@inertiajs/react';
import RegisterForm from '@/Components/Auth/RegisterForm';

export default function RegisterJobSeeker() {
    return (
        <>
            <Head title="Register as Job Seeker" />
            <RegisterForm
                role="job_seeker"
                storeRoute={route('register.job-seeker.store')}
                backRoute={route('register')}
                title="Create Job Seeker Account"
                subtitle="Find your next great opportunity"
            />
        </>
    );
}