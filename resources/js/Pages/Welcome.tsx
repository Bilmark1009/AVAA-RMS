import { Head, Link } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const SERVICES = [
    {
        category: "Web & Application Development",
        items: [
            { title: "Web Development", desc: "Comprehensive web solutions tailored to business objectives, ensuring high availability and robust performance." },
            { title: "Frontend Development", desc: "Crafting responsive, intuitive, and high-speed interfaces using modern frameworks to ensure a seamless client-side experience." },
            { title: "Backend Development", desc: "Building the \"engine room\" of your application—focusing on secure server-side logic, database management, and API integrations." },
            { title: "Full-Stack Development", desc: "End-to-end development handling both the visual interface and the underlying architecture for a cohesive, turnkey digital product." },
            { title: "Mobile Application Development", desc: "Creating powerful iOS and Android applications that provide a native experience and extend your platform's reach to mobile users." },
        ],
    },
    {
        category: "Design & User Experience",
        items: [
            { title: "UI/UX Design", desc: "We go beyond aesthetics. Our design process focuses on user behavior, creating wireframes and interfaces that simplify complex workflows and enhance user retention." },
        ],
    },
    {
        category: "Business Systems & Automation",
        items: [
            { title: "CRM Development", desc: "Customizing and implementing Customer Relationship Management systems that centralize client data and streamline communication." },
            { title: "Automation Specialist", desc: "Identifying repetitive manual tasks and replacing them with \"Autopilot\" workflows, reducing human error and increasing organizational throughput." },
        ],
    },
    {
        category: "Digital Marketing & Social Media",
        items: [
            { title: "Digital Marketing", desc: "Strategic, multi-channel campaigns focused on ROI, lead generation, and brand positioning within the IT and tech sectors." },
            { title: "Social Media Specialist", desc: "Managing and optimizing your social footprint to engage with industry stakeholders and build a community around your brand." },
        ],
    },
    {
        category: "Support Services",
        items: [
            { title: "IT Support", desc: "Proactive technical assistance and maintenance to resolve hardware, software, and network issues, minimizing downtime and ensuring business continuity." },
        ],
    },
];

const WHY_CHOOSE = [
    {
        title: "A Unified Source of Truth",
        desc: "Stop juggling multiple platforms. AVAA centralizes talent profiles, technical backgrounds, and project history into one structured environment.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
        ),
    },
    {
        title: "Precision Filtering",
        desc: "Our advanced engine allows you to move beyond basic keywords. Filter by specific project experience, technology stacks, and niche expertise with absolute accuracy.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
        ),
    },
    {
        title: "Data-Driven Confidence",
        desc: "We replace \"gut feel\" with a transparent, data-backed evaluation process, ensuring that every hire or resource allocation is supported by verified information.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
        ),
    },
    {
        title: "Architected for Scale",
        desc: "Built on a foundation of robust system architecture, our platform grows with your organization, adapting to shifting project requirements without losing performance.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
            </svg>
        ),
    },
];

const HOW_IT_WORKS = [
    {
        step: "01",
        title: "Centralize Talent Profiles",
        desc: "Import or aggregate detailed IT professional profiles into the AVAA ecosystem. Our structure ensures that technical skills, previous project roles, and experience levels are captured in a standardized format.",
    },
    {
        step: "02",
        title: "Apply Advanced Criteria",
        desc: "Utilize our advanced filtering engine to narrow down the field. Define your specific requirements—from specific coding languages to industry-specific project backgrounds—to find the perfect match.",
    },
    {
        step: "03",
        title: "Evaluate & Compare",
        desc: "Review structured talent data side-by-side. Our transparent interface allows you to evaluate candidates based on objective metrics and detailed history, minimizing the time spent on manual screening.",
    },
    {
        step: "04",
        title: "Select with Confidence",
        desc: "Execute your selection within a single system. By removing fragmented workflows, AVAA allows you to finalize your IT workforce decisions quickly, efficiently, and with total clarity.",
    },
];

