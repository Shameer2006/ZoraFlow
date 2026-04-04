import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? "https://placeholder.supabase.co";
const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "placeholder-anon-key";

export const isSupabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Use implicit flow (token in URL hash) — avoids the PKCE cookie-sharing
        // issue that requires @supabase/ssr. The browser SDK handles hash tokens natively.
        flowType:           "implicit",
        autoRefreshToken:   true,
        detectSessionInUrl: true,
        persistSession:     true,
    },
});


