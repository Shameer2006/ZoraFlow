import { NextResponse } from "next/server";
import { GoogleGenAI, Content } from "@google/genai";
import { getSupabaseUser, updateSession } from "@/lib/supabase-admin";

const ai = new GoogleGenAI({});

export async function POST(request: Request) {
    try {
        const {
            messages,
            document,
            commandOnly,
            targetSection,
            sessionId,
        } = await request.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: "Messages are required" }, { status: 400 });
        }

        // ── 1. Strict Auth ─────────────────────────────────────────────────────
        const authHeader = request.headers.get("authorization");
        const authUser = await getSupabaseUser(authHeader);
        if (!authUser) return NextResponse.json({ error: "Authentication required to chat. Please sign in." }, { status: 401 });

        // ── 2. Build system instruction ───────────────────────────────────────
        const systemInstruction = `
You are ZoraFlow's PRD AI Assistant. You help users refine, rewrite, and modify their Product Requirements Documents (PRD).

You will receive the CURRENT PRD content, and the user's conversation/command.
If the user's request requires modifying the PRD, you MUST return the COMPLETE UPDATED PRD in Markdown format in the 'updatedDocument' field.
If the user's request is just a question and does not require modifying the PRD, leave 'updatedDocument' as null.
Always provide a friendly conversational response in the 'reply' field explaining what you did or answering the question.

Respond STRICTLY in JSON format matching this schema:
{
  "reply": "string (your conversational response)",
  "updatedDocument": "string (the complete updated markdown, or null if no changes)"
}

${targetSection
                ? `CRITICAL: The user has issued a command targeting a SPECIFIC section of the document.
TARGET SECTION TEXT: "${targetSection}"
You MUST apply the requested change ONLY to this specific target section. Keep the rest of the document EXACTLY the same.`
                : commandOnly
                    ? "CRITICAL: The user has issued an internal DOCUMENT COMMAND. You MUST apply the requested change to the document and return it."
                    : ""
            }

--- CURRENT PRD DOCUMENT ---
${document || "(Empty Document - The user hasn't generated one yet)"}
----------------------------
`;

        // ── 3. Build multi-turn contents for Gemini ───────────────────────────
        // Send full conversation history so Gemini has memory across turns
        const contents: Content[] = messages.map((msg: { role: string; content: string }) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        // ── 4. Call Gemini ────────────────────────────────────────────────────
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                temperature: 0.5,
            },
        });

        const textResponse = response.text;
        if (!textResponse) {
            throw new Error("Empty response from AI");
        }

        const result = JSON.parse(textResponse);

        // ── 5. Persist chat exchange to Supabase (non-fatal) ─────────────────
        if (authUser && sessionId) {
            const lastUserMsg = messages[messages.length - 1];
            updateSession({
                sessionId,
                userId: authUser.userId,
                userMessage: lastUserMsg.content,
                assistantReply: result.reply ?? "",
                updatedPrd: result.updatedDocument ?? undefined,
            }).catch((e) =>
                console.warn("[chat/route] updateSession failed (non-fatal):", e)
            );
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Chat Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process chat" },
            { status: 500 }
        );
    }
}