const FAQS = [
    {
        q: "What makes AVAA different from traditional recruitment agencies or job boards?",
        a: "AVAA is not just a job board; we are a dedicated employer-side resource management platform. While traditional methods often involve fragmented workflows and manual searching, our mission is to consolidate detailed IT talent profiles into a single, structured system. We provide an advanced, criteria-based filtering engine that allows you to identify professionals based on specific technical skills and project backgrounds, ensuring your selection process is efficient, transparent, and data-driven.",
    },
    {
        q: "What types of IT professionals and services can I access through AVAA?",
        a: "We cover the full spectrum of the digital ecosystem. Whether you need to build a product from scratch or market an existing one, AVAA connects you with talent across Web & Mobile Development, UI/UX Design, Business Systems & CRM, Automation Specialists, Digital Marketing, and IT Support professionals.",
    },
    {
        q: "How does AVAA help reduce the time spent on screening candidates?",
        a: "Our vision is to make the identification of IT talent streamlined and transparent. We achieve this by minimizing manual searching through our centralized architecture. Instead of sifting through vague resumes, our platform presents comprehensive profiles that detail technical skills and project experience, significantly reducing human error and hiring time.",
    },
    {
        q: "Can AVAA help optimize our internal business operations, not just our software development?",
        a: "Absolutely. Beyond standard software development, we specialize in Business Systems & Automation. We can connect you with Automation Specialists who identify repetitive manual tasks and replace them with \"Autopilot\" workflows. Additionally, we offer talent experienced in custom CRM development to help you centralize client data and streamline your internal communication.",
    },
    {
        q: "Is AVAA suitable for finding talent for complex, scalable projects?",
        a: "Yes. Our platform is built on the vision of supporting scalable technology that adapts to evolving requirements. Whether you need a Full-Stack Developer for a cohesive turnkey product, or a Backend Developer to build a secure \"engine room\" for a high-availability application, our detailed profiling ensures you find professionals capable of handling robust, enterprise-level architectures.",
    },
];

