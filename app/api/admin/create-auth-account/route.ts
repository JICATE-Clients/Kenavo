import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';

/**
 * POST /api/admin/create-auth-account
 *
 * Creates a Supabase Auth account for a single alumni profile.
 * Used for non-Gmail addresses (Yahoo, Hotmail, etc.) that cannot
 * use Google OAuth.
 *
 * Admin types the password manually. email_confirm: true means
 * the alumni can log in immediately — no verification email.
 */
export async function POST(request: NextRequest) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    const { email, password, profileId } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if auth account already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const alreadyExists = existingUsers?.users?.some(
      u => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (alreadyExists) {
      return NextResponse.json(
        { error: `Auth account already exists for ${email}` },
        { status: 409 }
      );
    }

    // Create Supabase Auth user — email_confirm:true skips verification
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error('Auth account creation error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Auth account created for ${email} (auth ID: ${data.user.id})`);

    return NextResponse.json({
      success: true,
      authUserId: data.user.id,
      email,
      message: `Login account created for ${email}`,
    });

  } catch (err: any) {
    console.error('create-auth-account error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
