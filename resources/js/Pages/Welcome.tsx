import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'Web Development': (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    ),
    'Mobile Apps': (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
    ),
    'UI/UX Design': (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" />
        </svg>
    ),
    'Data Science': (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    'Cloud & DevOps': (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
        </svg>
    ),
    'Cybersecurity': (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    'AI & Machine Learning': (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1.27c.34-.6.99-1 1.73-1a2 2 0 110 4c-.74 0-1.39-.4-1.73-1H20a7 7 0 01-7 7v1.27c.6.34 1 .99 1 1.73a2 2 0 11-4 0c0-.74.4-1.39 1-1.73V20a7 7 0 01-7-7H2.73c-.34.6-.99 1-1.73 1a2 2 0 110-4c.74 0 1.39.4 1.73 1H4a7 7 0 017-7V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z" />
        </svg>
    ),
    'Marketing': (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    ),
};

const CATEGORIES = [
    { label: 'Web Development', count: 312 },
    { label: 'Mobile Apps', count: 185 },
    { label: 'UI/UX Design', count: 247 },
    { label: 'Data Science', count: 156 },
    { label: 'Cloud & DevOps', count: 198 },
    { label: 'Cybersecurity', count: 134 },
    { label: 'AI & Machine Learning', count: 223 },
    { label: 'Marketing', count: 167 },
];

const FEATURED_JOBS = [
    { id: 1, initials: 'TN', title: 'Senior Frontend Developer', company: 'TechNova', location: 'San Francisco, CA', type: 'Full-time', salary: '$120k–$160k' },
    { id: 2, initials: 'DS', title: 'Backend Engineer', company: 'DataStream', location: 'New York, NY', type: 'Full-time', salary: '$130k–$170k' },
    { id: 3, initials: 'FL', title: 'Full-Stack Developer', company: 'FlowLabs', location: 'Seattle, WA', type: 'Full-time', salary: '$125k–$165k' },
    { id: 4, initials: 'NL', title: 'Data Scientist', company: 'NeuraLabs', location: 'Boston, MA', type: 'Full-time', salary: '$135k–$175k' },
    { id: 5, initials: 'PH', title: 'Product Manager', company: 'PivotHub', location: 'Remote', type: 'Full-time', salary: '$115k–$155k' },
    { id: 6, initials: 'SF', title: 'Solutions Architect', company: 'StackForge', location: 'Denver, CO', type: 'Full-time', salary: '$150k–$200k' },
];

const TESTIMONIALS = [
    { name: 'Sarah Chen', role: 'Software Engineer', text: 'AVAA helped me find my dream job in just two weeks. The platform is intuitive and the job recommendations are spot on.' },
    { name: 'Marcus Rivera', role: 'Product Designer', text: 'I love how easy it is to browse and apply. The multi-step application wizard made the process seamless and stress-free.' },
    { name: 'Aisha Patel', role: 'Data Analyst', text: 'The best job platform I have used. Clean interface, quality listings, and I appreciate the company transparency.' },
];

const PARTNER_LOGOS = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'];

const TOP_COMPANIES = ['TechNova', 'DataStream', 'FlowLabs', 'NeuraLabs', 'CloudScale', 'AppAxis', 'StackForge', 'ByteFortress'];

/* Shared max-width container — fills up to 1600px on wide desktops */
const C = 'w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24';

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function Welcome() {
    const [searchQuery, setSearchQuery] = useState('');
    const [heroVisible, setHeroVisible] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const sectionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const t = setTimeout(() => setHeroVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const handler = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    useEffect(() => {
        const container = sectionsRef.current;
        if (!container) return;
        const sections = container.querySelectorAll('.section-enter');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        (entry.target as HTMLElement).style.opacity = '1';
                        (entry.target as HTMLElement).style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
        );
        sections.forEach((s) => {
            (s as HTMLElement).style.opacity = '0';
            (s as HTMLElement).style.transform = 'translateY(32px)';
            (s as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(s);
        });
        return () => observer.disconnect();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) window.location.href = '/dashboard';
    };

    return (
        <>
            <Head title="AVAA – Find Your Ideal Job" />

            <style>{`
                html { scroll-behavior: smooth; }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(-8px); }
                }
                @keyframes marquee {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .float-1       { animation: float 3s ease-in-out infinite; }
                .float-2       { animation: float 3s ease-in-out infinite 0.5s; }
                .marquee-track { animation: marquee 14s linear infinite; }
                .marquee-track:hover { animation-play-state: paused; }
            `}</style>

            {/* ════════════════════════════════════
                NAVBAR — fixed, full-width
            ════════════════════════════════════ */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
                <div className={`${C} flex items-center justify-between h-16`}>

                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2.5 flex-shrink-0">
                        <img
                            src="/logos/AVAA_Logo.png"
                            alt="AVAA"
                            className="h-8 w-auto object-contain"
                        />
                        <span className="text-xl font-bold text-avaa-dark tracking-wide">AVAA</span>
                    </a>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-7 lg:gap-9 text-sm font-medium text-avaa-muted">
                        {[['#how-it-works', 'How It Works'], ['#categories', 'Categories'], ['#jobs', 'Jobs'], ['#testimonials', 'Reviews']].map(([href, label]) => (
                            <a key={href} href={href} className="hover:text-avaa-dark transition-colors">{label}</a>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href={route('login')}
                            className="px-4 py-2 text-sm font-semibold text-avaa-dark hover:bg-avaa-primary-light rounded-lg transition-colors">
                            Sign In
                        </Link>
                        <Link href={route('register')}
                            className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg bg-avaa-primary hover:bg-avaa-primary-hover transition-all hover:shadow-lg">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile controls */}
                    <div className="flex md:hidden items-center gap-1">
                        <Link href={route('login')} className="px-3 py-1.5 text-sm font-semibold text-avaa-dark">Sign In</Link>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-avaa-primary-light transition-colors"
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-avaa-dark">
                                {mobileMenuOpen
                                    ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                                    : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                                }
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 px-6 pb-5 pt-3 flex flex-col gap-1">
                        {[['#how-it-works', 'How It Works'], ['#categories', 'Categories'], ['#jobs', 'Jobs'], ['#testimonials', 'Reviews']].map(([href, label]) => (
                            <a key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2.5 text-sm font-medium text-avaa-muted hover:text-avaa-dark hover:bg-avaa-primary-light rounded-lg transition-colors">
                                {label}
                            </a>
                        ))}
                        <Link href={route('register')} onClick={() => setMobileMenuOpen(false)}
                            className="mt-3 block px-4 py-3 text-sm font-semibold text-white text-center rounded-lg bg-avaa-primary hover:bg-avaa-primary-hover transition-colors">
                            Get Started Free
                        </Link>
                    </div>
                )}
            </nav>

            {/* Body offset below fixed navbar */}
            <div ref={sectionsRef} className="min-h-screen bg-white overflow-x-hidden pt-16">

                {/* ════════════════════════════════════
                    HERO
                ════════════════════════════════════ */}
                <section className="relative bg-gradient-to-br from-avaa-primary-light via-white to-avaa-primary-light overflow-hidden">
                    {/* Dot pattern */}
                    <div className="absolute top-0 right-0 w-64 sm:w-[420px] h-64 sm:h-[420px] opacity-30 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #7EB0AB 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
                    <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #122431 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }} />

                    <div className={`${C} py-16 sm:py-24 md:py-32`}>
                        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">

                            {/* Left — text */}
                            <div className={`transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-avaa-primary/10 text-avaa-teal text-xs font-semibold mb-6">
                                    <span className="w-2 h-2 rounded-full bg-avaa-primary animate-pulse" />
                                    #1 Job Recruitment Platform
                                </div>

                                <h1 className="text-[44px] sm:text-[60px] lg:text-[68px] xl:text-[76px] 2xl:text-[84px] font-extrabold text-avaa-dark leading-[1.05] tracking-tight mb-5">
                                    Find Your<br />
                                    <span className="text-avaa-primary">Ideal Job</span>
                                </h1>

                                <p className="text-base sm:text-lg text-avaa-text mb-9 max-w-lg leading-relaxed">
                                    Explore thousands of job opportunities from top companies. Your next career move starts here.
                                </p>

                                {/* Search bar */}
                                <form onSubmit={handleSearch}
                                    className="flex items-center bg-white rounded-2xl shadow-lg shadow-avaa-primary/10 border border-gray-200 p-2 mb-10 w-full max-w-xl">
                                    <div className="flex items-center gap-2 flex-1 px-3 min-w-0">
                                        <svg className="flex-shrink-0 text-avaa-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search job titles, companies..."
                                            className="flex-1 py-2 text-sm text-avaa-dark placeholder-avaa-muted bg-transparent focus:outline-none min-w-0"
                                        />
                                    </div>
                                    <button type="submit"
                                        className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-avaa-primary hover:bg-avaa-primary-hover transition-all">
                                        Search
                                    </button>
                                </form>

                                {/* Stats */}
                                <div className="flex items-center gap-6 sm:gap-10 flex-wrap">
                                    {[['8M+', 'Active Members'], ['15k+', 'Jobs Posted'], ['2k+', 'Companies']].map(([num, label], i) => (
                                        <div key={label} className="flex items-center gap-6 sm:gap-10">
                                            {i > 0 && <div className="w-px h-10 bg-gray-200" />}
                                            <div>
                                                <p className="text-2xl sm:text-3xl font-extrabold text-avaa-dark">{num}</p>
                                                <p className="text-xs text-avaa-muted mt-0.5">{label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right — hero card */}
                            <div className={`relative hidden md:flex justify-center lg:justify-end transition-all duration-700 delay-200 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <div className="relative w-full max-w-[500px] xl:max-w-[540px]">
                                    <div className="bg-white rounded-3xl shadow-2xl shadow-avaa-dark/10 p-7 lg:p-9 border border-gray-200">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-12 h-12 rounded-full bg-avaa-dark flex items-center justify-center text-white font-bold text-sm flex-shrink-0">TN</div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-avaa-dark text-sm truncate">Senior Frontend Developer</p>
                                                <p className="text-xs text-avaa-muted">TechNova · San Francisco</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-avaa-primary/10 text-avaa-teal">React</span>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-avaa-primary-light text-avaa-teal">TypeScript</span>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-avaa-primary/10 text-avaa-primary">Tailwind CSS</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-extrabold text-avaa-dark">$120k–$160k</span>
                                            <span className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-avaa-primary">Apply Now</span>
                                        </div>
                                    </div>

                                    {/* Floating badge 1 */}
                                    <div className="absolute -top-5 -left-6 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-200 float-1">
                                        <div className="w-9 h-9 rounded-full bg-avaa-primary-light flex items-center justify-center flex-shrink-0">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-avaa-teal">
                                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-avaa-dark">Unlocking your</p>
                                            <p className="text-xs font-bold text-avaa-primary">potential</p>
                                        </div>
                                    </div>

                                    {/* Floating badge 2 */}
                                    <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-200 float-2">
                                        <div className="w-9 h-9 rounded-full bg-avaa-primary-light flex items-center justify-center flex-shrink-0">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-avaa-teal">
                                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-avaa-dark">10k+ candidates</p>
                                            <p className="text-[11px] text-avaa-muted">hired this month</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    PARTNER LOGOS
                ════════════════════════════════════ */}
                <section className="border-y border-gray-200 bg-gray-50 overflow-hidden">
                    <div className="relative py-5"
                        style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
                        <div className="flex gap-14 sm:gap-24 marquee-track w-max">
                            {[...PARTNER_LOGOS, ...PARTNER_LOGOS, ...PARTNER_LOGOS, ...PARTNER_LOGOS].map((name, i) => (
                                <span key={`${name}-${i}`} className="text-base sm:text-lg font-bold text-avaa-muted/40 tracking-wider select-none whitespace-nowrap">{name}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    HOW IT WORKS
                ════════════════════════════════════ */}
                <section id="how-it-works" className="py-20 sm:py-28 bg-white section-enter">
                    <div className={C}>
                        <div className="text-center mb-14">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-avaa-primary-light text-avaa-teal text-xs font-semibold mb-4 uppercase tracking-wider">How It Works</span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-avaa-dark tracking-tight">It's Easy to Get Started</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-10">
                            {[
                                { step: '01', title: 'Create Account', desc: 'Sign up for free and build your professional profile in minutes.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
                                { step: '02', title: 'Browse Jobs', desc: 'Search and filter through thousands of quality job listings.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> },
                                { step: '03', title: 'Apply & Get Hired', desc: 'Submit applications with our streamlined wizard and land your dream role.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
                            ].map((item) => (
                                <div key={item.step}
                                    className="relative bg-white rounded-2xl border border-gray-200 p-8 text-center hover:shadow-md hover:border-avaa-primary/40 transition-all duration-300 group">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-avaa-primary text-white text-xs font-bold flex items-center justify-center shadow-sm">{item.step}</div>
                                    <div className="w-14 h-14 rounded-2xl bg-avaa-primary-light flex items-center justify-center mx-auto mb-5 mt-3 text-avaa-teal group-hover:bg-avaa-primary/20 transition-colors">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-avaa-dark mb-2">{item.title}</h3>
                                    <p className="text-sm text-avaa-text leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    TOP COMPANIES
                ════════════════════════════════════ */}
                <section className="py-20 sm:py-28 bg-avaa-primary-light section-enter">
                    <div className={C}>
                        <div className="text-center mb-14">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-avaa-primary/15 text-avaa-teal text-xs font-semibold mb-4 uppercase tracking-wider">Top Companies</span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-avaa-dark tracking-tight mb-4">
                                Many Top Companies<br className="hidden sm:block" /> Posted Here
                            </h2>
                            <p className="text-sm sm:text-base text-avaa-text max-w-xl mx-auto">Leading organizations trust AVAA to find the best talent across industries.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                            {TOP_COMPANIES.map((name) => (
                                <div key={name} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 flex items-center gap-4 hover:shadow-sm hover:border-avaa-primary/30 transition-all">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-avaa-dark flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-avaa-dark text-sm truncate">{name}</p>
                                        <p className="text-xs text-avaa-muted">Hiring now</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    CATEGORIES
                ════════════════════════════════════ */}
                <section id="categories" className="py-20 sm:py-28 bg-white section-enter">
                    <div className={C}>
                        <div className="text-center mb-14">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-avaa-primary-light text-avaa-teal text-xs font-semibold mb-4 uppercase tracking-wider">Categories</span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-avaa-dark tracking-tight">Browse by Categories</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                            {CATEGORIES.map((cat) => (
                                <div key={cat.label}
                                    className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 text-center hover:shadow-lg hover:border-avaa-primary/40 transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-2xl bg-avaa-primary-light flex items-center justify-center mx-auto mb-3 text-avaa-teal group-hover:bg-avaa-primary/20 transition-colors">
                                        {CATEGORY_ICONS[cat.label]}
                                    </div>
                                    <h3 className="text-sm font-bold text-avaa-dark mb-1 group-hover:text-avaa-primary transition-colors leading-tight">{cat.label}</h3>
                                    <p className="text-xs text-avaa-muted">{cat.count} jobs</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    AI RECRUITER CTA — dark section
                ════════════════════════════════════ */}
                <section className="relative overflow-hidden bg-avaa-dark section-enter">
                    {/* Subtle teal dot pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #7EB0AB 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                    <div className={`${C} py-20 sm:py-28 relative z-10`}>
                        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 xl:gap-28 items-center">
                            <div>
                                <span className="inline-block px-4 py-1.5 rounded-full bg-avaa-primary/20 text-avaa-primary text-xs font-semibold mb-6 uppercase tracking-wider">Smart Matching</span>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
                                    Meet with AVAA's<br />Smart Recruiter
                                </h2>
                                <p className="text-sm sm:text-base text-avaa-muted mb-9 max-w-lg leading-relaxed">
                                    Our intelligent matching system analyzes your skills and preferences to connect you with the perfect opportunities — automatically.
                                </p>
                                <Link href={route('register')}
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-avaa-primary hover:bg-avaa-primary-hover transition-colors shadow-lg">
                                    Get Started Free
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Chat card */}
                            <div className="hidden md:flex justify-center lg:justify-end">
                                <div className="bg-avaa-dark-mid rounded-3xl p-7 lg:p-9 border border-avaa-primary/20 w-full max-w-sm xl:max-w-md">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-11 h-11 rounded-full bg-avaa-primary flex items-center justify-center flex-shrink-0">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2z" />
                                                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                                <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">AVAA Assistant</p>
                                            <p className="text-xs text-avaa-muted">Online</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-avaa-dark-light rounded-2xl rounded-tl-none px-4 py-3">
                                            <p className="text-sm text-white/90">Hi! I found <span className="font-bold text-avaa-primary">12 jobs</span> matching your profile. Shall I show you the top picks?</p>
                                        </div>
                                        <div className="bg-avaa-primary/20 rounded-2xl rounded-tr-none px-4 py-3 ml-8">
                                            <p className="text-sm text-white/90">Yes, show me the best matches!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    FEATURED JOBS
                ════════════════════════════════════ */}
                <section id="jobs" className="py-20 sm:py-28 bg-avaa-primary-light section-enter">
                    <div className={C}>
                        <div className="text-center mb-14">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-avaa-primary/15 text-avaa-teal text-xs font-semibold mb-4 uppercase tracking-wider">Featured Listings</span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-avaa-dark tracking-tight mb-4">Check Job of The Day</h2>
                            <p className="text-sm sm:text-base text-avaa-text max-w-xl mx-auto">Hand-picked opportunities updated daily to help you discover the best roles.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {FEATURED_JOBS.map((job) => (
                                <div key={job.id}
                                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-avaa-primary/40 transition-all duration-300 group cursor-pointer hover:-translate-y-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-avaa-dark flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {job.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-avaa-dark text-sm group-hover:text-avaa-primary transition-colors truncate">{job.title}</h3>
                                            <p className="text-xs text-avaa-muted">{job.company}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mb-4 text-xs text-avaa-muted flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                                            </svg>
                                            {job.location}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-avaa-primary-light text-avaa-teal font-medium">{job.type}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-extrabold text-avaa-dark">{job.salary}</span>
                                        <Link href={route('login')}
                                            className="px-4 py-2 rounded-lg text-xs font-semibold text-avaa-primary border border-avaa-primary hover:bg-avaa-primary hover:text-white transition-all">
                                            Apply
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <Link href={route('login')}
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-avaa-primary hover:bg-avaa-primary-hover transition-all hover:shadow-lg">
                                View All Jobs
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    TESTIMONIALS
                ════════════════════════════════════ */}
                <section id="testimonials" className="py-20 sm:py-28 bg-white section-enter">
                    <div className={C}>
                        <div className="text-center mb-14">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-avaa-primary-light text-avaa-teal text-xs font-semibold mb-4 uppercase tracking-wider">Testimonials</span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-avaa-dark tracking-tight mb-4">Quotes from Our Users</h2>
                            <p className="text-sm sm:text-base text-avaa-text max-w-xl mx-auto">Hear what professionals say about their AVAA experience.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {TESTIMONIALS.map((t) => (
                                <div key={t.name} className="bg-white rounded-2xl border border-gray-200 p-7 sm:p-8 hover:shadow-lg hover:border-avaa-primary/30 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-full bg-avaa-primary-light flex items-center justify-center mb-5">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-avaa-teal">
                                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.978 5.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm sm:text-base text-avaa-text leading-relaxed mb-6">"{t.text}"</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-avaa-dark flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                            {t.name.split(' ').map((w) => w[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-avaa-dark">{t.name}</p>
                                            <p className="text-xs text-avaa-muted">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    BOTTOM CTA
                ════════════════════════════════════ */}
                <section className="relative overflow-hidden bg-avaa-dark section-enter">
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #7EB0AB 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                    <div className={`${C} py-20 sm:py-28 relative z-10 text-center`}>
                        <p className="text-sm font-semibold text-avaa-primary mb-3 uppercase tracking-wider">Ready to Get Your Dream Job?</p>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-9">
                            Register Here Now <span className="inline-block ml-2">→</span>
                        </h2>
                        <Link href={route('register')}
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold bg-avaa-primary text-white hover:bg-avaa-primary-hover hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                            Get Started for Free
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                        </Link>
                    </div>
                </section>

                {/* ════════════════════════════════════
                    FOOTER
                ════════════════════════════════════ */}
                <footer className="bg-avaa-dark-mid text-avaa-muted">
                    <div className={`${C} py-14`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

                            {/* Brand */}
                            <div className="sm:col-span-2 lg:col-span-1">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <img
                                        src="/logos/AVAA_Logo.png"
                                        alt="AVAA"
                                        className="h-7 w-auto object-contain brightness-0 invert"
                                    />
                                    <span className="text-lg font-bold text-white tracking-wide">AVAA</span>
                                </div>
                                <p className="text-sm leading-relaxed max-w-xs">Your next career move starts here. Browse jobs, grow your network, and land your dream role.</p>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="text-sm font-bold text-white mb-5">Quick Links</h4>
                                <ul className="space-y-3 text-sm">
                                    {[['#how-it-works', 'How It Works'], ['#categories', 'Categories'], ['#jobs', 'Featured Jobs'], ['#testimonials', 'Testimonials']].map(([href, label]) => (
                                        <li key={href}><a href={href} className="hover:text-avaa-primary transition-colors">{label}</a></li>
                                    ))}
                                </ul>
                            </div>

                            {/* Resources */}
                            <div>
                                <h4 className="text-sm font-bold text-white mb-5">Resources</h4>
                                <ul className="space-y-3 text-sm">
                                    {['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map((item) => (
                                        <li key={item}><span className="opacity-40 cursor-default">{item}</span></li>
                                    ))}
                                </ul>
                            </div>

                            {/* Newsletter */}
                            <div>
                                <h4 className="text-sm font-bold text-white mb-5">Stay Updated</h4>
                                <p className="text-sm mb-4 leading-relaxed">Get the latest jobs delivered to your inbox.</p>
                                <div className="flex gap-2">
                                    <input type="email" placeholder="Your email"
                                        className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-white/10 border border-avaa-primary/20 text-sm text-white placeholder-avaa-muted/50 focus:outline-none focus:ring-2 focus:ring-avaa-primary focus:border-transparent" />
                                    <button className="flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-avaa-primary hover:bg-avaa-primary-hover transition-colors">→</button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-40">
                            <p>© 2026 AVAA. All rights reserved.</p>
                            <div className="flex items-center gap-5">
                                {['Privacy', 'Terms', 'Cookies'].map((item) => (
                                    <span key={item} className="cursor-default hover:opacity-70 transition-opacity">{item}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}