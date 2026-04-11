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

    // Auto-provision app_users row for email/password logins (non-admin).
    // Best-effort: a failure here must NOT fail the login response, because
    // signInWithPassword above already succeeded and the session cookie is set.
    // On Vercel Hobby a cold-start supabaseAdmin round-trip can exceed the 8s
    // fetchWithTimeout and throw AbortError — swallow it and let the client
    // proceed. The directory no longer enforces has_directory_access for
    // viewing, so a missing app_users row is non-blocking.
    if (!isAdmin && data.user?.id) {
      try {
        const { data: existing } = await supabaseAdmin
          .from('app_users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existing) {
          const { error: insertError } = await supabaseAdmin.from('app_users').insert({
            id: data.user.id,
            email: data.user.email ?? '',
            role: 'user',
            has_directory_access: true,
            status: 'active',
          });
          if (insertError) {
            console.warn(`⚠️ app_users auto-provision insert failed for ${data.user.email}:`, insertError.message);
          } else {
            console.log(`✅ Auto-provisioned app_users for ${data.user.email}`);
          }
        }
      } catch (provisionErr: any) {
        console.warn(`⚠️ app_users auto-provision skipped for ${data.user.email}:`, provisionErr?.message ?? provisionErr);
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
