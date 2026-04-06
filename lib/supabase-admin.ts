import { createClient } from '@supabase/supabase-js';
import { validateSupabaseEnv } from './validate-env';
import { fetchWithTimeout } from './supabase-fetch';

// Validate environment variables on module load (server-side only)
if (typeof window === 'undefined') {
  validateSupabaseEnv();
}

/**
 * Supabase Admin Client
 *
 * This client uses the SERVICE ROLE KEY which bypasses Row Level Security (RLS).
 *
 * ⚠️ WARNING: This client has FULL DATABASE ACCESS
 * - Only use in server-side API routes under /api/admin/
 * - Never expose this client to the frontend
 * - Never use in client components
 *
 * Use cases:
 * - Admin panel operations (create, update, delete profiles)
 * - Bulk operations (bulk upload, bulk update)
 * - Operations that need to bypass RLS policies
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: { fetch: fetchWithTimeout }
  }
);