const C = "w-full px-6 sm:px-8 lg:px-10 xl:px-12 2xl:px-16";

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function Welcome() {
    const [heroVisible, setHeroVisible] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
    const sectionsRef = useRef<HTMLDivElement>(null);

    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    useEffect(() => {
        if (showPrivacy || showTerms) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [showPrivacy, showTerms]);

    useEffect(() => {
        const t = setTimeout(() => setHeroVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const handler = () => {
            if (window.innerWidth >= 768) setMobileMenuOpen(false);
        };
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    useEffect(() => {
        const container = sectionsRef.current;
        if (!container) return;
        const sections = container.querySelectorAll(".section-enter");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        (entry.target as HTMLElement).style.opacity = "1";
                        (entry.target as HTMLElement).style.transform = "translateY(0)";
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
        );
        sections.forEach((s) => {
            (s as HTMLElement).style.opacity = "0";
            (s as HTMLElement).style.transform = "translateY(32px)";
            (s as HTMLElement).style.transition = "opacity 0.6s ease, transform 0.6s ease";
            observer.observe(s);
        });
        return () => observer.disconnect();
    }, []);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Message sent! We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    const NAV_LINKS = [
        ["#home", "Home"],
        ["#about", "About Us"],
        ["#how-it-works", "How It Works"],
        ["#services", "Services"],
        ["#faq", "FAQ"],

    ];

    return (
        <>
            <Head title="AVAA | Autopilot Virtual Agency Assistant" />

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
                .faq-body { max-height: 0; overflow: hidden; transition: max-height 0.4s ease, padding 0.3s ease; }
                .faq-body.open { max-height: 500px; }
            `}</style>

            {/* ════════ NAVBAR ════════ */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
                <div className={`${C} flex items-center justify-between h-16`}>
                    {/* Logo */}
                    <a href="#home" className="flex items-center gap-2.5 flex-shrink-0">
                        <img src="/logos/AVAA_Logo.png" alt="AVAA" className="h-8 w-auto object-contain" />
                        <span className="text-3xl font-extrabold text-avaa-dark tracking-tighter uppercase">AVAA</span>
                    </a>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-7 lg:gap-9 text-sm font-medium text-avaa-muted">
                        {NAV_LINKS.map(([href, label]) => (
                            <a key={href} href={href} className="hover:text-avaa-dark transition-colors">{label}</a>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href={route("login")} className="px-4 py-2 text-sm font-semibold text-avaa-dark hover:bg-avaa-primary-light rounded-lg transition-colors">
                            Sign In
                        </Link>
                        <Link href={route("register")} className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg bg-avaa-primary hover:bg-avaa-primary-hover transition-all hover:shadow-lg">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile controls */}
                    <div className="flex md:hidden items-center gap-1">
                        <Link href={route("login")} className="px-3 py-1.5 text-sm font-semibold text-avaa-dark">Sign In</Link>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-avaa-primary-light transition-colors"
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-avaa-dark">
                                {mobileMenuOpen ? (
                                    <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                                ) : (
                                    <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 px-6 pb-5 pt-3 flex flex-col gap-1">
                        {NAV_LINKS.map(([href, label]) => (
                            <a key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2.5 text-sm font-medium text-avaa-muted hover:text-avaa-dark hover:bg-avaa-primary-light rounded-lg transition-colors">
                                {label}
                            </a>
                        ))}
                        <Link href={route("register")} onClick={() => setMobileMenuOpen(false)}
                            className="mt-3 block px-4 py-3 text-sm font-semibold text-white text-center rounded-lg bg-avaa-primary hover:bg-avaa-primary-hover transition-colors">
                            Get Started Free
                        </Link>
                    </div>
                )}
            </nav>

            {/* Body */}
            <div ref={sectionsRef} className="min-h-screen bg-white overflow-x-hidden pt-16">

                {/* ════════ HERO ════════ */}
                <section id="home" className="relative bg-gradient-to-br from-avaa-primary-light via-white to-avaa-primary-light overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 sm:w-[420px] h-64 sm:h-[420px] opacity-30 pointer-events-none"
                        style={{ backgroundImage: "radial-gradient(circle, #7EB0AB 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
                    <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10 pointer-events-none"
                        style={{ backgroundImage: "radial-gradient(circle, #122431 1.5px, transparent 1.5px)", backgroundSize: "20px 20px" }} />

                    <div className={`${C} py-16 sm:py-24 md:py-32`}>
                        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
                            {/* Left */}
                            <div className={`transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-avaa-primary/10 text-avaa-teal text-xs font-semibold mb-6">
                                    <span className="w-2 h-2 rounded-full bg-avaa-primary animate-pulse" />
                                    Autopilot Virtual Agency Assistant
                                </div>

                                <h1 className="text-[44px] sm:text-[60px] lg:text-[68px] xl:text-[76px] font-extrabold text-avaa-dark leading-[1.05] tracking-tight mb-5">
                                    Find the Right
                                    <br />
                                    <span className="text-avaa-primary">People.</span>
                                </h1>

                                <p className="text-base sm:text-lg text-avaa-text mb-4 max-w-lg leading-relaxed">
                                    An employer-side resource management platform for finding the right people to work with.
                                </p>
                                <p className="text-sm text-avaa-muted mb-9 max-w-lg leading-relaxed">
                                    AVAA helps clients and employers browse, evaluate, and select talent through complete profiles, seamless filtering, and a clean, centralized platform.
                                </p>

                                <div className="flex flex-wrap gap-3 mb-10">
                                    <Link href={route("register")}
                                        className="px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-avaa-primary hover:bg-avaa-primary-hover transition-all hover:shadow-lg">
                                        Get Started Free
                                    </Link>
                                    <a href="#how-it-works"
                                        className="px-7 py-3.5 rounded-xl text-sm font-semibold text-avaa-dark border border-gray-300 hover:border-avaa-primary hover:bg-avaa-primary-light transition-all">
                                        How It Works
                                    </a>
                                </div>

                                <div className="flex items-center gap-6 sm:gap-10 flex-wrap">
                                    {[["500+", "IT Professionals"], ["50+", "Tech Stacks"], ["100%", "Employer-Side"]].map(([num, label], i) => (
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
                            <div className={`relative hidden md:flex justify-center lg:justify-end transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                                <div className="relative w-full max-w-[500px] xl:max-w-[540px]">
                                    <div className="bg-white rounded-3xl shadow-2xl shadow-avaa-dark/10 p-7 lg:p-9 border border-gray-200">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-12 h-12 rounded-full bg-avaa-dark flex items-center justify-center text-white font-bold text-sm flex-shrink-0">IT</div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-avaa-dark text-sm truncate">Senior Full-Stack Developer</p>
                                                <p className="text-xs text-avaa-muted">Available · Remote</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {["React", "Node.js", "TypeScript", "AWS"].map((tag) => (
                                                <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-avaa-primary/10 text-avaa-teal">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-avaa-text">5+ yrs experience</span>
                                            <span className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-avaa-primary">View Profile</span>
                                        </div>
                                    </div>

                                    <div className="absolute -top-5 -left-6 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-200 float-1">
                                        <div className="w-9 h-9 rounded-full bg-avaa-primary-light flex items-center justify-center flex-shrink-0">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-avaa-teal">
                                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-avaa-dark">Precision</p>
                                            <p className="text-xs font-bold text-avaa-primary">Filtering</p>
                                        </div>
                                    </div>

                                    <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-200 float-2">
                                        <div className="w-9 h-9 rounded-full bg-avaa-primary-light flex items-center justify-center flex-shrink-0">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-avaa-teal">
                                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-avaa-dark">Centralized</p>
                                            <p className="text-[11px] text-avaa-muted">talent platform</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════ ABOUT US ════════ */}
                <section id="about" className="py-20 sm:py-28 bg-white section-enter">
                    <div className={C}>
                        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                            {/* Left */}
                            <div>
                                <span className="inline-block px-4 py-1.5 rounded-full bg-avaa-primary-light text-avaa-teal text-xs font-semibold mb-4 uppercase tracking-wider">About Us</span>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-avaa-dark tracking-tight mb-6 leading-tight">
                                    Precision in IT Resourcing.
                                    <br />
                                    <span className="text-avaa-primary">Confidence in Selection.</span>
                                </h2>
                                <p className="text-sm sm:text-base text-avaa-text leading-relaxed mb-5">
                                    The IT landscape is evolving rapidly, but the process of identifying and selecting the right talent often remains fragmented and manual. At AVAA (Autopilot Virtual Agency Assistant), we are redefining how employers navigate the IT workforce.
                                </p>
                                <p className="text-sm sm:text-base text-avaa-text leading-relaxed">
                                    We are not just a database; we are an Employer-Side Resource Management Platform. We bridge the gap between complex project requirements and qualified professionals by replacing guesswork with data, and scattered searches with a centralized, intelligent system.
                                </p>
                            </div>
                            {/* Right — Mission / Vision */}
                            <div className="space-y-5">
                                <div className="bg-avaa-primary-light rounded-2xl p-7 border border-avaa-primary/20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-xl bg-avaa-primary flex items-center justify-center text-white">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                            </svg>
                                        </div>
                                        <h3 className="font-bold text-avaa-dark text-base">Our Mission</h3>
                                    </div>
                                    <p className="text-sm text-avaa-text leading-relaxed">
                                        AVAA’s mission is to enable clients and employers in the IT industry to accurately identify and select qualified IT professionals through a centralized, structured, and reliable employer side resource management platform.

By consolidating detailed IT talent profiles including technical skills, experience, and project background along with streamlined navigation and an advanced criteria based filtering engine, AVAA minimizes fragmented workflows and manual searching, supporting informed, efficient, and confident IT workforce selection within a single system.

                                    </p>
                                </div>
                                <div className="bg-avaa-dark rounded-2xl p-7 border border-avaa-primary/20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-xl bg-avaa-primary flex items-center justify-center text-white">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        </div>
                                        <h3 className="font-bold text-white text-base">Our Vision</h3>
                                    </div>
                                    <p className="text-sm text-avaa-muted leading-relaxed">
                                        AVAA envisions becoming a leading employer side resource management platform for the IT industry, trusted by organizations as the standard system for discovering, evaluating, and selecting IT professionals.

	We aim to shape a future where identifying people to work with in the IT field is streamlined, transparent, and data driven, supported by well designed system architecture, accurate talent information, and scalable technology that adapts to evolving workforce and project requirements.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════ WHY CHOOSE US ════════ */}
                <section className="py-20 sm:py-28 bg-avaa-primary-light section-enter">
                    <div className={C}>
                        <div className="text-center mb-14">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-avaa-primary/15 text-avaa-teal text-xs font-semibold mb-4 uppercase tracking-wider">Why Choose Us</span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-avaa-dark tracking-tight mb-4">
                                Eliminate the Noise.
                                <br className="hidden sm:block" />
                                <span className="text-avaa-primary"> Elevate the Selection.</span>
                            </h2>
                            <p className="text-sm sm:text-base text-avaa-text max-w-2xl mx-auto">
                                In a market saturated with fragmented data and manual workflows, AVAA provides the precision required by the modern IT industry.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {WHY_CHOOSE.map((item) => (
                                <div key={item.title} className="bg-white rounded-2xl border border-gray-200 p-7 hover:shadow-lg hover:border-avaa-primary/40 transition-all duration-300 group hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-2xl bg-avaa-primary-light flex items-center justify-center mb-5 text-avaa-teal group-hover:bg-avaa-primary/20 transition-colors">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-bold text-avaa-dark text-sm mb-2 group-hover:text-avaa-primary transition-colors">{item.title}</h3>
                                    <p className="text-xs text-avaa-text leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════ HOW IT WORKS ════════ */}
                <section id="how-it-works" className="py-20 sm:py-28 bg-white section-enter">
                    <div className={C}>
                        <div className="text-center mb-14">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-avaa-primary-light text-avaa-teal text-xs font-semibold mb-4 uppercase tracking-wider">How It Works</span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-avaa-dark tracking-tight mb-4">
                                Four Steps to a Streamlined
                                <br className="hidden sm:block" />
                                <span className="text-avaa-primary"> IT Workforce</span>
                            </h2>
                            <p className="text-sm sm:text-base text-avaa-text max-w-xl mx-auto">
                                AVAA transforms the complex task of resource management into a logical, four-step workflow.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                            {HOW_IT_WORKS.map((item) => (
                                <div key={item.step} className="relative bg-white rounded-2xl border border-gray-200 p-8 text-center hover:shadow-md hover:border-avaa-primary/40 transition-all duration-300 group">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-avaa-primary text-white text-xs font-bold flex items-center justify-center shadow-sm">
                                        {item.step}
                                    </div>
                                    <h3 className="text-base font-bold text-avaa-dark mb-3 mt-3 group-hover:text-avaa-primary transition-colors">{item.title}</h3>
                                    <p className="text-sm text-avaa-text leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>



                {/* ════════ SERVICES ════════ */}
                <section id="services" className="py-20 sm:py-28 bg-white section-enter">
                    <div className={C}>
                        {/* Header */}
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-avaa-primary-light text-avaa-teal text-xs font-semibold mb-4 uppercase tracking-wider">Our Services</span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-avaa-dark tracking-tight mb-4">
                                Full-Spectrum IT Talent
                            </h2>
                            <p className="text-sm sm:text-base text-avaa-text max-w-xl mx-auto">
                                Access professionals across every layer of the digital ecosystem.
                            </p>
                        </div>

                        {/* Flat service card grid — icon centered, title, desc, Read More */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "Web Development",
                                    desc: "Comprehensive web solutions tailored to business objectives, ensuring high availability and robust performance.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                                        </svg>
                                    ),
                                },
                                {
                                    title: "Frontend Development",
                                    desc: "Crafting responsive, intuitive, and high-speed interfaces using modern frameworks for a seamless client-side experience.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                                        </svg>
                                    ),
                                },
                                {
                                    title: "Backend Development",
                                    desc: "Building the engine room of your application—secure server-side logic, database management, and API integrations.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                                        </svg>
                                    ),
                                },
                                {
                                    title: "Full-Stack Development",
                                    desc: "End-to-end development handling both the visual interface and underlying architecture for a cohesive digital product.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="2" width="9" height="9"/><rect x="13" y="2" width="9" height="9"/><rect x="13" y="13" width="9" height="9"/><rect x="2" y="13" width="9" height="9"/>
                                        </svg>
                                    ),
                                },
                                {
                                    title: "Mobile App Development",
                                    desc: "Creating powerful iOS and Android applications that provide a native experience and extend your platform's reach.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                                        </svg>
                                    ),
                                },
                                {
                                    title: "UI/UX Design",
                                    desc: "Beyond aesthetics—our design process focuses on user behavior, creating interfaces that simplify workflows and enhance retention.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/>
                                        </svg>
                                    ),
                                },
                                {
                                    title: "CRM Development",
                                    desc: "Customizing and implementing CRM systems that centralize client data and streamline internal communication workflows.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                                        </svg>
                                    ),
                                },
                                {
                                    title: "Automation Specialist",
                                    desc: "Identifying repetitive manual tasks and replacing them with Autopilot workflows, reducing human error and increasing throughput.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1.27c.34-.6.99-1 1.73-1a2 2 0 110 4c-.74 0-1.39-.4-1.73-1H20a7 7 0 01-7 7v1.27c.6.34 1 .99 1 1.73a2 2 0 11-4 0c0-.74.4-1.39 1-1.73V20a7 7 0 01-7-7H2.73c-.34.6-.99 1-1.73 1a2 2 0 110-4c.74 0 1.39.4 1.73 1H4a7 7 0 017-7V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z"/>
                                        </svg>
                                    ),
                                },
                                {
                                    title: "Digital Marketing",
                                    desc: "Strategic, multi-channel campaigns focused on ROI, lead generation, and brand positioning within the IT and tech sectors.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                        </svg>
                                    ),
                                },
                                {
                                    title: "Social Media Specialist",
                                    desc: "Managing and optimizing your social footprint to engage with industry stakeholders and build a community around your brand.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                                        </svg>
                                    ),
                                },
                                {
                                    title: "IT Support",
                                    desc: "Proactive technical assistance and maintenance to resolve hardware, software, and network issues, ensuring business continuity.",
                                    icon: (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                                        </svg>
                                    ),
                                },
                            ].map((svc) => (
                                <div key={svc.title}
                                    className="group bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center hover:border-avaa-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">

                                    {/* Icon container */}
                                    <div className="w-20 h-20 rounded-2xl bg-avaa-primary-light flex items-center justify-center mb-6 text-avaa-teal group-hover:bg-avaa-primary group-hover:text-white transition-all duration-300 group-hover:scale-105">
                                        {svc.icon}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-base font-extrabold text-avaa-dark mb-3 group-hover:text-avaa-primary transition-colors leading-snug">
                                        {svc.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-avaa-text leading-relaxed flex-1">
                                        {svc.desc}
                                    </p>


                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════ FAQ ════════ */}
                <section id="faq" className="py-20 sm:py-28 bg-white section-enter">
                    <div className={C}>
                        <div className="text-center mb-14">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-avaa-primary-light text-avaa-teal text-xs font-semibold mb-4 uppercase tracking-wider">FAQ</span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-avaa-dark tracking-tight mb-4">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-sm sm:text-base text-avaa-text max-w-xl mx-auto">
                                Everything you need to know about AVAA.
                            </p>
                        </div>
                        <div className="max-w-3xl mx-auto space-y-3">
                            {FAQS.map((faq, i) => (
                                <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden hover:border-avaa-primary/40 transition-colors">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between px-6 py-5 text-left"
                                    >
                                        <span className="text-sm font-bold text-avaa-dark pr-4">{faq.q}</span>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                            className={`flex-shrink-0 text-avaa-primary transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>
                                    <div className={`faq-body ${openFaq === i ? "open" : ""}`}>
                                        <p className="px-6 pb-5 text-sm text-avaa-text leading-relaxed">{faq.a}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>



                {/* ════════ BOTTOM CTA ════════ */}
                <section className="relative overflow-hidden bg-avaa-dark section-enter">
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ backgroundImage: "radial-gradient(circle, #7EB0AB 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                    <div className={`${C} py-20 sm:py-28 relative z-10 text-center`}>
                        <p className="text-sm font-semibold text-avaa-primary mb-3 uppercase tracking-wider">Ready to Find the Right People?</p>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-9">
                            Register Here Now <span className="inline-block ml-2">→</span>
                        </h2>
                        <Link href={route("register")} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold bg-avaa-primary text-white hover:bg-avaa-primary-hover hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                            Get Started for Free
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                        </Link>
                    </div>
                </section>

                {/* ════════ FOOTER ════════ */}
                <footer className="bg-avaa-dark-mid text-avaa-muted">
                    <div className={`${C} py-14`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                            {/* Col 1 — Brand */}
                            <div className="lg:col-span-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <img src="/logos/AVAA_Logo.png" alt="AVAA" className="h-7 w-auto object-contain" />
                                    <span className="text-xl font-extrabold text-white tracking-tighter uppercase">AVAA</span>
                                </div>
                                <p className="text-xs font-semibold text-avaa-primary mb-3">Precision in IT Resourcing.</p>
                                <p className="text-xs text-avaa-muted leading-relaxed">
                                    We are an Employer-Side Resource Management Platform redefining how you navigate the IT workforce. We replace guesswork with data and scattered searches with a centralized, intelligent system.
                                </p>
                            </div>

                            {/* Col 2 — Explore */}
                            <div>
                                <h4 className="text-sm font-bold text-white mb-5">Explore</h4>
                                <ul className="space-y-3 text-sm">
                                    {[
                                        ["#home", "Home"],
                                        ["#about", "About Us"],
                                        ["#why-choose", "Why Choose Us"],
                                        ["#how-it-works", "How It Works"],
                                        ["#faq", "FAQ"],
                                    ].map(([href, label]) => (
                                        <li key={href}>
                                            <a href={href} className="hover:text-avaa-primary transition-colors block text-xs">{label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Col 3 — Services */}
                            <div>
                                <h4 className="text-sm font-bold text-white mb-5">Our Services</h4>
                                <ul className="space-y-3 text-xs">
                                    {["Web & App Development", "UI/UX Design", "Business Systems & CRM", "Automation Specialists", "Digital Marketing", "IT Support Services"].map((s) => (
                                        <li key={s}><a href="#services" className="hover:text-avaa-primary transition-colors block">{s}</a></li>
                                    ))}
                                </ul>
                            </div>

                            {/* Col 4 — Contact */}
                            <div>
                                <h4 className="text-sm font-bold text-white mb-5">Contact</h4>
                                <ul className="space-y-4 text-xs">
                                    <li className="flex items-start gap-3">
                                        <svg className="w-4 h-4 mt-0.5 text-avaa-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                                        </svg>
                                        <span className="leading-relaxed opacity-80">High Street Corporate Plaza, 26th Street, Bonifacio Global City, Taguig, 1634 Metro Manila, Philippines</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-avaa-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                                        </svg>
                                        <span className="opacity-80">+63 (02) 9123 4567</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-avaa-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                        <span className="opacity-80">services@avaa.com.ph</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-60">
                            <p>© 2026 AVAA. All rights reserved.</p>
                            <div className="flex items-center gap-5">
                                <button onClick={() => setShowPrivacy(true)} className="hover:text-avaa-primary transition-colors">Privacy Policy</button>
                                <button onClick={() => setShowTerms(true)} className="hover:text-avaa-primary transition-colors">Terms of Service</button>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* ════════ PRIVACY POLICY MODAL ════════ */}
            {showPrivacy && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-avaa-dark/60 backdrop-blur-sm" onClick={() => setShowPrivacy(false)} />
                    <div className="relative bg-white w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-extrabold text-avaa-dark">Privacy Policy</h3>
                            <button onClick={() => setShowPrivacy(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-sm text-avaa-text leading-relaxed">
                            <section className="space-y-4">
                                <p className="font-bold text-avaa-dark">Last Updated: March 12, 2026</p>
                                <p>Welcome to AVAA. We value your privacy and the security of your data.</p>
                                <h4 className="font-bold text-avaa-dark text-base pt-2">1. Information We Collect</h4>
                                <p>We collect information you provide directly to us when you create an account, such as your name, email address, resume details, and professional history to facilitate job matching.</p>
                                <h4 className="font-bold text-avaa-dark text-base pt-2">2. How We Use Your Data</h4>
                                <p>Your data is used to provide our recruitment services, including our AI Smart Matching system. We do not sell your personal data to third parties for marketing purposes.</p>
                                <h4 className="font-bold text-avaa-dark text-base pt-2">3. Data Security</h4>
                                <p>We implement industry-standard encryption and security measures to protect your information from unauthorized access or disclosure.</p>
                                <h4 className="font-bold text-avaa-dark text-base pt-2">4. Your Rights</h4>
                                <p>You have the right to access, correct, or delete your personal information at any time through your account settings or by contacting our support team.</p>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════ TERMS OF SERVICE MODAL ════════ */}
            {showTerms && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-avaa-dark/60 backdrop-blur-sm" onClick={() => setShowTerms(false)} />
                    <div className="relative bg-white w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-extrabold text-avaa-dark">Terms of Service</h3>
                            <button onClick={() => setShowTerms(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-sm text-avaa-text leading-relaxed">
                            <section className="space-y-4">
                                <p className="font-bold text-avaa-dark">Effective Date: March 17, 2026</p>
                                <h4 className="font-bold text-avaa-dark text-base pt-2">1. Acceptance of Terms</h4>
                                <p>By accessing AVAA, you agree to comply with these terms. If you do not agree, please refrain from using our recruitment services.</p>
                                <h4 className="font-bold text-avaa-dark text-base pt-2">2. User Responsibilities</h4>
                                <p>You agree to provide accurate information in your professional profile and resume. Impersonation or providing false credentials may lead to account termination.</p>
                                <h4 className="font-bold text-avaa-dark text-base pt-2">3. Platform Usage</h4>
                                <p>Our AI-driven job matching is designed to assist your career search. Users must not attempt to scrape data or disrupt platform security.</p>
                                <h4 className="font-bold text-avaa-dark text-base pt-2">4. Limitation of Liability</h4>
                                <p>AVAA facilitates connections between candidates and employers but does not guarantee employment or the accuracy of third-party job listings.</p>
                                <h4 className="font-bold text-avaa-dark text-base pt-2">5. Termination</h4>
                                <p>We reserve the right to suspend accounts that violate our community guidelines or engage in fraudulent recruitment activity.</p>
                            </section>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setShowTerms(false)} className="px-6 py-2.5 bg-avaa-primary text-white font-bold rounded-xl hover:bg-avaa-primary-hover transition-colors">
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}