import { PropsWithChildren } from 'react';

interface AuthLayoutProps extends PropsWithChildren {
    title?: string;
    subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Brand Panel — hidden on mobile, visible on lg+ */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-avaa-dark via-avaa-dark-mid to-avaa-dark-light flex-col items-center justify-center relative overflow-hidden p-12">
                {/* Subtle decorative circles */}
                <div className="absolute top-[-8rem] left-[-8rem] w-72 h-72 rounded-full bg-avaa-teal/5" />
                <div className="absolute bottom-[-6rem] right-[-6rem] w-56 h-56 rounded-full bg-avaa-primary/5" />

                <div className="relative z-10 text-center max-w-sm">
                    <img
                        src="/storage/logos/System_Logo/AVAA_Logo.png"
                        alt="AVAA Logo"
                        className="h-32 w-auto mx-auto mb-8 drop-shadow-lg"
                    />
                    <h1 className="text-3xl font-bold text-white tracking-tight">AVAA</h1>
                    <p className="mt-3 text-avaa-muted text-sm leading-relaxed">
                        Connect with top employers and discover opportunities
                        that match your skills and aspirations.
                    </p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="lg:w-1/2 flex flex-col min-h-screen">

                <div className="flex-1 flex items-center justify-center px-6 bg-white min-h-screen lg:min-h-0">
                    <div className="w-full max-w-md py-12">
                        {(title || subtitle) && (
                            <div className="mb-8">
                                {title && (
                                    <h2 className="text-2xl font-bold text-avaa-dark">{title}</h2>
                                )}
                                {subtitle && (
                                    <p className="mt-2 text-sm text-avaa-muted">{subtitle}</p>
                                )}
                            </div>
                        )}
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div className="py-4 text-center text-xs text-avaa-muted bg-white border-t border-gray-100">
                    By using this platform, you accept our{' '}
                    <a href="#" className="text-avaa-primary hover:underline font-medium">Terms &amp; Conditions</a>
                    {' '}and{' '}
                    <a href="#" className="text-avaa-primary hover:underline font-medium">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
}
