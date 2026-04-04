import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions – ZoraFlow",
  description:
    "Read the Terms and Conditions governing your use of ZoraFlow, the AI-powered product requirements document generator.",
};

export default function TermsPage() {
  const lastUpdated = "April 4, 2026";

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
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold" style={{ color: "#c2410c" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#c2410c" />
            </svg>
            ZoraFlow
          </Link>
          <nav className="flex gap-6 text-sm font-medium" style={{ color: "#78350f" }}>
            <Link href="/about" className="transition-colors hover:text-orange-600">About</Link>
            <Link href="/privacy" className="transition-colors hover:text-orange-600">Privacy</Link>
            <Link href="/" className="transition-colors hover:text-orange-600">Home</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="mx-auto max-w-4xl px-6 pt-16 pb-8 text-center">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
          style={{ background: "#ffedd5", color: "#c2410c" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Legal
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight" style={{ color: "#1c0a00" }}>
          Terms and Conditions
        </h1>
        <p className="text-base" style={{ color: "#78350f" }}>
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 pb-24">
        <div
          className="rounded-2xl p-8 md:p-12 space-y-10"
          style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #f0e6da", boxShadow: "0 4px 32px rgba(194,65,12,0.06)" }}
        >
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using ZoraFlow (&quot;the Service&quot;), you agree to be bound by these Terms
              and Conditions. If you do not agree to these terms, please do not use the Service. These
              Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              ZoraFlow is an AI-powered platform that transforms natural language ideas into structured
              Product Requirements Documents (PRDs), technical architecture diagrams, and Bills of
              Materials (BOM). The Service uses large language models to assist product managers,
              developers, and entrepreneurs.
            </p>
          </Section>

          <Section title="3. Account Registration and Google OAuth">
            <p>
              To access certain features, you must sign in using Google OAuth. By authenticating
              with Google, you authorize ZoraFlow to access your basic Google profile information
              (name and email address) solely for the purpose of account creation and identification.
              We do not access your Google Drive, Gmail, or any other Google services beyond the
              basic profile scope.
            </p>
            <ul>
              <li>You are responsible for maintaining the confidentiality of your account.</li>
              <li>You must provide accurate and complete information during sign-up.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Generate content that is illegal, harmful, threatening, or abusive.</li>
              <li>Reverse-engineer, decompile, or attempt to extract the source code.</li>
              <li>Use automated bots or scripts to abuse the API.</li>
              <li>Infringe on any intellectual property rights.</li>
              <li>Transmit malware, viruses, or destructive code.</li>
              <li>Attempt to gain unauthorized access to any part of the Service.</li>
            </ul>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              All content generated by ZoraFlow&apos;s AI on your behalf (PRDs, diagrams, BOM) is
              provided to you for your use. However, ZoraFlow retains ownership of the underlying
              platform, models, and technology. You retain ownership of the original prompts and
              ideas you provide as input.
            </p>
            <p>
              ZoraFlow&apos;s name, logo, and branding are trademarks of ZoraFlow and may not be used
              without prior written consent.
            </p>
          </Section>

          <Section title="6. AI-Generated Content Disclaimer">
            <p>
              Content generated by ZoraFlow&apos;s AI is provided as-is and may contain inaccuracies.
              ZoraFlow does not warrant the accuracy, completeness, or fitness for a particular
              purpose of any AI-generated content. Always review AI-generated documents before
              using them in production or business-critical decisions.
            </p>
          </Section>

          <Section title="7. Privacy">
            <p>
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="underline font-medium" style={{ color: "#c2410c" }}>
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. Please review it carefully.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, ZoraFlow shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages, including but
              not limited to loss of profits, data, goodwill, or business opportunities arising out
              of or in connection with your use of the Service.
            </p>
          </Section>

          <Section title="9. Termination">
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time,
              with or without notice, for conduct that we believe violates these Terms or is harmful
              to other users, us, third parties, or the integrity of the Service.
            </p>
          </Section>

          <Section title="10. Changes to Terms">
            <p>
              We may revise these Terms from time to time. The most current version will always be
              available at this URL. By continuing to use the Service after changes become effective,
              you agree to be bound by the revised Terms.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of India, without
              regard to its conflict of law provisions. Any disputes arising under these Terms shall
              be subject to the exclusive jurisdiction of the courts located in India.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:{" "}
              <a href="mailto:support@zoraflow.app" className="underline font-medium" style={{ color: "#c2410c" }}>
                support@zoraflow.app
              </a>
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold" style={{ color: "#9a3412" }}>
        {title}
      </h2>
      <div className="space-y-3 text-base leading-relaxed" style={{ color: "#44200a" }}>
        {children}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-8" style={{ borderColor: "#f0e6da" }}>
      <div className="mx-auto max-w-4xl px-6 flex flex-col items-center gap-3 text-sm" style={{ color: "#78350f" }}>
        <p>© {new Date().getFullYear()} ZoraFlow. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-orange-600 transition-colors font-medium">Terms</Link>
          <Link href="/privacy" className="hover:text-orange-600 transition-colors">Privacy</Link>
          <Link href="/about" className="hover:text-orange-600 transition-colors">About</Link>
          <Link href="/" className="hover:text-orange-600 transition-colors">Home</Link>
        </div>
      </div>
    </footer>
  );
}
