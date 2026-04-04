"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar }   from "@/components/layout/navbar";
import { supabase } from "@/lib/supabase";
import {
    Plus, Trash2, Play, FileText, Clock,
    Loader2, AlertCircle, RefreshCw, LayoutDashboard
} from "lucide-react";

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60)     return "just now";
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
function SessionSkeleton() {
    return (
        <div
            className="animate-pulse space-y-4 rounded-2xl p-5"
            style={{ background: "#fff", border: "2px solid var(--zf-border)" }}
        >
            <div className="h-3 w-3/4 rounded-lg" style={{ background: "#EFF6FF" }} />
            <div className="h-3 w-1/2 rounded-lg" style={{ background: "#EFF6FF" }} />
            <div className="flex gap-2 pt-2">
                <div className="h-9 flex-1 rounded-xl" style={{ background: "#EFF6FF" }} />
                <div className="h-9 w-12 rounded-xl"  style={{ background: "#EFF6FF" }} />
            </div>
        </div>
    );
}

/* ── Empty state ──────────────────────────────────────────────────────────── */
function EmptyState({ onNew }: { onNew: () => void }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-28 text-center">
            <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
                style={{ background: "rgba(59,130,246,0.08)", border: "2px dashed rgba(59,130,246,0.3)" }}
            >
                <FileText className="h-9 w-9 text-blue-400" />
            </div>
            <h3 className="mb-2 text-xl font-extrabold text-slate-900">No PRDs yet</h3>
            <p className="mb-8 max-w-xs text-sm leading-relaxed text-slate-500">
                Generate your first PRD and it will appear here so you can continue editing anytime.
            </p>
            <button
                onClick={onNew}
                className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:opacity-90 active:scale-95"
                style={{ background: "var(--zf-gradient)" }}
            >
                <Plus className="h-4 w-4" />
                Create your first PRD
            </button>
        </div>
    );
}

/* ── Session card ─────────────────────────────────────────────────────────── */
interface Session {
    session_id: string;
    title:      string;
    created_at: string;
    updated_at: string;
}

function SessionCard({
    session, onContinue, onDelete, deleting, resuming,
}: {
    session:   Session;
    onContinue:(s: Session) => void;
    onDelete:  (id: string) => void;
    deleting:  string | null;
    resuming:  string | null;
}) {
    const isDeleting = deleting === session.session_id;
    const isResuming = resuming === session.session_id;

    return (
        <div
            className="group flex flex-col gap-4 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "#fff", border: "2px solid var(--zf-border)" }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Clock className="h-3 w-3" />
                    {timeAgo(session.updated_at || session.created_at)}
                </div>
                <FileText className="h-4 w-4 text-blue-300 opacity-50" />
            </div>

            <p className="line-clamp-2 flex-1 text-sm font-bold leading-snug text-slate-800">
                {session.title || "Untitled PRD"}
            </p>

            <div className="flex gap-2">
                <button
                    onClick={() => onContinue(session)}
                    disabled={isResuming || isDeleting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                    style={{ background: "var(--zf-gradient)" }}
                >
                    {isResuming ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…</>
                    ) : (
                        <><Play className="h-3.5 w-3.5" /> Continue</>
                    )}
                </button>
                <button
                    onClick={() => onDelete(session.session_id)}
                    disabled={isDeleting || isResuming}
                    title="Delete"
                    className="flex items-center justify-center rounded-xl px-3 py-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                    style={{ border: "2px solid var(--zf-border)" }}
                >
                    {isDeleting
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2  className="h-3.5 w-3.5" />
                    }
                </button>
            </div>
        </div>
    );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
    const router = useRouter();

    const [authToken,  setAuthToken]  = useState<string | null>(null);
    const [user,       setUser]       = useState<any>(null);
    const [authLoading,setAuthLoading]= useState(true);

    const [sessions,   setSessions]   = useState<Session[]>([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState<string | null>(null);
    const [deleting,   setDeleting]   = useState<string | null>(null);
    const [resuming,   setResuming]   = useState<string | null>(null);

    // Auth
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setAuthToken(session?.access_token ?? null);
            setAuthLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null);
            setAuthToken(session?.access_token ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    // Redirect guests
    useEffect(() => {
        if (!authLoading && !user) router.push("/");
    }, [authLoading, user, router]);

    // Fetch sessions
    const fetchSessions = useCallback(async () => {
        if (!authToken) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/sessions", {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            if (!res.ok) throw new Error("Failed to fetch sessions");
            const data = await res.json();
            setSessions(data.sessions ?? []);
        } catch (err: any) {
            setError(err.message || "Failed to load your PRDs.");
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    useEffect(() => { if (authToken) fetchSessions(); }, [authToken, fetchSessions]);

    const handleContinue = (session: Session) => {
        setResuming(session.session_id);
        router.push(`/editor?session=${session.session_id}`);
    };

    const handleDelete = async (sessionId: string) => {
        if (!window.confirm("Delete this PRD? This cannot be undone.")) return;
        setDeleting(sessionId);
        try {
            await fetch(`/api/sessions?id=${sessionId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setSessions(prev => prev.filter(s => s.session_id !== sessionId));
        } catch {
            alert("Could not delete this PRD. Please try again.");
        } finally {
            setDeleting(null);
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen" style={{ background: "#F8FAFF" }}>
            <Navbar variant="light" />

            <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-1.5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                                 style={{ background: "var(--zf-gradient)" }}>
                                <LayoutDashboard className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My PRDs</h1>
                        </div>
                        <p className="ml-13 text-sm text-slate-500">
                            Pick up where you left off — all your generated documents in one place.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                        <button
                            onClick={fetchSessions}
                            disabled={loading}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border text-slate-400 transition-colors hover:bg-white hover:text-blue-600 disabled:opacity-40"
                            style={{ borderColor: "var(--zf-border)" }}
                            title="Refresh"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                        <button
                            onClick={() => router.push("/")}
                            className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:opacity-90 active:scale-95"
                            style={{ background: "var(--zf-gradient)" }}
                        >
                            <Plus className="h-4 w-4" />
                            New PRD
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                        <button onClick={fetchSessions} className="ml-auto font-bold underline">Retry</button>
                    </div>
                )}

                {/* Count */}
                {!loading && sessions.length > 0 && (
                    <p className="mb-5 text-sm text-slate-400">
                        {sessions.length} document{sessions.length !== 1 ? "s" : ""}
                    </p>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => <SessionSkeleton key={i} />)
                        : sessions.length === 0
                            ? <EmptyState onNew={() => router.push("/")} />
                            : sessions.map(session => (
                                <SessionCard
                                    key={session.session_id}
                                    session={session}
                                    onContinue={handleContinue}
                                    onDelete={handleDelete}
                                    deleting={deleting}
                                    resuming={resuming}
                                />
                            ))
                    }
                </div>
            </div>

            {/* Resuming overlay */}
            {resuming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center"
                     style={{ background: "rgba(248,250,255,0.85)", backdropFilter: "blur(12px)" }}>
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
                             style={{ background: "var(--zf-gradient)" }}>
                            <Loader2 className="h-7 w-7 animate-spin text-white" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">Loading your document…</p>
                    </div>
                </div>
            )}
        </div>
    );
}
