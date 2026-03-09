export interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string | null;
    email: string;
    phone: string | null;
    role: 'admin' | 'employer' | 'job_seeker';
    status: 'pending' | 'active' | 'suspended';
    profile_completed: boolean;
    email_verified_at: string | null;
    last_login_at: string | null;
    avatar: string | null;
    google_id: string | null;
    created_at: string;
    updated_at: string;
    employer_profile?: EmployerProfile | null;
    job_seeker_profile?: JobSeekerProfile | null;
    work_experiences?: WorkExperience[] | null;
}

export interface AppNotification {
    id: string;
    type: string;
    data: {
        message: string;
        link?: string;
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string;
    time_ago: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
        session_id: string;
    };
    unreadNotificationsCount: number;
};

export interface EmployerProfile {
    id: number;
    user_id: number;
    company_name: string;
    company_website: string | null;
    industry: string;
    company_size: string;
    company_description: string;
    logo_path: string | null;
    headquarters_address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    fein_tax_id: string | null;
    business_registration_number: string | null;
    linkedin_url: string | null;
    facebook_url: string | null;
    twitter_url: string | null;
    instagram_url: string | null;
    year_established: number | null;
    is_verified: boolean;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface JobSeekerProfile {
    id: number;
    user_id: number;
    professional_title: string;
    city: string;
    state: string;
    country: string;
    current_job_title: string | null;
    current_company: string | null;
    years_of_experience: string;
    employment_type_preference: string[];
    highest_education: string;
    field_of_study: string | null;
    institution_name: string | null;
    skills: string[];
    certifications: string[] | null;
    resume_path: string;
    resume_parsed_data: Record<string, unknown> | null;
    portfolio_url: string | null;
    linkedin_url: string | null;
    desired_job_types: string[];
    desired_industries: string[] | null;
    expected_salary_min: number | null;
    expected_salary_max: number | null;
    salary_currency: string;
    willing_to_relocate: boolean;
    profile_visibility: 'public' | 'private';
    profile_completeness: number;
    created_at: string;
    updated_at: string;
}

export interface WorkExperience {
    id: number;
    user_id: number;
    job_title: string;
    company: string;
    employment_type: string | null;
    location: string | null;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}