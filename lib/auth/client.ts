// Client-side auth utilities - Google OAuth + Email/Password
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Sign in with Google OAuth
 *
 * @param redirectPath Optional same-site path to return to after auth
 *   (e.g. "/directory/jane-doe"). Carried through the OAuth round-trip via
 *   the callback URL's `next` query param so deep links survive Google login.
 */
export async function signInWithGoogle(redirectPath?: string) {
  const supabase = createClient();

  // Get the current origin for redirect
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  // Only forward safe, same-site relative paths to avoid open redirects.
  const next =
    redirectPath && redirectPath.startsWith('/') && !redirectPath.startsWith('//')
      ? `?next=${encodeURIComponent(redirectPath)}`
      : '';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback${next}`,
      // PKCE flow is handled automatically by @supabase/ssr
      // The code_verifier will be stored in cookies
    },
  });

  return { data, error };
}

/**
 * Sign in with email and password
 * User must be in ADMIN_EMAILS list (checked in callback)
 */
export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

/**
 * Register new user with email and password
 * Note: User still needs to be in ADMIN_EMAILS list to access admin panel
 */
export async function signUpWithPassword(email: string, password: string, fullName?: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      // No email confirmation required per user request
      emailRedirectTo: undefined,
    },
  });

  return { data, error };
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const supabase = createClient();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?type=recovery`,
  });

  return { data, error };
}

/**
 * Update password (used in password reset flow)
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { data, error };
}

/**
 * Get current user
 */
export async function getUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}
