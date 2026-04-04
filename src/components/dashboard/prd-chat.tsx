"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, MessageSquare, Eye, EyeOff, X } from "lucide-react";
import { BlockComment } from "@/components/dashboard/document-viewer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface PrdChatProps {
    markdown: string;
    onUpdateMarkdown: (newMarkdown: string) => void;
    onGenerate: (prompt: string) => void;
    isGenerating: boolean;
    comments: BlockComment[];
}

/* ── Decorative sparkle SVGs ── */
function SparkleOrange({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 0C40 0 44 28 52 36C60 44 80 40 80 40C80 40 60 44 52 52C44 60 40 80 40 80C40 80 36 60 28 52C20 44 0 40 0 40C0 40 20 36 28 28C36 20 40 0 40 0Z" fill="#FF6B35" />
        </svg>
    );
}

function SparkleGreen({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 0C30 0 33 21 39 27C45 33 60 30 60 30C60 30 45 33 39 39C33 45 30 60 30 60C30 60 27 45 21 39C15 33 0 30 0 30C0 30 15 27 21 21C27 15 30 0 30 0Z" fill="#2EC4B6" />
        </svg>
    );
}

function SparkleYellow({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 0C25 0 27.5 17.5 32.5 22.5C37.5 27.5 50 25 50 25C50 25 37.5 27.5 32.5 32.5C27.5 37.5 25 50 25 50C25 50 22.5 37.5 17.5 32.5C12.5 27.5 0 25 0 25C0 25 12.5 22.5 17.5 17.5C22.5 12.5 25 0 25 0Z" fill="#FFB627" />
        </svg>
    );
}

/* ── Google Icon ── */
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.2045Z" fill="#4285F4" />
            <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853" />
            <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5931 3.68182 9C3.68182 8.4068 3.78409 7.83 3.96409 7.29V4.9581H0.957275C0.347727 6.1731 0 7.5477 0 9C0 10.4522 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05" />
            <path d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9254L15.0218 2.344C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9581L3.96409 7.29C4.67182 5.1627 6.65591 3.5795 9 3.5795Z" fill="#EA4335" />
        </svg>
    );
}

/* ── AuthModal ── */
type AuthTab = "signin" | "signup";

