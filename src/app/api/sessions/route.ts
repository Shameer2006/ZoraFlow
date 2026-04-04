import { NextResponse } from "next/server";
import { getSupabaseUser } from "@/lib/supabase-admin";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// GET /api/sessions — list sessions for the authenticated user
export async function GET(request: Request) {
    const authUser = await getSupabaseUser(request.headers.get("authorization"));
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getAdminClient();
    if (!db) return NextResponse.json({ sessions: [] });

    const { data, error } = await db
        .from("sessions")
        .select("session_id, title, created_at, updated_at")
        .eq("user_id", authUser.userId)
        .order("updated_at", { ascending: false })
        .limit(50);

    if (error) {
        console.error("[sessions/GET]", error);
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }

    return NextResponse.json({ sessions: data ?? [] });
}

// DELETE /api/sessions?id=<session_id> — delete a session
export async function DELETE(request: Request) {
    const authUser = await getSupabaseUser(request.headers.get("authorization"));
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");
    if (!sessionId) return NextResponse.json({ error: "Session ID required" }, { status: 400 });

    const db = getAdminClient();
    if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

    const { error } = await db
        .from("sessions")
        .delete()
        .eq("session_id", sessionId)
        .eq("user_id", authUser.userId); // ensure ownership

    if (error) {
        console.error("[sessions/DELETE]", error);
        return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
