import { NextResponse } from "next/server";
import { getSupabaseUser, getUserCredits } from "@/lib/supabase-admin";

/**
 * GET /api/auth/me
 *
 * Returns fresh user data (credits, plan) for the authenticated user.
 * Used by AuthContext.refreshUser() on a 30-second interval.
 */
export async function GET(request: Request) {
    const authUser = await getSupabaseUser(request.headers.get("authorization"));
    if (!authUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credits = await getUserCredits(authUser.userId);

    return NextResponse.json({
        user_id: authUser.userId,
        email:   authUser.email,
        credits: credits?.credits ?? 0,
        plan:    credits?.plan    ?? "free",
    });
}
