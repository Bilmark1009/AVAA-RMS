import { PropsWithChildren, useEffect, useRef } from "react";
import { usePage, router, Head } from "@inertiajs/react";
import type { PageProps } from "@/types";

interface AuthLayoutProps extends PropsWithChildren {
    title?: string;
    subtitle?: string;
}

export default function AuthLayout({
    children,
    title,
    subtitle,
}: AuthLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const redirecting = useRef(false);

    useEffect(() => {
        if (auth?.user && auth.user.email_verified_at && !redirecting.current) {
            redirecting.current = true;
            const dashboardPaths: Record<string, string> = {
                admin: "/admin/dashboard",
                employer: "/employer/dashboard",
                job_seeker: "/job-seeker/jobs",
            };
            const target = dashboardPaths[auth.user.role] ?? "/";
            router.visit(target, { replace: true });
        }
    }, [auth]);

    if (auth?.user && auth.user.email_verified_at) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white">
            {/* Left Panel: Background Image with Content */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{
                        backgroundImage:
                            "url('/logos/bg.jpg')",
                    }}
                >
                    {/* Darker Gradient Overlay to match screenshot depth */}
                    <div
                        className="absolute inset-0 opacity-40"
                       style={{ 
            background: 'linear-gradient(180deg, #005C69 0%, #00292F 60%, #00292F 100%)' 
        }}
                    />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col justify-between p-16 w-full">
                    {/* Top Content: Slogan & Details */}
                    <div className="mt-10 max-w-lg">
                        <h1 className="text-5xl font-bold text-white leading-tight mb-6">
                            Reclaim Your Time.
                            <br />
                            Scale Your Impact.
                        </h1>
                        <p className="text-gray-200 text-lg mb-10 leading-relaxed">
                            Connect with top virtual talent and streamline your
                            resource allocation with AVAA's advanced management
                            system.
                        </p>

                        {/* Feature List (Matching the screenshot icons) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-white">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <svg
                                        className="w-5 h-5 text-[#3CD894]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <span className="font-medium">
                                    Real-time resource tracking
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-white">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <svg
                                        className="w-5 h-5 text-[#3CD894]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <span className="font-medium">
                                    Advanced analytics & insights
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-white">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <svg
                                        className="w-5 h-5 text-[#3CD894]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <span className="font-medium">
                                    Seamless team collaboration
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Logo Section */}
                    <div className="flex items-center gap-4">
                        <img
                            src="/logos/AVAA_Logo.png"
                            alt="AVAA Logo"
                            className="h-12 w-auto " // Force logo to be white
                        />
                        <span className="text-3xl font-bold text-white tracking-widest">
                            AVAA
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 lg:px-24">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        {title && (
                            <h2 className="text-3xl font-bold text-[#1e3a4f] mb-2">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-gray-500 text-sm">{subtitle}</p>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
