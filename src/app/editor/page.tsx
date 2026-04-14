"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DocumentViewer, BlockComment } from "@/components/dashboard/document-viewer";
import { PrdChat }   from "@/components/dashboard/prd-chat";
import { StageNav }  from "@/components/pipeline/stage-nav";
import { StageSchema }from "@/components/pipeline/stage-schema";
import { StageBom }  from "@/components/pipeline/stage-bom";
import { Navbar }    from "@/components/layout/navbar";
import type { FlowStage, SchemaOutput, BomOutput } from "@/lib/project-types";
import { supabase }  from "@/lib/supabase";
import { Cpu, ArrowLeft } from "lucide-react";
import Link from "next/link";

/* ── Inner editor ─────────────────────────────────────────────────────────── */
function EditorInner() {
    const searchParams   = useSearchParams();
    const initialPrompt  = searchParams.get("prompt") ?? "";
    const resumeSession  = searchParams.get("session") ?? null;

    const [authToken,      setAuthToken]      = useState<string | null>(null);
    const [authResolved,   setAuthResolved]   = useState(false);
    const [markdown,       setMarkdown]       = useState<string>("");
    const [isGenerating,   setIsGenerating]   = useState<boolean>(false);
    const [comments,       setComments]       = useState<BlockComment[]>([]);
    const [activeStage,    setActiveStage]    = useState<FlowStage>(1);
    const [schemaData,     setSchemaData]     = useState<SchemaOutput | null>(null);
    const [bomData,        setBomData]        = useState<BomOutput | null>(null);
    const [isLoadingSchema,setIsLoadingSchema]= useState(false);
    const [isLoadingBom,   setIsLoadingBom]   = useState(false);
    const [sessionId,      setSessionId]      = useState<string | null>(resumeSession);
    const initialized = useRef(false);

    /* Auth */
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setAuthToken(session?.access_token ?? null);
            setAuthResolved(true);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setAuthToken(session?.access_token ?? null));
        return () => subscription.unsubscribe();
    }, []);

    const authHeaders = (): Record<string, string> =>
        authToken ? { Authorization: `Bearer ${authToken}` } : {};

    /* Auto-generate on mount */
    useEffect(() => {
        if (!authResolved || initialized.current) return;
        initialized.current = true;
        
        if (!authToken && initialPrompt) {
            // Guest intercept: Bounce to auth page instead of generating
            window.location.href = `/auth?redirect=/editor?prompt=${encodeURIComponent(initialPrompt)}`;
            return;
        }

        if (initialPrompt && !resumeSession)   handleGenerate(initialPrompt);
        else if (resumeSession)                loadSession(resumeSession);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authToken, authResolved]);

    const loadSession = async (sid: string) => {
        setIsGenerating(true);
        try {
            const res = await fetch(`/api/sessions/${sid}`, { headers: authHeaders() });
            if (!res.ok) throw new Error("Session not found");
            const data = await res.json();
            setMarkdown(data.prd_markdown ?? "");
            setSessionId(sid);
        } catch (err) {
            console.error("[editor] loadSession failed:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerate = async (prompt: string) => {
        setIsGenerating(true);
        setMarkdown(""); setComments([]); setSchemaData(null);
        setBomData(null); setSessionId(null); setActiveStage(1);
        try {
            const res  = await fetch("/api/generate/prd", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            if (res.status === 402) { setMarkdown(`**No credits remaining.**\n\n${data.error}`); return; }
            if (res.status === 401) { window.location.href = "/auth"; return; }
            if (!res.ok) throw new Error(data.error || "Failed to generate PRD");
            setMarkdown(data.markdown);
            if (data.sessionId) setSessionId(data.sessionId);
        } catch (err: any) {
            setMarkdown(`**Error:** ${err.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateSchema = async () => {
        setIsLoadingSchema(true); setActiveStage(2); setSchemaData(null);
        try {
            const res  = await fetch("/api/generate/schema", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({ prd: markdown }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");
            setSchemaData(data);
        } catch (err: any) { console.error(err); }
        finally { setIsLoadingSchema(false); }
    };

    const handleGenerateBom = async () => {
        setIsLoadingBom(true); setActiveStage(3); setBomData(null);
        try {
            const res  = await fetch("/api/generate/bom", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({ prd: markdown, projectType: schemaData?.projectType }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");
            setBomData(data);
        } catch (err: any) { console.error(err); }
        finally { setIsLoadingBom(false); }
    };

    const updateMarkdown = (val: string) => { setMarkdown(val); setComments([]); };
    const hasDocument = !!markdown;

    return (
        <div className="flex h-screen flex-col overflow-hidden" style={{ background: "var(--zf-dark)" }}>
            <Navbar variant="transparent" />

            {hasDocument && (
                <StageNav
                    activeStage={activeStage}
                    onStageClick={setActiveStage}
                    hasSchema={!!schemaData}
                    hasBom={!!bomData}
                    onGenerateSchema={handleGenerateSchema}
                    onGenerateBom={handleGenerateBom}
                    isLoadingSchema={isLoadingSchema}
                    isLoadingBom={isLoadingBom}
                />
            )}

            <div className="flex min-h-0 flex-1">

                {/* Empty — no prompt */}
                {!hasDocument && !isGenerating && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4 text-center">
                        <div
                            className="flex h-16 w-16 items-center justify-center rounded-2xl"
                            style={{ background: "rgba(124,58,237,0.08)", border: "2px dashed rgba(124,58,237,0.3)" }}
                        >
                            <Cpu className="h-8 w-8 text-violet-400" />
                        </div>
                        <p className="text-base font-semibold text-slate-300">No prompt received.</p>
                        <Link
                            href="/"
                            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition-all hover:opacity-90"
                            style={{ background: "var(--zf-gradient)" }}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to home
                        </Link>
                    </div>
                )}

                {/* Generating state */}
                {!hasDocument && isGenerating && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
                        <div
                            className="flex h-20 w-20 items-center justify-center rounded-3xl"
                            style={{ background: "var(--zf-gradient)", boxShadow: "0 16px 40px rgba(124,58,237,0.35)" }}
                        >
                            <Cpu className="h-9 w-9 animate-pulse text-white" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-extrabold text-white">ZoraFlow is architecting your PRD…</p>
                            <p className="mt-2 text-sm text-slate-400">Analyzing your idea and structuring requirements</p>
                        </div>
                        <div className="flex gap-2">
                            {["#7C3AED", "#C084FC", "#8B5CF6"].map((c, i) => (
                                <span
                                    key={i}
                                    className="dot-pulse h-2.5 w-2.5"
                                    style={{ background: c }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Stage 1 — PRD chat + viewer */}
                {hasDocument && activeStage === 1 && (
                    <>
                        <div
                            className="flex h-full w-[380px] shrink-0 flex-col lg:w-[420px] xl:w-[460px]"
                            style={{ borderRight: "1px solid var(--zf-border)" }}
                        >
                            <PrdChat
                                markdown={markdown}
                                onUpdateMarkdown={updateMarkdown}
                                onGenerate={handleGenerate}
                                isGenerating={isGenerating}
                                comments={comments}
                                authToken={authToken}
                                sessionId={sessionId}
                            />
                        </div>
                        <div className="flex-1 overflow-hidden bg-[#050510] p-6 md:p-8">
                            <DocumentViewer
                                markdown={markdown}
                                isLoading={isGenerating}
                                onUpdateMarkdown={updateMarkdown}
                                comments={comments}
                                onCommentsChange={setComments}
                            />
                        </div>
                    </>
                )}

                {/* Stage 2 */}
                {hasDocument && activeStage === 2 && (
                    <div className="flex-1 overflow-auto px-6 py-8 md:px-10">
                        <StageSchema
                            schemaData={schemaData}
                            isLoading={isLoadingSchema}
                            onRegenerate={handleGenerateSchema}
                        />
                    </div>
                )}

                {/* Stage 3 */}
                {hasDocument && activeStage === 3 && (
                    <div className="flex-1 overflow-auto px-6 py-8 md:px-10">
                        <StageBom
                            bomData={bomData}
                            isLoading={isLoadingBom}
                            onRegenerate={handleGenerateBom}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function EditorPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center" style={{ background: "var(--zf-dark)" }}>
                <div
                    className="h-10 w-10 rounded-full border-4 border-t-transparent"
                    style={{ borderColor: "#DDD6FE", borderTopColor: "#7C3AED", animation: "spin 0.7s linear infinite" }}
                />
            </div>
        }>
            <EditorInner />
        </Suspense>
    );
}
