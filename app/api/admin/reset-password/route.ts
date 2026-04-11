import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';

/**
 * POST /api/admin/reset-password
 *
 * Resets a single user's Supabase Auth password by email.
 * Admin-only route.
 */

export async function POST(request: NextRequest) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    const body = await request.json().catch(() => ({}));
    const rawEmail: string = body.email ?? '';
    const password: string = body.password ?? '';
    const email = rawEmail.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const { data: authData, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

    if (listError) {
      console.error(`❌ Password reset failed for ${email}: ${listError.message}`);
      return NextResponse.json(
        { error: listError.message },
        { status: 500 }
      );
    }

    const user = (authData?.users ?? []).find(
      u => u.email?.toLowerCase() === email
    );

    if (!user) {
      console.warn(`⚠️ Password reset requested for unknown email: ${email}`);
      return NextResponse.json(
        { error: 'No auth account found for this email' },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password });

    if (error) {
      console.error(`❌ Password reset failed for ${email}: ${error.message}`);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Password reset for ${email}`);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
    });

  } catch (err: any) {
    console.error('reset-password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
