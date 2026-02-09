import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy-load clients to avoid build-time errors when env vars aren't available
// During build, Next.js analyzes routes but env vars may not be set yet
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time, env vars may not be available
  // Return a placeholder client if vars are missing (build will succeed, runtime will fail if actually used)
  if (!supabaseUrl || !supabaseAnonKey) {
    // Check if we're likely in a build context
    // Next.js sets NEXT_PHASE during build, or we can check if we're in a build script
    const isLikelyBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                              (typeof process.env.npm_lifecycle_event !== 'undefined' && 
                               process.env.npm_lifecycle_event === 'build');
    
    if (isLikelyBuildTime) {
      // Return a placeholder client during build to prevent errors
      // This won't be used, just prevents the module from crashing
      supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key');
      return supabaseClient;
    }
    
    // At runtime, throw if env vars are missing
    throw new Error("Missing Supabase environment variables");
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

// Client for client-side usage (subject to RLS)
// Use a getter function pattern to ensure lazy initialization
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
}) as SupabaseClient;

// Service role client for server-side API routes (bypasses RLS)
// Only use this in API routes, never expose to client
// Lazy-loaded to prevent client-side errors
export function getSupabaseAdmin() {
  // Only allow this on the server side
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin() can only be called on the server side');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // During build time, env vars may not be available
  // Return a placeholder client if vars are missing (build will succeed, runtime will fail if actually used)
  if (!supabaseUrl || !supabaseAnonKey) {
    // Check if we're likely in a build context
    const isLikelyBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                              (typeof process.env.npm_lifecycle_event !== 'undefined' && 
                               process.env.npm_lifecycle_event === 'build');
    
    if (isLikelyBuildTime) {
      // Return a placeholder client during build to prevent errors
      return createClient('https://placeholder.supabase.co', 'placeholder-key', {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    
    // At runtime, throw if env vars are missing
    throw new Error("Missing Supabase environment variables");
  }

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