function AuthModal({ onClose, onAuthSuccess }: { onClose: () => void; onAuthSuccess: (user: User) => void }) {
    const [tab, setTab] = useState<AuthTab>("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            if (tab === "signin") {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                if (data.user) onAuthSuccess(data.user);
            } else {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data.user && data.session) {
                    onAuthSuccess(data.user);
                } else {
                    setSuccess("Check your email for a confirmation link!");
                }
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setGoogleLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: window.location.origin },
        });
        if (error) {
            setError(error.message);
            setGoogleLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            style={{ animation: "fadeIn 0.15s ease" }}
        >
            <div
                className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                style={{ background: "#FFF8F0", border: "2px solid #1a1a2e" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header accent bar */}
                <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #FF6B35, #FFB627, #2EC4B6)" }} />

                {/* Close button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1.5 transition-colors hover:bg-black/10"
                    style={{ color: "#999" }}
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="p-8 pt-6">
                    {/* Logo */}
                    <div className="mb-6 flex justify-center">
                        <span className="text-2xl font-extrabold tracking-tight" style={{ color: "#1a1a2e" }}>
                            Zora<span style={{ color: "#FF6B35" }}>Flow</span>
                        </span>
                    </div>

                    {/* Setup warning — shown when env keys are missing */}
                    {!isSupabaseConfigured && (
                        <div
                            className="mb-5 rounded-xl px-4 py-3 text-xs leading-relaxed"
                            style={{ background: "#FFF8E1", border: "1.5px solid #FFD54F", color: "#7B5800" }}
                        >
                            <p className="mb-1 font-bold">⚠️ Supabase not configured</p>
                            <p>Add these two lines to your <code className="rounded bg-yellow-100 px-1 font-mono">.env.local</code> file and restart the dev server:</p>
                            <pre
                                className="mt-2 overflow-x-auto rounded-lg p-2 text-[11px]"
                                style={{ background: "#1a1a2e", color: "#FFB627", fontFamily: "monospace" }}
                            >{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}</pre>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="mb-6 flex rounded-xl p-1" style={{ background: "#f0e6da" }}>
                        {(["signin", "signup"] as AuthTab[]).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => { setTab(t); setError(null); setSuccess(null); }}
                                className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all"
                                style={
                                    tab === t
                                        ? { background: "#1a1a2e", color: "#FFF", boxShadow: "0 2px 8px rgba(26,26,46,0.25)" }
                                        : { color: "#666" }
                                }
                            >
                                {t === "signin" ? "Sign In" : "Sign Up"}
                            </button>
                        ))}
                    </div>

                    {/* Title */}
                    <h2 className="mb-1 text-center text-xl font-bold" style={{ color: "#1a1a2e" }}>
                        {tab === "signin" ? "Welcome back" : "Create your account"}
                    </h2>
                    <p className="mb-6 text-center text-sm" style={{ color: "#888" }}>
                        {tab === "signin"
                            ? "Sign in to generate your PRD"
                            : "Start building your product today"}
                    </p>

                    {/* Google OAuth */}
                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={googleLoading}
                        className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl py-3 text-sm font-semibold transition-all hover:bg-[#f5ece4] disabled:opacity-60"
                        style={{ background: "#FFF", border: "2px solid #e8ddd4", color: "#1a1a2e" }}
                    >
                        {googleLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <GoogleIcon />
                        )}
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex-1 border-t" style={{ borderColor: "#e8ddd4" }} />
                        <span className="text-xs font-medium" style={{ color: "#bbb" }}>or</span>
                        <div className="flex-1 border-t" style={{ borderColor: "#e8ddd4" }} />
                    </div>

                    {/* Email / Password form */}
                    <form onSubmit={handleEmailAuth} className="space-y-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#555" }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400"
                                style={{
                                    background: "#FFF",
                                    border: "2px solid #e8ddd4",
                                    color: "#1a1a2e",
                                    fontFamily: "inherit",
                                }}
                                onFocus={(e) => (e.currentTarget.style.borderColor = "#FF6B35")}
                                onBlur={(e) => (e.currentTarget.style.borderColor = "#e8ddd4")}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#555" }}>
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    autoComplete={tab === "signin" ? "current-password" : "new-password"}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all placeholder:text-slate-400"
                                    style={{
                                        background: "#FFF",
                                        border: "2px solid #e8ddd4",
                                        color: "#1a1a2e",
                                        fontFamily: "inherit",
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "#FF6B35")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e8ddd4")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 transition-colors hover:bg-black/5"
                                    style={{ color: "#aaa" }}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error / Success messages */}
                        {error && (
                            <div
                                className="rounded-xl px-4 py-2.5 text-sm font-medium"
                                style={{ background: "#FFF0EE", color: "#C0392B", border: "1px solid #f5c6c2" }}
                            >
                                {error}
                            </div>
                        )}
                        {success && (
                            <div
                                className="rounded-xl px-4 py-2.5 text-sm font-medium"
                                style={{ background: "#EAFAF1", color: "#1E8449", border: "1px solid #a9dfbf" }}
                            >
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                            style={{ background: "#FF6B35" }}
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {tab === "signin" ? "Sign In" : "Create Account"}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-5 text-center text-xs" style={{ color: "#aaa" }}>
                        {tab === "signin" ? (
                            <>Don&apos;t have an account?{" "}
                                <button type="button" onClick={() => { setTab("signup"); setError(null); }} className="font-semibold hover:underline" style={{ color: "#FF6B35" }}>
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>Already have an account?{" "}
                                <button type="button" onClick={() => { setTab("signin"); setError(null); }} className="font-semibold hover:underline" style={{ color: "#FF6B35" }}>
                                    Sign in
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

/* ── Main PrdChat component ── */
export function PrdChat({ markdown, onUpdateMarkdown, onGenerate, isGenerating, comments }: PrdChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasDocument = !!markdown;

    /* ── Supabase session listener ── */
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes (e.g. OAuth redirect, sign out)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) setShowAuthModal(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const [hasSeeded, setHasSeeded] = useState(false);
    useEffect(() => {
        if (markdown && !hasSeeded && messages.length === 0) {
            setMessages([
                { role: "assistant", content: "Your PRD has been generated! Feel free to ask me to refine it, add sections, or answer questions about it." }
            ]);
            setHasSeeded(true);
        }
    }, [markdown, hasSeeded, messages.length]);

    const buildCommentsContext = () => {
        if (comments.length === 0) return "";
        const commentsList = comments.map((c, i) =>
            `Comment ${i + 1}: On section "${c.blockText.substring(0, 80)}..." → "${c.commentText}"`
        ).join("\n");
        return `\n\nThe user has attached ${comments.length} inline comment(s) to the PRD:\n${commentsList}\n\nPlease consider these comments when making changes.`;
    };

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isGenerating) return;

        if (!user) {
            setShowAuthModal(true);
            return;
        }

        onGenerate(prompt.trim());
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        if (!user) {
            setShowAuthModal(true);
            return;
        }

        const userMsg = input.trim();
        setInput("");

        const newMessages: Message[] = [
            ...messages,
            { role: "user", content: userMsg }
        ];

        setMessages(newMessages);
        setIsLoading(true);

        try {
            const commentsContext = buildCommentsContext();

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages.map((m, i) =>
                        i === newMessages.length - 1 && m.role === "user"
                            ? { ...m, content: m.content + commentsContext }
                            : m
                    ),
                    document: markdown,
                    commandOnly: false
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get response");
            }

            setMessages([
                ...newMessages,
                { role: "assistant", content: data.reply }
            ]);

            if (data.updatedDocument) {
                onUpdateMarkdown(data.updatedDocument);
            }
        } catch (error: any) {
            console.error(error);
            setMessages([
                ...newMessages,
                { role: "assistant", content: `**Error:** ${error.message}` }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    /* ── User avatar with initials ── */
    const getInitials = () => {
        if (!user) return "U";
        const name = user.user_metadata?.full_name || user.email || "";
        return name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
    };

    // ─── Phase 1: No document yet — warm, premium hero prompt ───
    if (!hasDocument) {
        return (
            <div className="relative flex h-full w-full flex-col" style={{ background: '#FFF8F0' }}>
                {/* Top Navigation */}
                <nav className="flex items-center justify-between px-8 py-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
                            Zora<span style={{ color: '#FF6B35' }}>Flow</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium" style={{ color: '#666' }}>Docs</span>
                        <span className="text-sm font-medium" style={{ color: '#666' }}>Pricing</span>
                        {!user ? (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                style={{ background: '#1a1a2e' }}
                            >
                                Sign In
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                                    style={{ background: '#FF6B35' }}
                                    title={user.email}
                                >
                                    {getInitials()}
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="text-xs font-medium transition-colors hover:underline"
                                    style={{ color: '#999' }}
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Hero section with decorative sparkles */}
                <div className="relative flex flex-1 flex-col items-center justify-center px-6">
                    {/* Decorative sparkles */}
                    <SparkleOrange className="absolute left-[12%] top-[15%] h-12 w-12 animate-pulse" />
                    <SparkleGreen className="absolute right-[15%] top-[20%] h-10 w-10 animate-pulse [animation-delay:500ms]" />
                    <SparkleYellow className="absolute left-[8%] bottom-[30%] h-8 w-8 animate-pulse [animation-delay:1000ms]" />
                    <SparkleOrange className="absolute right-[10%] bottom-[25%] h-6 w-6 animate-pulse [animation-delay:750ms]" />
                    <SparkleGreen className="absolute left-[25%] top-[8%] h-6 w-6 animate-pulse [animation-delay:300ms]" />

                    {/* Main heading */}
                    <h1
                        className="mb-4 text-center font-extrabold leading-[1.1] tracking-tight"
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#1a1a2e' }}
                    >
                        Generate your PRD
                        <br />
                        <span style={{ color: '#FF6B35' }}>in seconds</span>
                    </h1>
                    <p className="mb-10 max-w-lg text-center text-base leading-relaxed" style={{ color: '#666' }}>
                        Turn any project idea into a comprehensive Product Requirements Document.
                        <br />
                        <span style={{ color: '#FF6B35' }}>Powered by AI to architect your next product.</span>
                    </p>

                    {/* Input card */}
                    <form onSubmit={handleGenerate} className="w-full max-w-2xl">
                        <div
                            className="rounded-2xl p-5 shadow-lg"
                            style={{
                                background: '#FFF',
                                border: '2px solid #1a1a2e',
                            }}
                        >
                            <textarea
                                placeholder="e.g. A habit tracking app focusing on gamification with social features..."
                                className="w-full resize-none border-0 bg-transparent text-base outline-none placeholder:text-slate-400"
                                style={{ minHeight: '100px', color: '#1a1a2e', fontFamily: 'inherit' }}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isGenerating}
                            />
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs font-medium" style={{ color: '#999' }}>
                                    ⚡ uses zoraflow AI
                                </span>
                                <button
                                    type="submit"
                                    disabled={!prompt.trim() || isGenerating}
                                    className="rounded-lg px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                                    style={{ background: '#FF6B35' }}
                                >
                                    {isGenerating ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Generating...
                                        </span>
                                    ) : (
                                        "Generate →"
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Quick suggestions */}
                    <div className="mt-6 flex flex-col items-center gap-3">
                        <p className="text-xs font-medium" style={{ color: '#999' }}>
                            Try these example ideas:
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                "SaaS Dashboard",
                                "Mobile E-commerce",
                                "AI Chatbot Platform",
                                "Social Media App",
                                "EdTech Platform"
                            ].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => setPrompt(suggestion)}
                                    className="rounded-full px-4 py-2 text-xs font-semibold transition-all hover:opacity-80"
                                    style={{
                                        background: '#1a1a2e',
                                        color: '#FFF',
                                        border: '1.5px solid #1a1a2e',
                                    }}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-auto py-5 text-center" style={{ borderTop: '1px solid #f0e6da' }}>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs" style={{ color: '#aaa' }}>
                        <span>© {new Date().getFullYear()} ZoraFlow</span>
                        <Link href="/about" className="transition-colors hover:text-orange-500 font-medium" style={{ color: '#bbb' }}>About</Link>
                        <Link href="/terms" className="transition-colors hover:text-orange-500 font-medium" style={{ color: '#bbb' }}>Terms &amp; Conditions</Link>
                        <Link href="/privacy" className="transition-colors hover:text-orange-500 font-medium" style={{ color: '#bbb' }}>Privacy Policy</Link>
                    </div>
                </footer>

                {showAuthModal && (
                    <AuthModal
                        onClose={() => setShowAuthModal(false)}
                        onAuthSuccess={(u) => {
                            setUser(u);
                            setShowAuthModal(false);
                        }}
                    />
                )}
            </div>
        );
    }

    // ─── Phase 2: Document exists — chat panel on the left ───
    return (
        <div className="flex h-full flex-col" style={{ background: '#FFF8F0' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f0e6da' }}>
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#FF6B35' }}>
                        <svg className="h-4.5 w-4.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold" style={{ color: '#1a1a2e' }}>
                            Zora<span style={{ color: '#FF6B35' }}>Flow</span> Assistant
                        </h3>
                        <p className="text-[11px]" style={{ color: '#999' }}>Ask questions or request edits</p>
                    </div>
                </div>

                {/* User badge in chat header */}
                {user && (
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ background: '#FF6B35' }}
                            title={user.email}
                        >
                            {getInitials()}
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="text-[11px] font-medium hover:underline"
                            style={{ color: '#aaa' }}
                        >
                            Sign out
                        </button>
                    </div>
                )}
            </div>

            {/* Comment cards */}
            {comments.length > 0 && (
                <div className="mx-4 mt-3 space-y-2">
                    <div className="flex items-center gap-2 px-1">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0" style={{ color: '#FF6B35' }} />
                        <span className="text-xs font-semibold" style={{ color: '#995200' }}>
                            {comments.length} inline comment{comments.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    {comments.map((comment, idx) => (
                        <div
                            key={comment.id || idx}
                            className="rounded-xl p-3 text-xs transition-all hover:shadow-md"
                            style={{ background: '#FFF', border: '1px solid #FFD9B3' }}
                        >
                            {/* Section text preview */}
                            <div className="mb-1.5 truncate font-medium" style={{ color: '#999', maxWidth: '100%' }}>
                                📄 {comment.blockText.length > 60 ? comment.blockText.substring(0, 60) + '...' : comment.blockText}
                            </div>
                            {/* Comment text */}
                            <div className="mb-2 leading-relaxed" style={{ color: '#1a1a2e' }}>
                                💬 {comment.commentText}
                            </div>
                            {/* Apply button */}
                            <button
                                type="button"
                                onClick={() => {
                                    const applyMessage = `Apply this comment on the section "${comment.blockText.substring(0, 80)}": ${comment.commentText}`;
                                    setInput(applyMessage);
                                }}
                                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white transition-all hover:opacity-90"
                                style={{ background: '#FF6B35' }}
                            >
                                ⚡ Apply Comment
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                            style={msg.role === "user"
                                ? { background: '#1a1a2e', color: '#FFF' }
                                : { background: '#FFF', color: '#1a1a2e', border: '1px solid #f0e6da' }
                            }
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="rounded-2xl px-4 py-3" style={{ background: '#FFF', border: '1px solid #f0e6da' }}>
                            <div className="flex gap-1.5">
                                <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:0ms]" style={{ background: '#FF6B35' }}></span>
                                <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: '#FFB627' }}></span>
                                <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: '#2EC4B6' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4" style={{ borderTop: '1px solid #f0e6da' }}>
                <form onSubmit={handleSend} className="flex gap-2">
                    <div
                        className="flex flex-1 items-center rounded-xl px-3"
                        style={{ background: '#FFF', border: '2px solid #1a1a2e' }}
                    >
                        <Input
                            placeholder={comments.length > 0 ? "e.g. Apply all comments..." : "e.g. Add offline support..."}
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="h-10 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
                            style={{ color: '#1a1a2e' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: '#FF6B35' }}
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </form>
            </div>

            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onAuthSuccess={(u) => {
                        setUser(u);
                        setShowAuthModal(false);
                    }}
                />
            )}
        </div>
    );
}
