import { NextResponse } from "next/server";
import { getSupabaseUser, upsertUser, getUserCredits, giveCredits } from "@/lib/supabase-admin";

/**
 * POST /api/auth/sync
 *
 * Called by AuthContext on first login to create the user row in public.users
 * and award the new-user credit bonus. Safe to call multiple times (idempotent).
 */
export async function POST(request: Request) {
    const authUser = await getSupabaseUser(request.headers.get("authorization"));
    if (!authUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Check if user already has credits (existing user — do not give bonus again)
        const existing = await getUserCredits(authUser.userId);

        if (!existing) {
            // Brand new user — create row and give 5 starter credits
            await upsertUser(authUser.userId, authUser.email);
            await giveCredits(authUser.userId, 5, "new_user_bonus");
            console.log(`[auth/sync] Created new user ${authUser.email} with 5 credits`);
        } else {
            // Existing user — just ensure the row is up to date
            await upsertUser(authUser.userId, authUser.email);
        }

        const credits = await getUserCredits(authUser.userId);
        return NextResponse.json({
            user_id: authUser.userId,
            email:   authUser.email,
            credits: credits?.credits ?? 0,
            plan:    credits?.plan    ?? "free",
        });
    } catch (err: any) {
        console.error("[auth/sync] error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
