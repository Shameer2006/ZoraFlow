"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { Suspense } from "react";

function CallbackInner() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const code  = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
            setStatus("error");
            setErrorMsg(decodeURIComponent(error));
            return;
        }

        if (!code) {
            // No code in URL — maybe session is already in localStorage
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    setStatus("success");
                    setTimeout(() => router.push("/"), 800);
                } else {
                    setStatus("error");
                    setErrorMsg("No authorization code found. Please try signing in again.");
                }
            });
            return;
        }

        // Exchange the PKCE code for a session — MUST run in the browser
        // because the code verifier is stored in localStorage by the client SDK
        supabase.auth.exchangeCodeForSession(code)
            .then(({ error: exchError }) => {
                if (exchError) {
                    console.error("[callback] exchangeCodeForSession:", exchError.message);
                    setStatus("error");
                    setErrorMsg(exchError.message);
                } else {
                    setStatus("success");
                    setTimeout(() => router.push("/"), 800);
                }
            });
    }, [searchParams, router]);

    return (
        <div
            className="flex min-h-screen flex-col items-center justify-center gap-6 px-4"
            style={{ background: "#F8FAFF" }}
        >
            {/* Logo */}
            <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg shadow-blue-500/25"
                style={{ background: "var(--zf-gradient)" }}
            >
                <Zap className="h-6 w-6 text-white" />
            </div>

            {status === "loading" && (
                <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-base font-semibold text-slate-800">Completing sign-in…</p>
                    <p className="text-sm text-slate-500">Setting up your ZoraFlow account</p>
                </div>
            )}

            {status === "success" && (
                <div className="flex flex-col items-center gap-3 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    <p className="text-base font-semibold text-slate-800">Signed in successfully!</p>
                    <p className="text-sm text-slate-500">Redirecting you now…</p>
                </div>
            )}

            {status === "error" && (
                <div className="flex flex-col items-center gap-4 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <div>
                        <p className="text-base font-semibold text-slate-800">Sign-in failed</p>
                        <p className="mt-1 max-w-sm text-sm text-slate-500">{errorMsg}</p>
                    </div>
                    <button
                        onClick={() => router.push("/auth")}
                        className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:opacity-90"
                        style={{ background: "var(--zf-gradient)" }}
                    >
                        Back to Sign In
                    </button>
                </div>
            )}
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center" style={{ background: "#F8FAFF" }}>
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        }>
            <CallbackInner />
        </Suspense>
    );
}
