import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * POST /api/auth/login
 *
 * Server-side email/password login proxy.
 * Routes the Supabase auth call through the Next.js server instead of
 * directly from the browser — avoids CORS/firewall issues that appear
 * when Supabase Site URL is configured for a production domain.
 *
 * Flow:
 *   Browser → POST /api/auth/login → Next.js server → Supabase Auth
 *   Supabase sets the session cookie server-side → browser gets cookie
 */

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again in 15 minutes.' },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Determine role for redirect hint
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    const isAdmin = adminEmails.includes(data.user?.email || '');

    // Auto-provision app_users row for email/password logins (non-admin)
    if (!isAdmin && data.user?.id) {
      const { data: existing } = await supabaseAdmin
        .from('app_users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existing) {
        await supabaseAdmin.from('app_users').insert({
          id: data.user.id,
          email: data.user.email ?? '',
          role: 'user',
          has_directory_access: true,
          status: 'active',
        });
        console.log(`✅ Auto-provisioned app_users for ${data.user.email}`);
      }
    }

    return NextResponse.json({
      success: true,
      isAdmin,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });

  } catch (err: any) {
    console.error('Login route error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
