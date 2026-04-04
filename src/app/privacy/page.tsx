import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy – ZoraFlow",
  description:
    "Learn how ZoraFlow collects, uses, and protects your personal information when you use our AI-powered PRD generation platform.",
};

export default function PrivacyPage() {
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
            <Link href="/terms" className="transition-colors hover:text-orange-600">Terms</Link>
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Your Privacy Matters
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight" style={{ color: "#1c0a00" }}>
          Privacy Policy
        </h1>
        <p className="text-base" style={{ color: "#78350f" }}>
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* Quick summary card */}
      <div className="mx-auto max-w-4xl px-6 mb-8">
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row gap-6"
          style={{ background: "#ffedd5", border: "1px solid #fed7aa" }}
        >
          {[
            { icon: "🔒", title: "We don't sell your data", desc: "Your information is never sold to third parties." },
            { icon: "📧", title: "Minimal data collection", desc: "We only collect what's needed to provide the service." },
            { icon: "🗑️", title: "Delete anytime", desc: "You can request data deletion at any time." },
          ].map((item) => (
            <div key={item.title} className="flex-1 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm font-semibold mb-1" style={{ color: "#9a3412" }}>{item.title}</div>
              <div className="text-xs" style={{ color: "#78350f" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 pb-24">
        <div
          className="rounded-2xl p-8 md:p-12 space-y-10"
          style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #f0e6da", boxShadow: "0 4px 32px rgba(194,65,12,0.06)" }}
        >
          <Section title="1. Information We Collect">
            <p>We collect only the information necessary to provide ZoraFlow&apos;s services:</p>
            <Subheading>a) Information You Provide</Subheading>
            <ul>
              <li><strong>Google Account Data:</strong> When you sign in with Google OAuth, we receive your name, email address, and profile picture from Google.</li>
              <li><strong>Prompts &amp; Ideas:</strong> The product descriptions and prompts you enter to generate PRDs.</li>
            </ul>
            <Subheading>b) Automatically Collected Information</Subheading>
            <ul>
              <li><strong>Usage Data:</strong> Pages visited, features used, and timestamps of actions.</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and IP address.</li>
              <li><strong>Cookies:</strong> Session cookies required for authentication and preference storage.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Google OAuth">
            <p>
              ZoraFlow uses Google OAuth 2.0 solely for authentication purposes. When you sign in
              with Google:
            </p>
            <ul>
              <li>We access your <strong>name</strong> and <strong>email address</strong> to create and identify your account.</li>
              <li>We do <strong>not</strong> access your Gmail, Google Drive, Google Calendar, or any other Google service.</li>
              <li>We do <strong>not</strong> store your Google password.</li>
              <li>You can revoke ZoraFlow&apos;s access at any time via your{" "}
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="underline font-medium" style={{ color: "#c2410c" }}>
                  Google Account permissions
                </a>.
              </li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information collected to:</p>
            <ul>
              <li>Create and manage your ZoraFlow account.</li>
              <li>Generate PRDs, architecture diagrams, and BOMs based on your prompts.</li>
              <li>Improve the accuracy and quality of our AI models.</li>
              <li>Send transactional emails (e.g., account confirmation, important updates).</li>
              <li>Monitor for abuse, fraud, and security threats.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </Section>

          <Section title="4. Data Sharing and Disclosure">
            <p>We do not sell, trade, or rent your personal information. We may share your data only with:</p>
            <ul>
              <li><strong>Supabase:</strong> Our database and authentication provider, for secure data storage.</li>
              <li><strong>Google (Gemini API):</strong> Your prompts are sent to Google&apos;s Gemini API to generate AI content. Refer to{" "}
                <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#c2410c" }}>
                  Google&apos;s API Terms
                </a>.
              </li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority.</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain your account information for as long as your account is active. Generated
              PRD documents are stored to provide you with history and continuity of service.
              You may request deletion of your account and all associated data at any time by
              contacting us.
            </p>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement industry-standard security measures to protect your data, including:
            </p>
            <ul>
              <li>HTTPS encryption for all data in transit.</li>
              <li>Secure, encrypted storage via Supabase.</li>
              <li>OAuth 2.0 authentication — we never handle or store your Google password.</li>
              <li>Regular security reviews and updates.</li>
            </ul>
          </Section>

          <Section title="7. Cookies">
            <p>ZoraFlow uses cookies for:</p>
            <ul>
              <li><strong>Session management:</strong> To keep you logged in securely.</li>
              <li><strong>Preferences:</strong> To remember your settings.</li>
            </ul>
            <p>
              You can control cookies through your browser settings, but disabling cookies may
              affect the functionality of the Service, including authentication.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data.</li>
              <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
              <li><strong>Revocation:</strong> Revoke Google OAuth access at any time.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:support@zoraflow.app" className="underline font-medium" style={{ color: "#c2410c" }}>
                support@zoraflow.app
              </a>.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              ZoraFlow is not intended for individuals under the age of 13. We do not knowingly
              collect personal information from children under 13. If we become aware that a
              child under 13 has provided us with personal information, we will delete it immediately.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of
              significant changes by updating the &quot;Last updated&quot; date at the top of this page.
              Continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy,
              please contact us at:{" "}
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

function Subheading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-4 mb-2 text-base font-semibold" style={{ color: "#7c2d12" }}>
      {children}
    </h3>
  );
}

function Footer() {
  return (
    <footer className="border-t py-8" style={{ borderColor: "#f0e6da" }}>
      <div className="mx-auto max-w-4xl px-6 flex flex-col items-center gap-3 text-sm" style={{ color: "#78350f" }}>
        <p>© {new Date().getFullYear()} ZoraFlow. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-orange-600 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-orange-600 transition-colors font-medium">Privacy</Link>
          <Link href="/about" className="hover:text-orange-600 transition-colors">About</Link>
          <Link href="/" className="hover:text-orange-600 transition-colors">Home</Link>
        </div>
      </div>
    </footer>
  );
}
