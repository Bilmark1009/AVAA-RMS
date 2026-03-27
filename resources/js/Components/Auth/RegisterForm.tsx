import { FormEventHandler, useState } from "react";
import { useForm, Link } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import AuthLayout from "@/Layouts/AuthLayout";
import PrivacyPolicyModal from "@/Components/Modals/PrivacyPolicyModal";

const FIELD_LIMITS = {
    first_name: { min: 2, max: 50 },
    last_name: { min: 0, max: 50 },
    username: { min: 0, max: 30 },
    email: { min: 6, max: 30 },
    phone: { min: 0, max: 20 }, // unchanged
    password: { min: 8, max: 30 },
    password_confirmation: { min: 8, max: 30 },
} as const;

const NAME_REGEX = /^[A-Za-z]+$/;

interface Props {
    role: "employer" | "job_seeker";
    storeRoute: string;
    backRoute: string;
    title: string;
    subtitle: string;
}

function PasswordStrength({ password }: { password: string }) {
    const getStrength = () => {
        if (!password) return { score: 0, label: "", color: "" };
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        const levels = [
            { label: "Weak", color: "bg-red-500" },
            { label: "Fair", color: "bg-yellow-500" },
            { label: "Good", color: "bg-blue-500" },
            { label: "Strong", color: "bg-avaa-primary" },
        ];
        return { score, ...(levels[score - 1] ?? levels[0]) };
    };
    const { score, label, color } = getStrength();
    if (!password) return null;
    return (
        <div className="mt-1">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${i <= score ? color : "bg-gray-200"}`}
                    />
                ))}
            </div>
            <p
                className={`text-xs ${score <= 1 ? "text-red-500" : score === 2 ? "text-yellow-500" : score === 3 ? "text-blue-500" : "text-avaa-primary"}`}
            >
                {label}
            </p>
        </div>
    );
}

export default function RegisterForm({
    role,
    storeRoute,
    backRoute,
    title,
    subtitle,
}: Props) {
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        terms: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const fieldKeys = Object.keys(FIELD_LIMITS) as Array<
            keyof typeof FIELD_LIMITS
        >;

        let hasLengthError = false;
        fieldKeys.forEach((field) => {
            const min = FIELD_LIMITS[field].min;
            const max = FIELD_LIMITS[field].max;
            if ((min && data[field].length < min) || data[field].length > max) {
                hasLengthError = true;
                let msg = '';
                if (data[field].length > max) {
                    msg = `This field may not be greater than ${max} characters.`;
                } else if (min && data[field].length < min) {
                    msg = `This field must be at least ${min} characters.`;
                }
                setError(field, msg);
            } else {
                clearErrors(field);
            }
        });

        if (data.first_name && !NAME_REGEX.test(data.first_name)) {
            hasLengthError = true;
            setError("first_name", "First name can contain letters A-Z only.");
        }

        if (data.last_name && !NAME_REGEX.test(data.last_name)) {
            hasLengthError = true;
            setError("last_name", "Last name can contain letters A-Z only.");
        }

        if (hasLengthError) {
            return;
        }

        post(storeRoute);
    };

    const hasFieldError =
        data.first_name.length < FIELD_LIMITS.first_name.min ||
        data.first_name.length > FIELD_LIMITS.first_name.max ||
        !NAME_REGEX.test(data.first_name) ||
        data.last_name.length > FIELD_LIMITS.last_name.max ||
        !NAME_REGEX.test(data.last_name) ||
        data.username.length > FIELD_LIMITS.username.max ||
        data.email.length < FIELD_LIMITS.email.min ||
        data.email.length > FIELD_LIMITS.email.max ||
        (data.email.endsWith('@gmail.com') && (data.email.split('@')[0].length < 6 || data.email.split('@')[0].length > 30)) ||
        data.password.length < FIELD_LIMITS.password.min ||
        data.password.length > FIELD_LIMITS.password.max ||
        data.password_confirmation.length < FIELD_LIMITS.password_confirmation.min ||
        data.password_confirmation.length > FIELD_LIMITS.password_confirmation.max;

    const isAtFieldLimit = (value: string, max: number) => value.length === max;
    const isBelowFieldMin = (value: string, min: number) => value.length > 0 && value.length < min;

    const inputClass =
        "mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-avaa-dark placeholder-avaa-muted focus:outline-none focus:ring-2 focus:ring-avaa-primary/40 focus:border-avaa-primary transition";

    return (
        <AuthLayout title={title} subtitle={subtitle}>
            <form onSubmit={submit} className="space-y-5">
                {/* First Name, Last Name, Username — 3 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label
                            htmlFor="first_name"
                            className="block text-base font-medium text-avaa-text"
                        >
                            First Name
                        </label>
                        <input
                            id="first_name"
                            type="text"
                            value={data.first_name}
                            maxLength={FIELD_LIMITS.first_name.max}
                            pattern="[A-Za-z]+"
                            title="Use letters A-Z only"
                            className={inputClass}
                            autoComplete="given-name"
                            autoFocus
                            placeholder="John"
                            onChange={(e) =>
                                setData("first_name", e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.first_name}
                            className="mt-1"
                        />
                        {isAtFieldLimit(data.first_name, FIELD_LIMITS.first_name.max) && (
                            <p className="mt-1 text-xs text-avaa-muted">Maximum {FIELD_LIMITS.first_name.max} characters reached.</p>
                        )}
                        {isBelowFieldMin(data.first_name, FIELD_LIMITS.first_name.min) && (
                            <p className="mt-1 text-xs text-red-500">Minimum {FIELD_LIMITS.first_name.min} characters required.</p>
                        )}
                        {data.first_name.length > 0 && !NAME_REGEX.test(data.first_name) && (
                            <p className="mt-1 text-xs text-red-500">Only letters A-Z are allowed.</p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="last_name"
                            className="block text-base font-medium text-avaa-text"
                        >
                            Last Name
                        </label>
                        <input
                            id="last_name"
                            type="text"
                            value={data.last_name}
                            maxLength={FIELD_LIMITS.last_name.max}
                            pattern="[A-Za-z]+"
                            title="Use letters A-Z only"
                            className={inputClass}
                            autoComplete="family-name"
                            placeholder="Doe"
                            onChange={(e) =>
                                setData("last_name", e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.last_name}
                            className="mt-1"
                        />
                        {isAtFieldLimit(data.last_name, FIELD_LIMITS.last_name.max) && (
                            <p className="mt-1 text-xs text-avaa-muted">Maximum {FIELD_LIMITS.last_name.max} characters reached.</p>
                        )}
                        {data.last_name.length > 0 && !NAME_REGEX.test(data.last_name) && (
                            <p className="mt-1 text-xs text-red-500">Only letters A-Z are allowed.</p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-base font-medium text-avaa-text"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={data.username}
                            maxLength={FIELD_LIMITS.username.max}
                            className={inputClass}
                            autoComplete="username"
                            placeholder="@johndoe"
                            onChange={(e) =>
                                setData("username", e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.username}
                            className="mt-1"
                        />
                        {isAtFieldLimit(data.username, FIELD_LIMITS.username.max) && (
                            <p className="mt-1 text-xs text-avaa-muted">Maximum {FIELD_LIMITS.username.max} characters reached.</p>
                        )}
                    </div>
                </div>

                {/* Email & Phone - side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-base font-medium text-avaa-text"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            maxLength={FIELD_LIMITS.email.max}
                            className={inputClass}
                            autoComplete="email"
                            placeholder="you@example.com"
                            onChange={(e) => setData("email", e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-1" />
                        {isAtFieldLimit(data.email, FIELD_LIMITS.email.max) && (
                            <p className="mt-1 text-xs text-avaa-muted">Maximum {FIELD_LIMITS.email.max} characters reached.</p>
                        )}
                        {isBelowFieldMin(data.email, FIELD_LIMITS.email.min) && (
                            <p className="mt-1 text-xs text-red-500">Minimum {FIELD_LIMITS.email.min} characters required.</p>
                        )}
                        {data.email.endsWith('@gmail.com') && (data.email.split('@')[0].length < 6 || data.email.split('@')[0].length > 30) && (
                            <p className="mt-1 text-xs text-red-500">Gmail local part must be 6-30 characters.</p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-base font-medium text-avaa-text"
                        >
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            maxLength={FIELD_LIMITS.phone.max}
                            className={inputClass}
                            autoComplete="tel"
                            placeholder="+1 (555) 000-0000"
                            onChange={(e) => setData("phone", e.target.value)}
                            required
                        />
                        <InputError message={errors.phone} className="mt-1" />
                        {isAtFieldLimit(data.phone, FIELD_LIMITS.phone.max) && (
                            <p className="mt-1 text-xs text-avaa-muted">Maximum {FIELD_LIMITS.phone.max} characters reached.</p>
                        )}
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label
                        htmlFor="password"
                        className="block text-base font-medium text-avaa-text"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={data.password}
                            maxLength={FIELD_LIMITS.password.max}
                            className={`${inputClass} pr-10`}
                            autoComplete="new-password"
                            placeholder="Create a strong password"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-avaa-muted hover:text-avaa-text mt-1"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                    <PasswordStrength password={data.password} />
                    <InputError message={errors.password} className="mt-1" />
                    {isAtFieldLimit(data.password, FIELD_LIMITS.password.max) && (
                        <p className="mt-1 text-xs text-avaa-muted">Maximum {FIELD_LIMITS.password.max} characters reached.</p>
                    )}
                    {isBelowFieldMin(data.password, FIELD_LIMITS.password.min) && (
                        <p className="mt-1 text-xs text-red-500">Minimum {FIELD_LIMITS.password.min} characters required.</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label
                        htmlFor="password_confirmation"
                        className="block text-base font-medium text-avaa-text"
                    >
                        Confirm Password
                    </label>
                    <input
                        id="password_confirmation"
                        type={showPassword ? "text" : "password"}
                        value={data.password_confirmation}
                        maxLength={FIELD_LIMITS.password_confirmation.max}
                        className={inputClass}
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        required
                    />
                    {data.password_confirmation &&
                        data.password !== data.password_confirmation && (
                            <p className="mt-1 text-xs text-red-500">
                                Passwords do not match
                            </p>
                        )}
                    {isAtFieldLimit(data.password_confirmation, FIELD_LIMITS.password_confirmation.max) && (
                        <p className="mt-1 text-xs text-avaa-muted">Maximum {FIELD_LIMITS.password_confirmation.max} characters reached.</p>
                    )}
                    {isBelowFieldMin(data.password_confirmation, FIELD_LIMITS.password_confirmation.min) && (
                        <p className="mt-1 text-xs text-red-500">Minimum {FIELD_LIMITS.password_confirmation.min} characters required.</p>
                    )}
                </div>
                <div className="flex items-start gap-3">
                    <input
                        id="terms"
                        type="checkbox"
                        checked={data.terms}
                        onChange={(e) => setData("terms", e.target.checked)}
                        className={`mt-1 h-4 w-4 rounded border-gray-300 text-avaa-primary focus:ring-avaa-primary cursor-pointer ${errors.terms ? "border-red-500" : ""}`}
                    />
                    <label
                        htmlFor="terms"
                        className="text-sm text-avaa-text leading-tight cursor-pointer"
                    >
                        I have read and agree to the{" "}
                        <button
                            type="button"
                            onClick={() => setShowPrivacy(true)}
                            className="text-avaa-primary font-bold"
                        >
                            Privacy Policy
                        </button>
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                </div>
                {/* Show the error message if the backend rejects it */}
                <InputError message={errors.terms} className="mt-1" />
                <InputError message={errors.terms} className="mt-1" />
                {/* Submit */}
                <button
                    type="submit"
                    // The button is disabled if 'processing' is true OR 'terms' is false
                    disabled={processing || !data.terms || hasFieldError}
                    className="w-full py-3 rounded-xl bg-avaa-primary text-white font-semibold text-base hover:bg-avaa-primary-hover focus:outline-none focus:ring-2 focus:ring-avaa-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {processing
                        ? "Creating account..."
                        : `Create ${role === "employer" ? "Employer" : "Job Seeker"} Account`}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-avaa-muted">
                <Link
                    href={backRoute}
                    className="text-avaa-primary hover:text-avaa-primary-hover font-medium"
                >
                    ← Choose a different role
                </Link>
                {" · "}
                <Link
                    href={route("login")}
                    className="text-avaa-primary hover:text-avaa-primary-hover font-medium"
                >
                    Already have an account?
                </Link>
            </p>
            <PrivacyPolicyModal
                isOpen={showPrivacy}
                onClose={() => setShowPrivacy(false)}
            />
        </AuthLayout>
    );
}
