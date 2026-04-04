"use client";

/**
 * AuthContext.tsx
 *
 * Ported from the reference hug-pdf AuthContext.jsx — adapted to Next.js / TypeScript.
 * Provides:
 *  - user         : DB user row (with credits, plan)
 *  - session      : raw Supabase session
 *  - token        : convenience shortcut for session.access_token
 *  - loading      : true until first auth check completes
 *  - login()      : email+password sign-in
 *  - register()   : email+password sign-up (sends verification email)
 *  - loginWithGoogle() : Supabase OAuth flow
 *  - logout()     : sign out + clear state
 *  - refreshUser(): re-fetch user credits from /api/auth/me
 *  - getToken()   : always returns the freshest access token
 */

import React, {
    createContext, useContext, useState, useEffect,
    useCallback, useRef, ReactNode
} from "react";
import { supabase } from "@/lib/supabase";

/* ── Types ─────────────────────────────────────────────────────────────────── */
export interface ZoraUser {
    user_id:       string;
    email:         string | undefined;
    credits:       number;
    plan:          string;
    early_adopter?: boolean;
    loading?:      boolean;
    error?:        boolean;
}

interface AuthContextValue {
    user:             ZoraUser | null;
    session:          any;
    token:            string | null;
    loading:          boolean;
    login:            (email: string, password: string) => Promise<void>;
    register:         (email: string, password: string) => Promise<void>;
    loginWithGoogle:  () => Promise<void>;
    logout:           () => Promise<void>;
    refreshUser:      () => Promise<void>;
    getToken:         () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}

