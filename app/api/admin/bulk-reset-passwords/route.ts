import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';

export async function POST(request: NextRequest) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    const body = await request.json().catch(() => ({}));
    const password: string = body.password ?? '';

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const adminEmails = new Set(
      (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean)
    );

    const { data: authData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

    if (listErr) {
      return NextResponse.json(
        { error: 'Failed to list auth users: ' + listErr.message },
        { status: 500 }
      );
    }

    const results = {
      reset: [] as { userId: string; email: string }[],
      skippedAdmin: [] as { email: string }[],
      failed: [] as { email: string; reason: string }[],
    };

    for (const user of authData?.users ?? []) {
      const email = user.email?.toLowerCase().trim() ?? '';

      if (!email) {
        results.failed.push({ email: '', reason: 'no email' });
        console.error(`❌ Password reset failed for ${email}: no email`);
        continue;
      }

      if (adminEmails.has(email)) {
        results.skippedAdmin.push({ email });
        console.log(`⏭️ Skipped admin ${email}`);
        continue;
      }

      try {
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password });

        if (updateErr) {
          results.failed.push({ email, reason: updateErr.message });
          console.error(`❌ Password reset failed for ${email}: ${updateErr.message}`);
        } else {
          results.reset.push({ userId: user.id, email });
          console.log(`✅ Password reset for ${email}`);
        }
      } catch (err: any) {
        const reason = err?.message ?? String(err);
        results.failed.push({ email, reason });
        console.error(`❌ Password reset failed for ${email}: ${reason}`);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        reset: results.reset.length,
        skippedAdmin: results.skippedAdmin.length,
        failed: results.failed.length,
      },
      details: results,
      message: `Reset ${results.reset.length} passwords. Skipped ${results.skippedAdmin.length} admin(s). ${results.failed.length} failed.`,
    });

  } catch (err: any) {
    console.error('bulk-reset-passwords error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
