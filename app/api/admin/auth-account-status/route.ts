import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';

/**
 * GET /api/admin/auth-account-status
 *
 * Returns all profiles enriched with their auth account status:
 *   - "gmail"    → has @gmail.com address → uses Google OAuth
 *   - "has_login" → has a Supabase Auth account (email+password)
 *   - "no_login"  → no auth account yet (needs admin to create one)
 *   - "no_email"  → profile has no email at all
 *
 * Used by the admin panel Auth Accounts tab to show status badges
 * and drive individual / bulk account creation.
 */
export async function GET() {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    // 1. Load all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, year_graduated')
      .order('name', { ascending: true });

    if (profilesError) {
      return NextResponse.json(
        { error: 'Failed to load profiles: ' + profilesError.message },
        { status: 500 }
      );
    }

    // 2. Load all existing Supabase Auth users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (authError) {
      return NextResponse.json(
        { error: 'Failed to load auth users: ' + authError.message },
        { status: 500 }
      );
    }

    // Build a Set of emails that have auth accounts (lowercase for comparison)
    const authEmails = new Set(
      (authData?.users ?? []).map(u => u.email?.toLowerCase()).filter(Boolean)
    );

    // 3. Enrich each profile with auth status
    const enriched = (profiles ?? []).map(profile => {
      const email = profile.email?.trim().toLowerCase();

      let authStatus: 'gmail' | 'has_login' | 'no_login' | 'no_email';

      if (!email) {
        authStatus = 'no_email';
      } else if (email.endsWith('@gmail.com')) {
        authStatus = 'gmail';
      } else if (authEmails.has(email)) {
        authStatus = 'has_login';
      } else {
        authStatus = 'no_login';
      }

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email ?? null,
        year_graduated: profile.year_graduated ?? null,
        authStatus,
      };
    });

    // 4. Build summary counts
    const summary = {
      total: enriched.length,
      gmail: enriched.filter(p => p.authStatus === 'gmail').length,
      has_login: enriched.filter(p => p.authStatus === 'has_login').length,
      no_login: enriched.filter(p => p.authStatus === 'no_login').length,
      no_email: enriched.filter(p => p.authStatus === 'no_email').length,
    };

    return NextResponse.json({ profiles: enriched, summary });

  } catch (err: any) {
    console.error('auth-account-status error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
