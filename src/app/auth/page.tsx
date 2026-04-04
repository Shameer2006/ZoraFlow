"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Loader2, Mail, Lock, AlertCircle, ArrowRight,
    CheckCircle2, Sparkles, Zap
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const PERKS = [
    "5 free PRD generations on sign-up",
    "Gemini AI-powered architecture",
    "Architecture diagrams + Smart BOM",
    "Session history — resume any time",
];

const GOOGLE_ICON = (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

function AuthInner() {
    const router              = useRouter();
    const searchParams        = useSearchParams();
    const { user, login, register, loginWithGoogle, loading } = useAuth();

    const [isLogin,       setIsLogin]       = useState(true);
    const [email,         setEmail]         = useState("");
    const [password,      setPassword]      = useState("");
    const [error,         setError]         = useState("");
    const [submitting,    setSubmitting]    = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // If already logged in, redirect home
    useEffect(() => {
        if (!loading && user) router.push("/");
    }, [user, loading, router]);

    // Show error from OAuth redirect (e.g. ?error=...)
    useEffect(() => {
        const urlError = searchParams.get("error");
        if (urlError) setError(decodeURIComponent(urlError));
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            if (isLogin) {
                await login(email, password);
                router.push("/");
            } else {
                await register(email, password);
                setError("Account created! Please check your email to verify, then sign in.");
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogle = async () => {
        setError("");
        setGoogleLoading(true);
        try {
            await loginWithGoogle();
            // redirect happens automatically via Supabase OAuth
        } catch (err: any) {
            setError(err.message || "Failed to sign in with Google.");
            setGoogleLoading(false);
        }
    };

    const isVerifyMsg = error.toLowerCase().includes("verify") || error.toLowerCase().includes("created");

    return (
        <div className="flex min-h-screen">

            {/* ── Left panel — dark branding ──────────────────────────────── */}
            <div
                className="relative hidden flex-col overflow-hidden lg:flex lg:w-[45%] xl:w-[40%]"
                style={{ background: "var(--zf-dark, #070B1A)" }}
            >
                {/* Glow decorations */}
                <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 -translate-y-1/3 translate-x-1/3 rounded-full opacity-40 blur-3xl"
                     style={{ background: "radial-gradient(circle, #3B82F6, transparent 70%)" }} />
                <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full opacity-25 blur-3xl"
                     style={{ background: "radial-gradient(circle, #06B6D4, transparent 70%)" }} />

                <div className="relative z-10 flex h-full flex-col p-10 xl:p-12">

                    {/* Logo */}
                    <Link href="/" className="mb-auto flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                             style={{ background: "var(--zf-gradient)" }}>
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-extrabold text-white">ZoraFlow</span>
                    </Link>

                    {/* Content */}
                    <div className="my-auto space-y-8">
                        <div className="space-y-3">
                            <div
                                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                                style={{ background: "rgba(59,130,246,0.15)", borderColor: "rgba(59,130,246,0.3)", color: "#93C5FD" }}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                Natural Language to Technical Reality
                            </div>
                            <h2 className="text-3xl font-extrabold leading-tight text-white xl:text-4xl">
                                From idea to full<br />
                                <span className="zf-gradient-text">technical spec</span> — instantly.
                            </h2>
                            <p className="leading-relaxed" style={{ color: "rgba(226,232,240,0.55)" }}>
                                Join builders, students, and founders who skip the blank page and go straight to shipping.
                            </p>
                        </div>

                        {/* Perks */}
                        <ul className="space-y-3">
                            {PERKS.map((perk, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div
                                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                                        style={{ background: "rgba(59,130,246,0.2)" }}
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#60A5FA" }} />
                                    </div>
                                    <span className="text-sm" style={{ color: "rgba(226,232,240,0.7)" }}>{perk}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Testimonial */}
                        <div
                            className="rounded-2xl p-5"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                            <p className="mb-4 text-sm italic leading-relaxed" style={{ color: "rgba(226,232,240,0.65)" }}>
                                &ldquo;ZoraFlow generated a complete PRD for my IoT project in 8 seconds. What would have taken me a day took 8 seconds.&rdquo;
                            </p>
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                                    style={{ background: "var(--zf-gradient)" }}
                                >
                                    SK
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-white">Suresh K.</p>
                                    <p className="text-xs" style={{ color: "rgba(226,232,240,0.4)" }}>IoT Engineer, Bangalore</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="mt-auto pt-8 text-xs" style={{ color: "rgba(226,232,240,0.25)" }}>
                        &copy; {new Date().getFullYear()} ZoraFlow. All rights reserved.
                    </p>
                </div>
            </div>

            {/* ── Right panel — auth form ──────────────────────────────────── */}
            <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-12 sm:px-8">

                {/* Mobile logo */}
                <div className="mb-10 lg:hidden">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                             style={{ background: "var(--zf-gradient)" }}>
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-extrabold text-slate-900">ZoraFlow</span>
                    </Link>
                </div>

                <div className="w-full max-w-sm">

                    {/* Heading */}
                    <div className="mb-8 space-y-1">
                        <h1 className="text-2xl font-extrabold text-slate-900">
                            {isLogin ? "Welcome back" : "Create your account"}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {isLogin
                                ? "Sign in to continue to ZoraFlow"
                                : "Get 5 free PRD generations. No card required."}
                        </p>
                    </div>

                    {/* Google OAuth button */}
                    <button
                        onClick={handleGoogle}
                        disabled={submitting || googleLoading}
                        className="mb-5 flex h-11 w-full items-center justify-center gap-3 rounded-xl border bg-white text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow disabled:opacity-60"
                        style={{ borderColor: "#E2E8F0" }}
                    >
                        {googleLoading
                            ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                            : GOOGLE_ICON
                        }
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="relative mb-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-3 font-medium text-slate-400">or continue with email</span>
                        </div>
                    </div>

                    {/* Error / info banner */}
                    {error && (
                        <div
                            className={`mb-5 flex items-start gap-3 rounded-xl border p-3.5 text-sm ${
                                isVerifyMsg
                                    ? "border-blue-100 bg-blue-50 text-blue-700"
                                    : "border-red-100 bg-red-50 text-red-600"
                            }`}
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="h-11 w-full rounded-xl border bg-slate-50 pl-9 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    style={{ borderColor: "#E2E8F0" }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-11 w-full rounded-xl border bg-slate-50 pl-9 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    style={{ borderColor: "#E2E8F0" }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || googleLoading}
                            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
                            style={{ background: "var(--zf-gradient)" }}
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isLogin ? "Sign In" : "Create Account"}
                            {!submitting && <ArrowRight className="h-4 w-4" />}
                        </button>
                    </form>

                    {/* Toggle */}
                    <p className="mt-6 text-center text-sm text-slate-500">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => { setIsLogin(v => !v); setError(""); }}
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            {isLogin ? "Sign up free" : "Sign in"}
                        </button>
                    </p>

                    {/* Legal */}
                    <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
                        By continuing, you agree to our{" "}
                        <Link href="/terms"   className="hover:underline">Terms of Service</Link>
                        {" "}and{" "}
                        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>}>
            <AuthInner />
        </Suspense>
    );
}
