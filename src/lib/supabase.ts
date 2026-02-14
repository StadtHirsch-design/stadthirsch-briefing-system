import { createClient } from '@supabase/supabase-js';

// Check if we have the required env vars
const hasSupabaseConfig = 
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string';

// Create client only if config exists (for build-time safety)
export const supabase = hasSupabaseConfig 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : null as any; // Will be checked at runtime

// Server-side client with service role
const hasServiceRole = 
  hasSupabaseConfig &&
  typeof process.env.SUPABASE_SERVICE_ROLE_KEY === 'string';

export const supabaseAdmin = hasServiceRole
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  : null as any; // Will be checked at runtime

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => hasSupabaseConfig && hasServiceRole;
