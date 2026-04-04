"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    Zap, LayoutDashboard, LogOut, ChevronRight,
    Menu, X, Info
} from "lucide-react";

interface NavbarProps {
    variant?: "light" | "transparent";
}

const NAV_LINKS = [
    { label: "My PRDs", href: "/dashboard", icon: LayoutDashboard },
    { label: "About",   href: "/about",     icon: Info },
];

export function Navbar({ variant = "light" }: NavbarProps) {
    const router   = useRouter();
    const pathname = usePathname();
    const menuRef  = useRef<HTMLDivElement>(null);

    const { user, logout, loading } = useAuth();

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mobileOpen,   setMobileOpen]   = useState(false);
    const [scrolled,     setScrolled]     = useState(false);

    // Scroll shadow
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close user dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSignOut = async () => {
        await logout();
        setUserMenuOpen(false);
        setMobileOpen(false);
        router.push("/");
    };

    const isLight = variant === "light";
    const navBg   = isLight
        ? scrolled ? "bg-white/95 shadow-sm shadow-blue-100/30" : "bg-white/90"
        : scrolled ? "bg-[#070B1A]/90 shadow-sm shadow-blue-900/20" : "bg-transparent";

    const textSecondary = isLight ? "text-slate-500" : "text-white/60";
    const hoverBg       = isLight ? "hover:bg-blue-50" : "hover:bg-white/10";
    const borderColor   = isLight ? "border-blue-100" : "border-white/10";
    const activeColor   = isLight ? "text-blue-600"   : "text-cyan-400";
    const avatarInitial = user?.email?.[0]?.toUpperCase() ?? "U";

    return (
        <>
            <header
                className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-all duration-300 ${navBg} ${borderColor}`}
            >
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* Logo */}
                    <Link href="/" className="group flex shrink-0 items-center gap-2.5">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                            style={{ background: "var(--zf-gradient)" }}
                        >
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span className={`text-lg font-extrabold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                            Zora<span className="zf-gradient-text">Flow</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden items-center gap-1 md:flex">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${hoverBg} ${pathname === link.href ? activeColor : textSecondary}`}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop actions */}
                    <div className="hidden items-center gap-3 md:flex">

                        {/* Credits badge */}
                        {user && !user.loading && (
                            <div
                                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
                                style={{
                                    background:   "rgba(59,130,246,0.08)",
                                    borderColor:  "rgba(59,130,246,0.2)",
                                    color: "#2563EB",
                                }}
                            >
                                <Zap className="h-3 w-3" />
                                {user.credits ?? 0} credits
                            </div>
                        )}

                        {!loading && (
                            user ? (
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setUserMenuOpen(v => !v)}
                                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                                        style={{ background: "var(--zf-gradient)" }}
                                        aria-label="User menu"
                                    >
                                        {avatarInitial}
                                    </button>

                                    {userMenuOpen && (
                                        <div
                                            className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border shadow-xl"
                                            style={{ background: "#fff", borderColor: "var(--zf-border)" }}
                                        >
                                            <div className="border-b px-4 py-3" style={{ borderColor: "var(--zf-border)" }}>
                                                <p className="truncate text-xs font-semibold text-slate-800">{user.email}</p>
                                                <p className="mt-0.5 text-xs text-blue-600 font-medium">{user.credits ?? 0} credits available</p>
                                            </div>
                                            <div className="py-1">
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    <LayoutDashboard className="h-4 w-4" />
                                                    My PRDs
                                                </Link>
                                            </div>
                                            <div className="border-t py-1" style={{ borderColor: "var(--zf-border)" }}>
                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/auth"
                                        className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${hoverBg} ${textSecondary}`}
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/auth"
                                        className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:opacity-90 active:scale-95"
                                        style={{ background: "var(--zf-gradient)" }}
                                    >
                                        Get Started
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            )
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className={`flex h-9 w-9 items-center justify-center rounded-xl md:hidden ${hoverBg} ${textSecondary}`}
                        onClick={() => setMobileOpen(v => !v)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div
                        className={`border-t md:hidden ${isLight ? "bg-white" : "bg-[#070B1A]"}`}
                        style={{ borderColor: isLight ? "var(--zf-border)" : "rgba(59,130,246,0.15)" }}
                    >
                        <div className="space-y-1 px-4 py-3">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${hoverBg} ${textSecondary}`}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div
                            className="border-t px-4 pb-4 pt-3"
                            style={{ borderColor: isLight ? "var(--zf-border)" : "rgba(59,130,246,0.1)" }}
                        >
                            {user ? (
                                <div className="space-y-2">
                                    <div
                                        className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                                        style={{ borderColor: "var(--zf-border)", background: "rgba(59,130,246,0.04)" }}
                                    >
                                        <div
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                            style={{ background: "var(--zf-gradient)" }}
                                        >
                                            {avatarInitial}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`truncate text-sm font-medium ${isLight ? "text-slate-800" : "text-white"}`}>
                                                {user.email}
                                            </p>
                                            <p className="text-xs font-semibold text-blue-600">{user.credits ?? 0} credits</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => { router.push("/dashboard"); setMobileOpen(false); }}
                                            className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50"
                                            style={{ borderColor: "var(--zf-border)" }}
                                        >
                                            <LayoutDashboard className="h-4 w-4" />
                                            My PRDs
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                                            style={{ borderColor: "#FECACA" }}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href="/auth"
                                        onClick={() => setMobileOpen(false)}
                                        className="rounded-xl border py-2.5 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50"
                                        style={{ borderColor: "var(--zf-border)" }}
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/auth"
                                        onClick={() => setMobileOpen(false)}
                                        className="rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-all hover:opacity-90"
                                        style={{ background: "var(--zf-gradient)" }}
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}