/* ── Provider ──────────────────────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user,        setUser]        = useState<ZoraUser | null>(null);
    const [session,     setSession]     = useState<any>(null);
    const [loading,     setLoading]     = useState(true);
    const [initialized, setInitialized] = useState(false);

    const tokenRefreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* ── Sync user row to DB (upsert via /api/auth/sync) ────────────────────── */
    const syncUserToBackend = useCallback(async (supabaseUser: any): Promise<ZoraUser | null> => {
        if (!supabaseUser) return null;
        try {
            // Optimistic: show user immediately while we fetch db row
            const { data: existing, error } = await supabase
                .from("users")
                .select("*")
                .eq("user_id", supabaseUser.id)
                .maybeSingle();

            if (error) throw error;

            if (!existing) {
                // First login — call server-side sync to create row with credits
                const { data: session } = await supabase.auth.getSession();
                if (session.session?.access_token) {
                    await fetch("/api/auth/sync", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${session.session.access_token}`,
                        },
                    });
                }
                // Refetch after creation
                const { data: created } = await supabase
                    .from("users")
                    .select("*")
                    .eq("user_id", supabaseUser.id)
                    .maybeSingle();

                return created ?? {
                    user_id: supabaseUser.id,
                    email: supabaseUser.email,
                    credits: 5,
                    plan: "free",
                };
            }

            return existing;
        } catch (err) {
            console.error("[AuthContext] syncUserToBackend error:", err);
            return {
                user_id: supabaseUser.id,
                email:   supabaseUser.email,
                credits: 0,
                plan:    "free",
                error:   true,
            };
        }
    }, []);

    /* ── Initialize auth on mount ───────────────────────────────────────────── */
    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            try {
                // With implicit flow, Google redirects to /#access_token=…
                // Give the Supabase SDK time to detect and parse the hash token
                // before we call getSession() — otherwise we'd miss the new session.
                if (typeof window !== "undefined") {
                    const hash = window.location.hash;
                    if (hash && (hash.includes("access_token") || hash.includes("refresh_token"))) {
                        // Wait for SDK to process the hash and store the session
                        await new Promise(r => setTimeout(r, 1200));
                        // Clean up the hash from the URL (cosmetic)
                        window.history.replaceState(null, "", window.location.pathname + window.location.search);
                    }
                }

                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) console.error("[AuthContext] getSession error:", error);

                if (isMounted) {
                    if (session?.user) {
                        setSession(session);
                        // Optimistic update to prevent flicker
                        setUser({
                            user_id: session.user.id,
                            email:   session.user.email,
                            credits: 0,
                            plan:    "free",
                            loading: true,
                        });
                        const userData = await syncUserToBackend(session.user);
                        if (isMounted && userData) setUser(userData);
                    }
                    setInitialized(true);
                    setLoading(false);
                }
            } catch (err) {
                console.error("[AuthContext] init error:", err);
                if (isMounted) { setInitialized(true); setLoading(false); }
            }
        };

        initializeAuth();
        return () => { isMounted = false; };
    }, [syncUserToBackend]);


    /* ── Auth state change listener ─────────────────────────────────────────── */
    useEffect(() => {
        if (!initialized) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            switch (event) {
                case "SIGNED_IN":
                    setSession(newSession);
                    if (newSession?.user) {
                        const userData = await syncUserToBackend(newSession.user);
                        setUser(userData);
                    }
                    break;
                case "SIGNED_OUT":
                    setSession(null);
                    setUser(null);
                    break;
                case "TOKEN_REFRESHED":
                    setSession(newSession);
                    break;
                case "USER_UPDATED":
                    setSession(newSession);
                    if (newSession?.user) {
                        const userData = await syncUserToBackend(newSession.user);
                        setUser(userData);
                    }
                    break;
                default:
                    if (newSession) setSession(newSession);
            }
        });

        return () => subscription.unsubscribe();
    }, [initialized, syncUserToBackend]);

    /* ── Auto token refresh (5 min before expiry) ───────────────────────────── */
    useEffect(() => {
        if (!session?.expires_at) return;
        if (tokenRefreshTimeout.current) clearTimeout(tokenRefreshTimeout.current);

        const expiresIn = session.expires_at - Math.floor(Date.now() / 1000);
        const refreshIn = Math.max(0, (expiresIn - 300) * 1000);

        tokenRefreshTimeout.current = setTimeout(async () => {
            try {
                const { data, error } = await supabase.auth.refreshSession();
                if (error) {
                    const critical = ["invalid_grant", "invalid_token", "refresh_token_not_found"];
                    if (critical.some(e => error.message?.toLowerCase().includes(e)) || error.status === 401) {
                        await supabase.auth.signOut();
                    }
                } else if (data?.session) {
                    setSession(data.session);
                }
            } catch { /* network error — keep user logged in */ }
        }, refreshIn);

        return () => { if (tokenRefreshTimeout.current) clearTimeout(tokenRefreshTimeout.current); };
    }, [session?.expires_at]);

    /* ── Visibility change — re-validate session when tab becomes active ─────── */
    useEffect(() => {
        const handler = async () => {
            if (document.visibilityState !== "visible" || !session) return;
            const { data: { session: current } } = await supabase.auth.getSession();
            if (!current && session) { setSession(null); setUser(null); }
            else if (current && !session) {
                setSession(current);
                if (current.user) {
                    const userData = await syncUserToBackend(current.user);
                    setUser(userData);
                }
            }
        };
        document.addEventListener("visibilitychange", handler);
        return () => document.removeEventListener("visibilitychange", handler);
    }, [session, syncUserToBackend]);

    /* ── Auth actions ───────────────────────────────────────────────────────── */
    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const register = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: typeof window !== "undefined"
                    ? `${window.location.origin}/auth`
                    : undefined,
            },
        });
        if (error) throw error;
    };

    const loginWithGoogle = async () => {
        const origin = typeof window !== "undefined"
            ? window.location.origin
            : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                // With implicit flow, Supabase returns the token in the URL hash
                // e.g. http://localhost:3000/#access_token=...
                // The browser-side Supabase SDK detects this automatically via detectSessionInUrl: true
                redirectTo: `${origin}/`,
                queryParams: {
                    access_type: "offline",
                    prompt:      "consent",
                },
            },
        });
        if (error) throw error;
    };





    const logout = useCallback(async () => {
        try {
            await supabase.auth.signOut();
        } finally {
            setSession(null);
            setUser(null);
        }
    }, []);

    /* Refresh user credits from server */
    const refreshUser = useCallback(async () => {
        const { data: { session: current } } = await supabase.auth.getSession();
        if (!current?.access_token) return;
        try {
            const res = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${current.access_token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (err) {
            console.error("[AuthContext] refreshUser error:", err);
        }
    }, []);

    const getToken = useCallback(async (): Promise<string | null> => {
        const { data: { session: current } } = await supabase.auth.getSession();
        return current?.access_token ?? null;
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            session,
            token:    session?.access_token ?? null,
            loading,
            login,
            register,
            loginWithGoogle,
            logout,
            refreshUser,
            getToken,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
