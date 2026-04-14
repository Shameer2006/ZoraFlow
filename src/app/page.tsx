"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight, Zap, FileText, Layers, ShoppingCart,
    ChevronRight, Sparkles, Code2, Users, Building2,
    GraduationCap, PenTool, CheckCircle2, Star,
    Activity, Shield, Clock, Globe
} from "lucide-react";
import { Navbar }  from "@/components/layout/navbar";
import { Footer }  from "@/components/layout/footer";
import { supabase } from "@/lib/supabase";

/* ─── Data ──────────────────────────────────────────────────────────────────── */

const EXAMPLE_PROMPTS = [
    "Smart home automation system with voice control",
    "SaaS CRM platform for small businesses",
    "IoT plant sensor with mobile dashboard",
    "Subscription billing platform with usage analytics",
];

const PIPELINE_STAGES = [
    {
        num:    "01",
        icon:   FileText,
        title:  "PRD Generation",
        desc:   "Describe your idea in one sentence. ZoraFlow's Engineering Architect AI builds a full, structured Product Requirements Document.",
        color:  "#7C3AED",
        shade:  "rgba(124,58,237,0.08)",
    },
    {
        num:    "02",
        icon:   Layers,
        title:  "Architecture Diagrams",
        desc:   "Auto-generates Mermaid flowcharts, system schematics, and entity maps directly from your PRD.",
        color:  "#C084FC",
        shade:  "rgba(192,132,252,0.08)",
    },
    {
        num:    "03",
        icon:   ShoppingCart,
        title:  "Smart Bill of Materials",
        desc:   "AI-curated hardware or SaaS stack recommendations with direct buy links — ready to order.",
        color:  "#8B5CF6",
        shade:  "rgba(139,92,246,0.08)",
    },
];

const WHO_ITS_FOR = [
    { icon: Code2,        label: "Developers",  color: "#7C3AED" },
    { icon: GraduationCap,label: "Students",    color: "#C084FC" },
    { icon: Building2,    label: "Startups",    color: "#8B5CF6" },
    { icon: PenTool,      label: "Makers",      color: "#EC4899" },
    { icon: Users,        label: "Teams",       color: "#F59E0B" },
    { icon: Globe,        label: "Researchers", color: "#10B981" },
];

const FEATURES = [
    { icon: Zap,         title: "Instant Generation",    desc: "Full PRD from a single sentence in under 10 seconds." },
    { icon: Activity,    title: "Live Architecture",      desc: "Auto-generated system diagrams that update with your idea." },
    { icon: Shield,      title: "Credit-Gated Quality",  desc: "Every generation is tracked — quality over quantity." },
    { icon: Clock,       title: "Session Persistence",   desc: "Resume any past PRD from your dashboard at any time." },
    { icon: CheckCircle2,title: "Multi-Turn Refinement", desc: "Chat with the AI to refine, extend, or edit any section." },
    { icon: Star,        title: "Stage 3 BOM",           desc: "Curated hardware and SaaS stack with purchase links." },
];

