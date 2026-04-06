import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';

/**
 * POST /api/admin/bulk-create-auth-accounts
 *
 * Creates Supabase Auth accounts for ALL profiles that:
 *   1. Have a non-Gmail email address
 *   2. Don't already have an auth account
 *
 * Gmail addresses are intentionally skipped — those alumni use
 * Google OAuth instead of email+password.
 *
 * Each created account receives a unique randomly generated password
 * returned in the response so the admin can distribute credentials.
 */

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(request: NextRequest) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    // Read the password from request body
    const body = await request.json().catch(() => ({}));
    const password: string = body.password ?? '';

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    // 1. Load all profiles that have an email
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email')
      .not('email', 'is', null)
      .neq('email', '');

    if (profilesError) {
      return NextResponse.json(
        { error: 'Failed to load profiles: ' + profilesError.message },
        { status: 500 }
      );
    }

    // 2. Load all existing Supabase Auth users to find who already has an account
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const existingEmails = new Set(
      (authData?.users ?? []).map(u => u.email?.toLowerCase())
    );

    // 3. Process each profile
    const results = {
      created: [] as { profileId: number; name: string; email: string; password: string }[],
      skippedGmail: [] as { profileId: number; name: string; email: string }[],
      skippedExists: [] as { profileId: number; name: string; email: string }[],
      skippedInvalidEmail: [] as { profileId: number; name: string; email: string }[],
      failed: [] as { profileId: number; name: string; email: string; reason: string }[],
    };

    for (const profile of profiles ?? []) {
      const email = profile.email?.trim().toLowerCase();

      if (!email || !email.includes('@')) {
        results.skippedInvalidEmail.push({ profileId: profile.id, name: profile.name, email: profile.email });
        continue;
      }

      // Skip Gmail — those use Google OAuth
      if (email.endsWith('@gmail.com')) {
        results.skippedGmail.push({ profileId: profile.id, name: profile.name, email: profile.email });
        continue;
      }

      // Skip if auth account already exists
      if (existingEmails.has(email)) {
        results.skippedExists.push({ profileId: profile.id, name: profile.name, email: profile.email });
        continue;
      }

      // Create auth account with the admin-specified password
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: profile.email,
        password,
        email_confirm: true, // No verification email — they can log in immediately
      });

      if (error) {
        console.error(`❌ Failed to create account for ${profile.email}:`, error.message);
        results.failed.push({
          profileId: profile.id,
          name: profile.name,
          email: profile.email,
          reason: error.message,
        });
      } else {
        console.log(`✅ Created account for ${profile.email} (${profile.name})`);
        results.created.push({ profileId: profile.id, name: profile.name, email: profile.email, password });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        created: results.created.length,
        skippedGmail: results.skippedGmail.length,
        skippedAlreadyExists: results.skippedExists.length,
        skippedInvalidEmail: results.skippedInvalidEmail.length,
        failed: results.failed.length,
      },
      details: results,
      message: `Created ${results.created.length} accounts. Skipped ${results.skippedGmail.length} Gmail (use Google OAuth). ${results.skippedExists.length} already existed.`,
    });

  } catch (err: any) {
    console.error('bulk-create-auth-accounts error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
