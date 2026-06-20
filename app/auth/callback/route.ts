import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * AUTH CALLBACK ROUTE
 *
 * Handles Supabase auth callbacks including:
 * - OAuth logins (Google, etc.) with PKCE flow
 * - Password reset flows (type=recovery)
 * - Magic link logins
 *
 * Uses @supabase/ssr for proper cookie management.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');

  // Where to return the user after auth, if they came from a deep link
  // (e.g. /directory/<slug>). Only same-site relative paths are honored to
  // prevent open redirects.
  const nextParam = requestUrl.searchParams.get('next');
  const next =
    nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
      ? nextParam
      : null;

  console.log('Auth callback triggered');
  console.log('Type:', type);
  console.log('Code:', code ? 'present' : 'missing');

  // If we have an auth code (OAuth/PKCE flow), exchange it for a session
  if (code) {
    try {
      const cookieStore = await cookies();

      // Create Supabase SSR client with proper cookie handling
      // This is CRITICAL for PKCE flow - the code_verifier is stored in cookies
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              try {
                cookieStore.set({ name, value, ...options });
              } catch (error) {
                // Handle cookie setting errors in Edge runtime
                console.error('Error setting cookie:', error);
              }
            },
            remove(name: string, options: any) {
              try {
                cookieStore.set({ name, value: '', ...options });
              } catch (error) {
                // Handle cookie removal errors
                console.error('Error removing cookie:', error);
              }
            },
          },
        }
      );

      // Exchange code for session - SSR client automatically retrieves code_verifier from cookies
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('❌ Error exchanging code:', error);
        return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
      }

      console.log('✅ Code exchanged successfully');
      console.log('User:', data.user?.email);

      // Check if password recovery
      if (type === 'recovery') {
        console.log('Password recovery flow - redirecting to update-password');
        return NextResponse.redirect(new URL('/update-password', request.url));
      }

      const userEmail = data.user?.email || '';
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
      const isWhitelistAdmin = adminEmails.includes(userEmail);

      // Auto-provision app_users row if it doesn't exist yet, and read the
      // role so DB-promoted admins are also routed to the dashboard.
      // This covers Gmail/Google OAuth users and anyone not created via bulk-create.
      let isDbAdmin = false;
      if (!isWhitelistAdmin && data.user?.id) {
        const { data: existing } = await supabaseAdmin
          .from('app_users')
          .select('role, status')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existing) {
          await supabaseAdmin.from('app_users').insert({
            id: data.user.id,
            email: userEmail,
            role: 'user',
            has_directory_access: true,
            status: 'active',
          });
          console.log(`✅ Auto-provisioned app_users for ${userEmail}`);
        } else {
          isDbAdmin = existing.role === 'admin' && existing.status === 'active';
        }
      }

      // A deep-link destination (e.g. /directory/<slug>) wins over the default
      // landing page — the user explicitly tried to reach that page before login.
      if (next) {
        console.log(`✅ Redirecting to deep-link destination: ${next}`);
        return NextResponse.redirect(new URL(next, request.url));
      }

      if (isWhitelistAdmin || isDbAdmin) {
        console.log('✅ Admin - redirecting to admin panel');
        return NextResponse.redirect(new URL('/admin-panel', request.url));
      }

      // Non-admin users go to the directory (a normal website page).
      console.log('✅ Regular user - redirecting to directory');
      return NextResponse.redirect(new URL('/directory', request.url));

    } catch (error: any) {
      console.error('❌ Code exchange error:', error);
      return NextResponse.redirect(new URL('/login?error=server_error', request.url));
    }
  }

  // No code provided - redirect to login
  console.log('No code found - redirecting to login');
  return NextResponse.redirect(new URL('/login', request.url));
}
