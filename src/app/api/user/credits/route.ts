import { NextResponse } from "next/server";
import { getSupabaseUser, getUserCredits, upsertUser } from "@/lib/supabase-admin";

export async function GET(request: Request) {
    const authUser = await getSupabaseUser(request.headers.get("authorization"));
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await upsertUser(authUser.userId, authUser.email);
    const credits = await getUserCredits(authUser.userId);

    return NextResponse.json({
        credits: credits?.credits ?? 0,
        plan: credits?.plan ?? "free",
    });
}
