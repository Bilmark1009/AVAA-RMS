import { useEffect } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: Props) {
    // Optional: Close on "Escape" key press
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-avaa-dark/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-avaa-dark">
                        Privacy Policy
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Policy Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-sm text-avaa-text leading-relaxed">
                    <section className="space-y-4">
                        <p className="font-bold text-avaa-dark">
                            Last Updated: March 12, 2026
                        </p>
                        <p>
                            Welcome to AVAA. We value your privacy and the
                            security of your data.
                        </p>
                        <h4 className="font-bold text-avaa-dark text-base pt-2">
                            1. Information We Collect
                        </h4>
                        <p>
                            We collect information you provide directly to us
                            when you create an account, such as your name, email
                            address, resume details, and professional history to
                            facilitate job matching.
                        </p>
                        <h4 className="font-bold text-avaa-dark text-base pt-2">
                            2. How We Use Your Data
                        </h4>
                        <p>
                            Your data is used to provide our recruitment
                            services, including our AI Smart Matching system. We
                            do not sell your personal data to third parties for
                            marketing purposes.
                        </p>
                        <h4 className="font-bold text-avaa-dark text-base pt-2">
                            3. Data Security
                        </h4>
                        <p>
                            We implement industry-standard encryption and
                            security measures to protect your information from
                            unauthorized access or disclosure.
                        </p>
                        <h4 className="font-bold text-avaa-dark text-base pt-2">
                            4. Your Rights
                        </h4>
                        <p>
                            You have the right to access, correct, or delete
                            your personal information at any time through your
                            account settings or by contacting our support team.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
