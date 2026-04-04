import { NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/supabase-admin";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// GET /api/sessions/[id] — fetch a single session for resuming
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authUser = await getSupabaseUser(request.headers.get("authorization"));
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: sessionId } = await params;

    const db = getAdminClient();
    if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

    const { data, error } = await db
        .from("sessions")
        .select("session_id, user_id, title, prd_markdown, messages, created_at, updated_at")
        .eq("session_id", sessionId)
        .eq("user_id", authUser.userId) // enforce ownership
        .single();

    if (error || !data) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(data);
}
