import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
    getSupabaseUser,
    getUserCredits,
    deductCredit,
    upsertUser,
    saveSession,
} from "@/lib/supabase-admin";

// Primary model with fallback  
const PRIMARY_MODEL  = "gemini-2.5-flash-lite";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `
You are ZoraFlow, an autonomous "Engineering Architect" AI. 
Your task is to take the user's project idea and generate a professional Product Requirements Document (PRD).

The PRD MUST be strictly formatted in Markdown and MUST include:
# [Project Name] - Product Requirements Document
## 1. Executive Summary
## 2. Target Audience
## 3. Core Features & Functional Requirements
## 4. Technical Constraints & Stack Considerations
## 5. User Stories
---
Maintain a clean, authoritative, and concise tone appropriate for technical documentation.
Do not wrap your response in markdown code blocks (\`\`\`markdown). Output raw markdown text.
`;

/* ── Model fallback ────────────────────────────────────────────────────────── */
async function generateWithFallback(prompt: string): Promise<string> {
    for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt.trim(),
                config: { systemInstruction, temperature: 0.7 },
            });
            const text = response.text;
            if (text) return text;
        } catch (err: any) {
            const msg = err?.message ?? "";
            const retryable = msg.includes("404") || msg.includes("not found") ||
                              msg.includes("RESOURCE_EXHAUSTED") || msg.includes("503");
            if (!retryable || model === FALLBACK_MODEL) throw err;
            console.warn(`[prd] ${model} failed, falling back to ${FALLBACK_MODEL}: ${msg.slice(0, 80)}`);
        }
    }
    throw new Error("All AI models failed to generate a response");
}

/* ── Route handler ─────────────────────────────────────────────────────────── */
export async function POST(request: Request) {
    try {
        const body  = await request.json().catch(() => ({}));
        const { prompt } = body as { prompt?: string };

        if (!prompt?.trim()) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // ── 1. Strict Auth ────────────────────────────────────────────────
        const authUser = await getSupabaseUser(request.headers.get("authorization"));
        if (!authUser) return NextResponse.json({ error: "Authentication required to generate PRDs. Please sign in." }, { status: 401 });

        // ── 2. Credit gate ──────────────────────────────────────────────────
        if (authUser) {
            await upsertUser(authUser.userId, authUser.email);
            const userCredits = await getUserCredits(authUser.userId);
            if (userCredits && userCredits.credits < 1) {
                return NextResponse.json(
                    { error: "You have no credits remaining. Please upgrade your plan.", credits: 0 },
                    { status: 402 }
                );
            }
        }

        // ── 3. Generate PRD ─────────────────────────────────────────────────
        const generatedMarkdown = await generateWithFallback(prompt);

        // ── 4. Deduct credit + save session ─────────────────────────────────
        let sessionId:        string | null = null;
        let creditsRemaining: number | null = null;

        if (authUser) {
            try {
                const { newBalance } = await deductCredit(
                    authUser.userId,
                    `PRD: ${prompt.slice(0, 60)}`
                );
                creditsRemaining = newBalance;
            } catch (e) {
                console.warn("[prd] Credit deduction failed (non-fatal):", e);
            }

            const title = prompt.length > 60 ? prompt.slice(0, 60) + "…" : prompt;
            sessionId = await saveSession({
                userId:         authUser.userId,
                title,
                prdMarkdown:    generatedMarkdown,
                userPrompt:     prompt,
                assistantReply: "Your PRD has been generated! Ask me to refine it, add sections, or answer questions.",
            });
        }

        return NextResponse.json({ markdown: generatedMarkdown, sessionId, creditsRemaining });

    } catch (error: any) {
        const msg  = error?.message ?? "Unknown error";
        const code = Number(error?.status ?? error?.code ?? 500);

        console.error("[prd] Error:", { msg, code, stack: error?.stack?.slice(0, 300) });

        if (msg.includes("Insufficient credits")) {
            return NextResponse.json({ error: msg }, { status: 402 });
        }
        if (msg.includes("RESOURCE_EXHAUSTED") || code === 429) {
            return NextResponse.json(
                { error: "AI quota exceeded. Please wait a minute and try again." },
                { status: 429 }
            );
        }
        if (msg.includes("API_KEY") || msg.includes("INVALID_ARGUMENT")) {
            return NextResponse.json(
                { error: "API key configuration error." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: msg || "Failed to generate PRD. Please try again." },
            { status: 500 }
        );
    }
}
