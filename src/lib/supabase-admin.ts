/**
 * supabase-admin.ts
 * 
 * Server-side Supabase client using the SERVICE ROLE KEY.
 * This bypasses Row Level Security and should ONLY be used
 * in Next.js API routes (server-side), never in client components.
 * 
 * Provides:
 *  - getUserCredits()    — fetch current credit balance for a user
 *  - deductCredit()      — deduct 1 credit and log the transaction
 *  - giveCredits()       — add credits (for signups / top-ups)
 *  - saveSession()       — persist a new PRD generation session
 *  - updateSession()     — append chat messages to an existing session
 *  - listSessions()      — get recent sessions for a user
 *  - getSupabaseUser()   — verify a JWT token and return the user
 */

import { createClient } from "@supabase/supabase-js";

// ── Environment checks ────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    console.warn("[supabase-admin] NEXT_PUBLIC_SUPABASE_URL is not set");
}
if (!serviceRoleKey) {
    console.warn("[supabase-admin] SUPABASE_SERVICE_ROLE_KEY is not set — credit/session features disabled");
}

// ── Admin client (bypasses RLS) ───────────────────────────────────────────────
function getAdminClient() {
    if (!supabaseUrl || !serviceRoleKey) return null;
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface UserCredits {
    userId: string;
    credits: number;
    plan: string;
}

export interface Session {
    sessionId: string;
    userId: string;
    title: string;
    prdMarkdown: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    createdAt: string;
}

// ── Credit helpers ────────────────────────────────────────────────────────────

/**
 * Get a user's current credit balance.
 * Returns null if Supabase is not configured or user not found.
 */
export async function getUserCredits(userId: string): Promise<UserCredits | null> {
    const db = getAdminClient();
    if (!db) return null;

    try {
        const { data, error } = await db
            .from("users")
            .select("user_id, credits, plan")
            .eq("user_id", userId)
            .single();

        if (error || !data) return null;

        return {
            userId: data.user_id,
            credits: data.credits ?? 0,
            plan: data.plan ?? "free",
        };
    } catch (e) {
        console.error("[supabase-admin] getUserCredits error:", e);
        return null;
    }
}

/**
 * Deduct exactly 1 credit from the user.
 * Returns { success, newBalance } or throws if credit check fails.
 */
export async function deductCredit(
    userId: string,
    reason: string
): Promise<{ success: boolean; newBalance: number }> {
    const db = getAdminClient();
    if (!db) return { success: true, newBalance: 999 }; // graceful no-op when unconfigured

    const userCredits = await getUserCredits(userId);

    if (!userCredits) {
        // User row doesn't exist — create it with default credits then deduct
        await upsertUser(userId);
        const fresh = await getUserCredits(userId);
        if (!fresh || fresh.credits < 1) {
            throw new Error("Insufficient credits");
        }
        return deductCredit(userId, reason);
    }

    if (userCredits.credits < 1) {
        throw new Error("Insufficient credits. Please upgrade your plan or wait for the next reset.");
    }

    const newBalance = userCredits.credits - 1;

    const { error } = await db
        .from("users")
        .update({ credits: newBalance, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

    if (error) {
        console.error("[supabase-admin] deductCredit update error:", error);
        throw new Error("Failed to deduct credit");
    }

    // Log the transaction (non-fatal)
    db.from("credit_transactions")
        .insert({
            user_id: userId,
            amount: -1,
            transaction_type: "deduct",
            reason,
        })
        .then(({ error: txErr }) => {
            if (txErr) console.warn("[supabase-admin] credit_transaction log error:", txErr);
        });

    return { success: true, newBalance };
}

/**
 * Ensure a user row exists in public.users.
 * Called on first API hit in case the trigger hasn't fired yet.
 */
export async function upsertUser(
    userId: string,
    email?: string
): Promise<void> {
    const db = getAdminClient();
    if (!db) return;

    await db.from("users").upsert(
        {
            user_id: userId,
            email: email ?? null,
            credits: 5,
            plan: "free",
        },
        { onConflict: "user_id", ignoreDuplicates: true }
    );
}

/**
 * Add credits to a user (e.g. on first sign-up or top-up).
 */
export async function giveCredits(
    userId: string,
    amount: number,
    reason: string
): Promise<void> {
    const db = getAdminClient();
    if (!db) return;

    const current = await getUserCredits(userId);
    const currentBalance = current?.credits ?? 0;

    await db
        .from("users")
        .update({ credits: currentBalance + amount, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

    db.from("credit_transactions")
        .insert({
            user_id: userId,
            amount,
            transaction_type: "add",
            reason,
        })
        .then(() => { });
}

// ── Session helpers ───────────────────────────────────────────────────────────

/**
 * Save a new PRD generation session to Supabase.
 * Returns the new session_id or null on failure.
 */
export async function saveSession(params: {
    userId: string;
    title: string;
    prdMarkdown: string;
    userPrompt: string;
    assistantReply: string;
}): Promise<string | null> {
    const db = getAdminClient();
    if (!db) return null;

    const sessionId = crypto.randomUUID();
    const messages = [
        { role: "user", content: params.userPrompt },
        { role: "assistant", content: params.assistantReply },
    ];

    const { error } = await db.from("sessions").insert({
        session_id: sessionId,
        user_id: params.userId,
        title: params.title.slice(0, 120),
        prd_markdown: params.prdMarkdown,
        messages,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });

    if (error) {
        console.warn("[supabase-admin] saveSession error (non-fatal):", error);
        return null;
    }

    return sessionId;
}

/**
 * Append a new chat exchange to an existing session.
 */
export async function updateSession(params: {
    sessionId: string;
    userId: string;
    userMessage: string;
    assistantReply: string;
    updatedPrd?: string;
}): Promise<void> {
    const db = getAdminClient();
    if (!db) return;

    try {
        // Fetch current messages
        const { data } = await db
            .from("sessions")
            .select("messages")
            .eq("session_id", params.sessionId)
            .eq("user_id", params.userId)
            .single();

        const prevMessages: Array<{ role: string; content: string }> = data?.messages ?? [];
        const updatedMessages = [
            ...prevMessages,
            { role: "user", content: params.userMessage },
            { role: "assistant", content: params.assistantReply },
        ];

        const updatePayload: Record<string, unknown> = {
            messages: updatedMessages,
            updated_at: new Date().toISOString(),
        };
        if (params.updatedPrd) {
            updatePayload.prd_markdown = params.updatedPrd;
        }

        await db
            .from("sessions")
            .update(updatePayload)
            .eq("session_id", params.sessionId)
            .eq("user_id", params.userId);
    } catch (e) {
        console.warn("[supabase-admin] updateSession error (non-fatal):", e);
    }
}

/**
 * List the 20 most recent sessions for a user.
 */
export async function listSessions(userId: string): Promise<Session[]> {
    const db = getAdminClient();
    if (!db) return [];

    const { data, error } = await db
        .from("sessions")
        .select("session_id, user_id, title, prd_markdown, messages, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error || !data) return [];

    return data.map((row) => ({
        sessionId: row.session_id,
        userId: row.user_id,
        title: row.title ?? "",
        prdMarkdown: row.prd_markdown ?? "",
        messages: row.messages ?? [],
        createdAt: row.created_at,
    }));
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

/**
 * Verify a Supabase JWT (from Authorization: Bearer <token> header)
 * and return the authenticated user's ID and email.
 * Returns null if token is invalid or missing.
 */
export async function getSupabaseUser(
    authHeader: string | null
): Promise<{ userId: string; email: string | undefined } | null> {
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return null;

    const db = getAdminClient();
    if (!db) return null;

    try {
        const { data, error } = await db.auth.getUser(token);
        if (error || !data?.user) return null;

        return {
            userId: data.user.id,
            email: data.user.email,
        };
    } catch (e) {
        console.error("[supabase-admin] getSupabaseUser error:", e);
        return null;
    }
}
