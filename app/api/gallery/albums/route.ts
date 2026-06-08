import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

// Route reads request.url for search params — must stay dynamic
export const dynamic = 'force-dynamic';

// GET /api/gallery/albums - List active albums with pagination
// ?page=1&limit=2
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get('page')  || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '2', 10);

    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    const { data: albums, count: totalCount, error } = await supabaseAdmin
      .from('gallery_albums')
      .select('id, name, slug, description, thumbnail_url, display_order', { count: 'exact' })
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching albums:', error);
      throw error;
    }

    const transformedAlbums = (albums ?? []).map(album => ({
      id:            album.id,
      name:          album.name,
      slug:          album.slug,
      description:   album.description,
      thumbnail_url: album.thumbnail_url,
      display_order: album.display_order,
    }));

    const total      = totalCount ?? 0;
    const totalPages = Math.ceil(total / limit);
    const hasMore    = page < totalPages;

    return NextResponse.json(
      { albums: transformedAlbums, total, currentPage: page, totalPages, hasMore, limit },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );

  } catch (error: any) {
    console.error('Error in GET /api/gallery/albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums', details: error.message },
      { status: 500 }
    );
  }
}