const STATS = [
    { value: "< 10s", label: "PRD generation time" },
    { value: "3",     label: "Pipeline stages"      },
    { value: "100%",  label: "AI-powered output"   },
    { value: "Free",  label: "To get started"       },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */

export default function LandingPage() {
    const router = useRouter();
    const [prompt,    setPrompt]    = useState("");
    const [user,      setUser]      = useState<any>(null);
    const [activeTab, setActiveTab] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
        return () => subscription.unsubscribe();
    }, []);

    const handleGenerate = () => {
        const trimmed = prompt.trim();
        if (!trimmed) { inputRef.current?.focus(); return; }
        router.push(`/editor?prompt=${encodeURIComponent(trimmed)}`);
    };

    return (
        <div className="min-h-screen" style={{ background: "var(--zf-gradient-page, #F8FAFF)" }}>
            <Navbar variant="transparent" />

            {/* ── Hero ───────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden px-4 pb-28 pt-20 md:pt-32">

                {/* Background glow */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute left-1/4 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl -z-10"
                         style={{ background: "radial-gradient(circle, #7C3AED, transparent 70%)" }} />
                    <div className="absolute right-0 top-1/3 h-[400px] w-[400px] translate-x-1/2 rounded-full opacity-10 blur-3xl -z-10"
                         style={{ background: "radial-gradient(circle, #C084FC, transparent 70%)" }} />
                </div>

                <div className="relative mx-auto max-w-5xl text-center">

                    {/* Badge */}
                    <div className="mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold"
                         style={{ borderColor: "rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.06)", color: "#6D28D9" }}>
                        <Sparkles className="h-3.5 w-3.5" />
                        Natural Language to Technical Reality — 3 Stages
                    </div>

                    {/* Headline */}
                    <h1 className="mb-6 text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
                        style={{ color: "#FFFFFF" }}>
                        Turn your idea into a
                        <span className="zf-gradient-text"> full specification</span>.
                    </h1>

                    <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
                        ZoraFlow converts a rough idea into a professional PRD, architecture diagrams,
                        and a curated Bill of Materials — all in one automated pipeline.
                    </p>

                    {/* Input card */}
                    <div className="mx-auto max-w-2xl">
                        <div
                            className="relative rounded-3xl p-2 shadow-2xl shadow-violet-200/50"
                            style={{ background: "transparent", border: "2px solid var(--zf-border)" }}
                        >
                            <div className="flex items-center gap-3 rounded-2xl px-4 py-1"
                                 style={{ background: "var(--zf-dark)" }}>
                                <Sparkles className="h-5 w-5 shrink-0 text-violet-500" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                                    placeholder="e.g., Smart irrigation system with soil sensors and mobile app…"
                                    className="flex-1 bg-transparent py-4 text-base text-slate-200 outline-none placeholder:text-slate-400"
                                />
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim()}
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white shadow-lg shadow-violet-500/30 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
                                style={{ background: "var(--zf-gradient)" }}
                            >
                                Generate Pipeline
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Example chips */}
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                            <span className="text-xs font-medium text-slate-400">Try:</span>
                            {EXAMPLE_PROMPTS.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPrompt(p)}
                                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-slate-400 transition-all hover:-translate-y-px hover:border-violet-300 hover:text-violet-600 hover:shadow-sm active:scale-95"
                                    style={{ borderColor: "var(--zf-border)", background: "transparent" }}
                                >
                                    {p.slice(0, 30)}&hellip;
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Pipeline steps ─────────────────────────────────────────────── */}
            <section className="px-4 py-24" style={{ background: "transparent" }}>
                <div className="mx-auto max-w-6xl">
                    <div className="mb-16 text-center">
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-500">How it works</p>
                        <h2 className="text-4xl font-extrabold text-white md:text-5xl">Three-stage pipeline</h2>
                        <p className="mt-4 text-lg text-slate-400">One idea. Three outputs. Fully automated.</p>
                    </div>

                    {/* Connector line */}
                    <div className="relative">
                        <div className="absolute left-1/2 top-10 hidden h-px w-2/3 -translate-x-1/2 md:block"
                             style={{ background: "linear-gradient(90deg, transparent, #DDD6FE, #A5F3FC, transparent)" }} />
                        <div className="grid gap-6 md:grid-cols-3">
                            {PIPELINE_STAGES.map((stage, i) => (
                                <div
                                    key={i}
                                    className="group flex flex-col gap-5 rounded-3xl p-7 transition-all hover:-translate-y-1 hover:shadow-xl"
                                    style={{ background: "var(--zf-dark)", border: `2px solid ${stage.color}20` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-13 w-13 items-center justify-center rounded-2xl"
                                             style={{ background: stage.shade }}>
                                            <stage.icon className="h-6 w-6" style={{ color: stage.color }} />
                                        </div>
                                        <span className="text-4xl font-black opacity-10" style={{ color: stage.color }}>
                                            {stage.num}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{stage.title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-400">{stage.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Who it's for ───────────────────────────────────────────────── */}
            <section className="border-y px-4 py-14" style={{ borderColor: "var(--zf-border)", background: "var(--zf-dark)" }}>
                <div className="mx-auto max-w-4xl">
                    <p className="mb-7 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                        Built for technical creators
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {WHO_ITS_FOR.map(({ icon: Icon, label, color }) => (
                            <div
                                key={label}
                                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
                                style={{ borderColor: `${color}30`, background: `${color}0A`, color }}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features grid ──────────────────────────────────────────────── */}
            <section className="px-4 py-24" style={{ background: "transparent" }}>
                <div className="mx-auto max-w-6xl">
                    <div className="mb-16 text-center">
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-500">Features</p>
                        <h2 className="text-4xl font-extrabold text-white md:text-5xl">Everything you need</h2>
                        <p className="mt-4 text-lg text-slate-400">From simple docs to complex system architecture, covered.</p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                            <div
                                key={i}
                                className="group flex flex-col gap-4 rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                                style={{ border: "2px solid var(--zf-border)", background: "var(--zf-dark)" }}
                            >
                                <div
                                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                                    style={{ background: "rgba(124,58,237,0.1)" }}
                                >
                                    <Icon className="h-5 w-5 text-violet-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">{title}</h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stats ──────────────────────────────────────────────────────── */}
            <section className="px-4 py-20" style={{ background: "var(--zf-dark)" }}>
                <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center md:grid-cols-4">
                    {STATS.map(({ value, label }, i) => (
                        <div key={i}>
                            <div className="zf-gradient-text text-4xl font-black md:text-5xl">{value}</div>
                            <div className="mt-2 text-sm" style={{ color: "rgba(226,232,240,0.5)" }}>{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Use cases tabbed ───────────────────────────────────────────── */}
            <section className="px-4 py-24" style={{ background: "transparent" }}>
                <div className="mx-auto max-w-6xl">
                    <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                        <div className="space-y-6">
                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-500">Use cases</p>
                                <h2 className="text-4xl font-extrabold text-white md:text-5xl">
                                    Tailored for your workflow
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { icon: GraduationCap, label: "For Students",  desc: "Create project proposals and technical docs 10x faster." },
                                    { icon: Building2,     label: "For Startups",  desc: "Go from pitch to full technical spec before your first sprint." },
                                    { icon: PenTool,       label: "For Makers",    desc: "Spec out your hardware project with a full IoT BOM instantly." },
                                ].map((tab, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveTab(i)}
                                        className="flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-300"
                                        style={{
                                            borderColor: activeTab === i ? "rgba(124,58,237,0.4)" : "var(--zf-border)",
                                            background:  activeTab === i ? "rgba(124,58,237,0.05)" : "#050510",
                                            boxShadow:   activeTab === i ? "0 4px 20px rgba(124,58,237,0.1)" : "none",
                                            transform:   activeTab === i ? "scale(1.01)" : "scale(1)",
                                        }}
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                             style={{ background: activeTab === i ? "rgba(124,58,237,0.1)" : "#F8FAFF" }}>
                                            <tab.icon className="h-5 w-5" style={{ color: activeTab === i ? "#7C3AED" : "#94A3B8" }} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold" style={{ color: activeTab === i ? "#5B21B6" : "#0F172A" }}>{tab.label}</h4>
                                            <p className="mt-1 text-sm text-slate-400">{tab.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right panel */}
                        <div className="relative">
                            <div className="absolute inset-0 rounded-3xl blur-2xl opacity-20"
                                 style={{ background: "var(--zf-gradient)" }} />
                            <div
                                className="relative flex min-h-72 flex-col items-center justify-center gap-6 rounded-3xl p-10 text-center"
                                style={{ background: "var(--zf-dark-2, #0D1530)", border: "1px solid rgba(124,58,237,0.2)" }}
                            >
                                <div
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl"
                                    style={{ background: "rgba(124,58,237,0.15)" }}
                                >
                                    {activeTab === 0 && <GraduationCap className="h-8 w-8 text-violet-400" />}
                                    {activeTab === 1 && <Building2     className="h-8 w-8 text-fuchsia-400" />}
                                    {activeTab === 2 && <PenTool       className="h-8 w-8 text-purple-400" />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-extrabold text-white">
                                        {activeTab === 0 && "A+ Papers in Minutes"}
                                        {activeTab === 1 && "Close Deals Faster"}
                                        {activeTab === 2 && "Ship Hardware Sooner"}
                                    </h3>
                                    <p className="mt-3 max-w-xs text-sm text-slate-400">
                                        Stop staring at a blank page. Let ZoraFlow handle the structure so you can focus on the ideas.
                                    </p>
                                </div>
                                <div
                                    className="rounded-full px-4 py-1.5 text-xs font-semibold text-white"
                                    style={{ background: "var(--zf-gradient)" }}
                                >
                                    Powered by Gemini AI
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ────────────────────────────────────────────────────────── */}
            <section className="px-4 py-28" style={{ background: "var(--zf-dark)" }}>
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
                        Ready to build your next project?
                    </h2>
                    <p className="mb-10 text-lg text-slate-400">
                        {user
                            ? "You have credits ready — start generating now."
                            : "Sign up free and get 5 PRD generations included."}
                    </p>
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <button
                            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => inputRef.current?.focus(), 400); }}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/25 transition-all hover:opacity-90 active:scale-[0.99] sm:w-auto"
                            style={{ background: "var(--zf-gradient)" }}
                        >
                            <Sparkles className="h-5 w-5" />
                            Start generating — it&apos;s free
                        </button>
                        <Link
                            href="/dashboard"
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border px-8 py-4 text-base font-semibold text-slate-300 transition-all hover:border-violet-300 hover:text-violet-700 sm:w-auto"
                            style={{ borderColor: "var(--zf-border)" }}
                        >
                            Browse my PRDs
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
