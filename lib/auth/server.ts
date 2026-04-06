// Server-side auth utilities
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { fetchWithTimeout } from '@/lib/supabase-fetch';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: { fetch: fetchWithTimeout },
    }
  );
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

// Check if user is admin
export async function isAdmin() {
  const { user } = await getUser();

  if (!user) {
    return false;
  }

  // First, check email whitelist for backward compatibility
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  if (adminEmails.includes(user.email || '')) {
    return true;
  }

  // Then check app_users table for role = 'admin'
  // Use supabaseAdmin to bypass RLS policies
  try {
    const { data: appUser, error } = await supabaseAdmin
      .from('app_users')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (error || !appUser) {
      return false;
    }

    // User must have admin role and be active
    return appUser.role === 'admin' && appUser.status === 'active';
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
}

// Middleware helper for protecting routes
export async function requireAuth(request: NextRequest) {
  const { user } = await getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return null;
}

// Middleware helper for requiring admin role
export async function requireAdmin(request: NextRequest) {
  const { user } = await getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const admin = await isAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 403 }
    );
  }

  return null;
}
