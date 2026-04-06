import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';

/**
 * POST /api/admin/backfill-app-users
 *
 * One-time backfill: creates app_users rows for all auth.users who
 * don't have one yet. Sets has_directory_access=true, status=active.
 * Safe to run multiple times (uses ON CONFLICT DO NOTHING via upsert).
 */
export async function POST() {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    // Get all auth users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (authError) {
      return NextResponse.json({ error: 'Failed to list auth users: ' + authError.message }, { status: 500 });
    }

    const authUsers = authData?.users ?? [];

    // Get existing app_users IDs
    const { data: existingUsers, error: existingError } = await supabaseAdmin
      .from('app_users')
      .select('id');

    if (existingError) {
      return NextResponse.json({ error: 'Failed to query app_users: ' + existingError.message }, { status: 500 });
    }

    const existingIds = new Set((existingUsers ?? []).map((u: { id: string }) => u.id));

    // Build rows to insert
    const toInsert = authUsers
      .filter(u => !existingIds.has(u.id) && u.email)
      .map(u => ({
        id: u.id,
        email: u.email!,
        role: 'user' as const,
        has_directory_access: true,
        status: 'active' as const,
      }));

    if (toInsert.length === 0) {
      return NextResponse.json({
        success: true,
        inserted: 0,
        message: 'All auth users already have app_users rows.',
      });
    }

    const { error: insertError } = await supabaseAdmin
      .from('app_users')
      .insert(toInsert);

    if (insertError) {
      return NextResponse.json({ error: 'Insert failed: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      inserted: toInsert.length,
      message: `✅ Backfilled ${toInsert.length} users with directory access.`,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
