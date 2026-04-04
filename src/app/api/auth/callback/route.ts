import { NextResponse } from "next/server";

/**
 * GET /api/auth/callback
 *
 * Supabase sends the OAuth code here after Google sign-in.
 * We immediately forward to the CLIENT-SIDE /auth/callback page,
 * which has access to localStorage (where the PKCE code verifier lives).
 *
 * NOTE: Do NOT try to call exchangeCodeForSession() here — this runs
 * server-side and cannot access the browser's localStorage.
 */
export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code       = requestUrl.searchParams.get("code");
    const error      = requestUrl.searchParams.get("error");
    const origin     = requestUrl.origin;

    const params = new URLSearchParams();
    if (code)  params.set("code",  code);
    if (error) params.set("error", error);

    // Forward to the client-side page that can access localStorage
    return NextResponse.redirect(`${origin}/auth/callback?${params.toString()}`);
}
