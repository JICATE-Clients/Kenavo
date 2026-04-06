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
      const isAdmin = adminEmails.includes(userEmail);

      if (isAdmin) {
        console.log('✅ Admin - redirecting to admin panel');
        return NextResponse.redirect(new URL('/admin-panel', request.url));
      }

      // Auto-provision app_users row if it doesn't exist yet
      // This covers Gmail/Google OAuth users and anyone not created via bulk-create
      if (data.user?.id) {
        const { data: existing } = await supabaseAdmin
          .from('app_users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existing) {
          await supabaseAdmin.from('app_users').insert({
            id: data.user.id,
            email: userEmail,
            role: 'user',
            has_directory_access: true,
            status: 'active',
          });
          console.log(`✅ Auto-provisioned app_users for ${userEmail}`);
        }
      }

      // Non-admin users go to directory
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
