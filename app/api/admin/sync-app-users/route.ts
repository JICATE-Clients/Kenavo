import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';

/**
 * POST /api/admin/sync-app-users
 *
 * Backfill app_users rows for all Supabase Auth users that don't have one yet.
 * Run this once after bulk-creating auth accounts to grant directory access.
 */
export async function POST() {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    // 1. Get all Supabase Auth users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (authError) {
      return NextResponse.json({ error: 'Failed to list auth users: ' + authError.message }, { status: 500 });
    }

    // 2. Get existing app_users IDs
    const { data: existing } = await supabaseAdmin.from('app_users').select('id');
    const existingIds = new Set((existing ?? []).map((u: { id: string }) => u.id));

    // 3. Find auth users missing from app_users
    const toInsert = (authData?.users ?? [])
      .filter(u => !existingIds.has(u.id) && u.email)
      .map(u => ({
        id: u.id,
        email: u.email!,
        role: 'user' as const,
        has_directory_access: true,
        status: 'active' as const,
      }));

    if (toInsert.length === 0) {
      return NextResponse.json({ message: 'All auth users already have app_users rows.', synced: 0 });
    }

    // 4. Batch insert
    const { error: insertError } = await supabaseAdmin
      .from('app_users')
      .upsert(toInsert, { onConflict: 'id' });

    if (insertError) {
      return NextResponse.json({ error: 'Failed to sync: ' + insertError.message }, { status: 500 });
    }

    console.log(`✅ Synced ${toInsert.length} app_users rows`);
    return NextResponse.json({
      success: true,
      synced: toInsert.length,
      message: `Granted directory access to ${toInsert.length} users.`,
    });

  } catch (err: any) {
    console.error('sync-app-users error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
