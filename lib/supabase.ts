import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client for client-side usage (subject to RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for server-side API routes (bypasses RLS)
// Only use this in API routes, never expose to client
// Lazy-loaded to prevent client-side errors
export function getSupabaseAdmin() {
  // Only allow this on the server side
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin() can only be called on the server side');
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    // In development, fall back to anon key with a warning
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set. API routes may fail due to RLS.');
      return createClient(supabaseUrl, supabaseAnonKey);
    }
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for API routes. Please add it to your environment variables.");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

