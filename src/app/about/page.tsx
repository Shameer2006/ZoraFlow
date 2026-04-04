import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About – ZoraFlow",
  description:
    "ZoraFlow is an AI-powered platform that transforms natural language product ideas into complete PRDs, architecture diagrams, and Bills of Materials.",
};

export default function AboutPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #FFF8F0 0%, #FFF3E8 100%)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{ background: "rgba(255,248,240,0.85)", borderColor: "#f0e6da" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold" style={{ color: "#c2410c" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#c2410c" />
            </svg>
            ZoraFlow
          </Link>
          <nav className="flex gap-6 text-sm font-medium" style={{ color: "#78350f" }}>
            <Link href="/terms" className="transition-colors hover:text-orange-600">Terms</Link>
            <Link href="/privacy" className="transition-colors hover:text-orange-600">Privacy</Link>
            <Link href="/" className="transition-colors hover:text-orange-600">Home</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
          style={{ background: "#ffedd5", color: "#c2410c" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Natural Language → Technical Reality
        </div>
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight" style={{ color: "#1c0a00" }}>
          About ZoraFlow
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed" style={{ color: "#78350f" }}>
          ZoraFlow is your AI co-pilot for product development. Describe your idea in plain English
          and watch it transform into a complete, professional-grade product specification in seconds.
        </p>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div
          className="rounded-2xl p-8 md:p-12 text-center"
          style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #f0e6da", boxShadow: "0 4px 32px rgba(194,65,12,0.06)" }}
        >
          <h2 className="mb-4 text-3xl font-bold" style={{ color: "#9a3412" }}>Our Mission</h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed" style={{ color: "#44200a" }}>
            We believe every great product starts with a clear vision. ZoraFlow bridges the gap between
            a spark of an idea and the technical documentation needed to build it — making product
            thinking faster, clearer, and more collaborative for teams of all sizes.
          </p>
        </div>
      </section>

      {/* Pipeline stages */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="mb-10 text-center text-3xl font-bold" style={{ color: "#9a3412" }}>
          The ZoraFlow Pipeline
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              stage: "01",
              icon: "✍️",
              title: "PRD Generation",
              desc: "Describe your idea in plain language. ZoraFlow's AI crafts a detailed, structured Product Requirements Document covering goals, user stories, and acceptance criteria.",
            },
            {
              stage: "02",
              icon: "🗺️",
              title: "Architecture Diagrams",
              desc: "Automatically generate Mermaid-based technical architecture diagrams — system flows, entity relationships, and component breakdowns — from your PRD.",
            },
            {
              stage: "03",
              icon: "🛒",
              title: "Smart BOM",
              desc: "Get an AI-recommended Bill of Materials with technology choices, libraries, and tools tailored to your project type — with helpful resource links.",
            },
            {
              stage: "04",
              icon: "⚙️",
              title: "Code Scaffolding",
              desc: "Coming soon: Generate starter code, project structures, and configuration files to kickstart your implementation with zero friction.",
            },
          ].map((item) => (
            <div
              key={item.stage}
              className="rounded-2xl p-6 flex flex-col gap-3"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #f0e6da", boxShadow: "0 2px 12px rgba(194,65,12,0.05)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-bold rounded-full px-2 py-0.5"
                  style={{ background: "#ffedd5", color: "#c2410c" }}
                >
                  Stage {item.stage}
                </span>
                <span className="text-xl">{item.icon}</span>
              </div>
              <h3 className="text-lg font-semibold" style={{ color: "#7c2d12" }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#78350f" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why ZoraFlow */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="mb-10 text-center text-3xl font-bold" style={{ color: "#9a3412" }}>
          Why ZoraFlow?
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: "⚡", title: "10x Faster", desc: "Generate production-quality PRDs in seconds, not hours." },
            { icon: "🎯", title: "Accurate & Structured", desc: "AI-powered output follows industry-standard PRD formats used by top companies." },
            { icon: "🔄", title: "Iterative", desc: "Refine, comment, and evolve your documents with AI assistance at every step." },
            { icon: "🔗", title: "End-to-End", desc: "From idea to BOM in one place — no context switching across tools." },
            { icon: "🔐", title: "Secure Sign-In", desc: "Sign in securely with your Google account. We never store your password." },
            { icon: "🆓", title: "Start Free", desc: "Get started for free and scale as your product grows." },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl p-5 flex gap-4"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid #f0e6da" }}
            >
              <span className="text-2xl mt-0.5 shrink-0">{item.icon}</span>
              <div>
                <div className="font-semibold mb-1" style={{ color: "#7c2d12" }}>{item.title}</div>
                <div className="text-sm leading-relaxed" style={{ color: "#78350f" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Built with */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div
          className="rounded-2xl p-8 md:p-10"
          style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #f0e6da", boxShadow: "0 4px 32px rgba(194,65,12,0.06)" }}
        >
          <h2 className="mb-6 text-2xl font-bold text-center" style={{ color: "#9a3412" }}>Built With</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { name: "Next.js 15", role: "Framework" },
              { name: "Google Gemini", role: "AI Engine" },
              { name: "Supabase", role: "Auth & Database" },
              { name: "TypeScript", role: "Language" },
            ].map((tech) => (
              <div key={tech.name} className="rounded-xl p-4" style={{ background: "#ffedd5" }}>
                <div className="font-semibold text-sm mb-1" style={{ color: "#9a3412" }}>{tech.name}</div>
                <div className="text-xs" style={{ color: "#78350f" }}>{tech.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
        <div
          className="rounded-2xl p-10 md:p-14"
          style={{ background: "linear-gradient(135deg, #c2410c, #ea580c)", boxShadow: "0 8px 40px rgba(194,65,12,0.25)" }}
        >
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to Build Something Great?</h2>
          <p className="mb-8 text-lg" style={{ color: "#ffedd5" }}>
            Turn your product idea into a fully documented specification in seconds.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-base font-semibold shadow-lg transition-transform hover:scale-105"
            style={{ background: "white", color: "#c2410c" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#c2410c" />
            </svg>
            Start Generating for Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t py-8" style={{ borderColor: "#f0e6da" }}>
      <div className="mx-auto max-w-5xl px-6 flex flex-col items-center gap-3 text-sm" style={{ color: "#78350f" }}>
        <p>© {new Date().getFullYear()} ZoraFlow. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-orange-600 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-orange-600 transition-colors">Privacy</Link>
          <Link href="/about" className="hover:text-orange-600 transition-colors font-medium">About</Link>
          <Link href="/" className="hover:text-orange-600 transition-colors">Home</Link>
        </div>
      </div>
    </footer>
  );
}
