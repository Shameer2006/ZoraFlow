import Link from "next/link";
import { Zap, Github, Twitter, Linkedin } from "lucide-react";

const PRODUCT_LINKS = [
    { label: "Generate PRD", href: "/" },
    { label: "My PRDs",      href: "/dashboard" },
    { label: "Editor",       href: "/editor" },
];

const RESOURCE_LINKS = [
    { label: "About",   href: "/about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms",   href: "/terms" },
];

const SOCIAL_LINKS = [
    { label: "GitHub",   href: "https://github.com",   icon: Github   },
    { label: "Twitter",  href: "https://twitter.com",  icon: Twitter  },
    { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
];

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t" style={{ background: "var(--zf-dark)", borderColor: "rgba(59,130,246,0.15)" }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Main grid */}
                <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-4 lg:gap-16">

                    {/* Brand */}
                    <div className="col-span-2 space-y-5 md:col-span-1">
                        <Link href="/" className="group flex items-center gap-2.5">
                            <div
                                className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                                style={{ background: "var(--zf-gradient)" }}
                            >
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-extrabold text-white">ZoraFlow</span>
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed" style={{ color: "rgba(226,232,240,0.55)" }}>
                            AI-powered pipeline that transforms your product idea into a PRD, architecture diagrams, and Bill of Materials — in seconds.
                        </p>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-80"
                            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                        >
                            <Github className="h-3.5 w-3.5" />
                            Open Source
                        </a>
                    </div>

                    {/* Product */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(226,232,240,0.4)" }}>
                            Product
                        </h3>
                        <ul className="space-y-3">
                            {PRODUCT_LINKS.map(({ label, href }) => (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        className="text-sm transition-colors hover:text-white"
                                        style={{ color: "rgba(226,232,240,0.55)" }}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(226,232,240,0.4)" }}>
                            Resources
                        </h3>
                        <ul className="space-y-3">
                            {RESOURCE_LINKS.map(({ label, href }) => (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        className="text-sm transition-colors hover:text-white"
                                        style={{ color: "rgba(226,232,240,0.55)" }}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(226,232,240,0.4)" }}>
                            Legal
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { label: "Privacy Policy",   href: "/privacy" },
                                { label: "Terms of Service", href: "/terms" },
                            ].map(({ label, href }) => (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        className="text-sm transition-colors hover:text-white"
                                        style={{ color: "rgba(226,232,240,0.55)" }}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div
                    className="flex flex-col items-center justify-between gap-4 border-t py-6 sm:flex-row"
                    style={{ borderColor: "rgba(59,130,246,0.1)" }}
                >
                    <p className="text-sm" style={{ color: "rgba(226,232,240,0.35)" }}>
                        &copy; {year} ZoraFlow. All rights reserved.
                    </p>

                    <div className="flex items-center gap-1">
                        {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                                style={{ color: "rgba(226,232,240,0.4)" }}
                            >
                                <Icon className="h-4 w-4" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
