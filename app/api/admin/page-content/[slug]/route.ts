import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';
import { getUser } from '@/lib/auth/server';
import { DEFAULT_REUNION_CONTENT, REUNION_SLUG } from '@/lib/reunion-content';
import { DEFAULT_REWIND_CONTENT, REWIND_SLUG } from '@/lib/rewind-content';
import { DEFAULT_OUR_TREASURE_CONTENT, OUR_TREASURE_SLUG } from '@/lib/treasure-content';

export const dynamic = 'force-dynamic';

// Public path to revalidate when a given page slug is saved.
const SLUG_PATHS: Record<string, string> = {
  [REUNION_SLUG]: '/reunion-2025',
  [REWIND_SLUG]: '/echoes-and-memories/rewind',
  [OUR_TREASURE_SLUG]: '/our-treasure',
};

// Canonical default content per slug — returned by GET when no row exists yet,
// so the editor opens pre-filled with the current page copy.
const DEFAULT_CONTENT: Record<string, unknown> = {
  [REUNION_SLUG]: DEFAULT_REUNION_CONTENT,
  [REWIND_SLUG]: DEFAULT_REWIND_CONTENT,
  [OUR_TREASURE_SLUG]: DEFAULT_OUR_TREASURE_CONTENT,
};

/**
 * GET /api/admin/page-content/[slug]
 * Returns the stored content, or the canonical default when no row exists.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    const { slug } = await params;

    const { data, error } = await supabaseAdmin
      .from('page_content')
      .select('content')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Error fetching page content:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const content = data?.content ?? DEFAULT_CONTENT[slug] ?? null;
    if (content === null) {
      return NextResponse.json({ error: 'Unknown page' }, { status: 404 });
    }

    return NextResponse.json({ slug, content, isDefault: !data?.content });
  } catch (error) {
    console.error('Error in GET page content:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/page-content/[slug]
 * Upserts the content for a page and revalidates the public route.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    const { slug } = await params;
    const body = await request.json();
    const content = body?.content;

    // Light shape check — this is admin-only, but reject obvious bad payloads.
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      return NextResponse.json({ error: 'Invalid content payload' }, { status: 400 });
    }

    const { user } = await getUser();

    const { data, error } = await supabaseAdmin
      .from('page_content')
      .upsert(
        { slug, content, updated_by: user?.id ?? null, updated_at: new Date().toISOString() },
        { onConflict: 'slug' }
      )
      .select('slug, updated_at')
      .single();

    if (error) {
      console.error('Error saving page content:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Refresh the public page so edits appear immediately.
    const path = SLUG_PATHS[slug];
    if (path) {
      try {
        revalidatePath(path);
      } catch (e) {
        console.warn('Revalidation failed (non-fatal):', e);
      }
    }

    return NextResponse.json({ success: true, slug: data.slug, updatedAt: data.updated_at });
  } catch (error) {
    console.error('Error in PUT page content:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
