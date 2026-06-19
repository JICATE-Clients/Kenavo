import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/auth/api-protection';
import { fillAlbumThumbnails } from '@/lib/gallery-storage-utils';

export const dynamic = 'force-dynamic';

// GET /api/admin/gallery/albums - List all albums
export async function GET(request: Request) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    // Fetch all albums with image count
    const { data: albums, error: albumsError } = await supabaseAdmin
      .from('gallery_albums')
      .select(`
        *,
        gallery_images (count)
      `)
      .order('display_order', { ascending: true });

    if (albumsError) {
      console.error('Error fetching albums:', albumsError);
      throw albumsError;
    }

    // Transform data to include image count
    const transformedAlbums = albums?.map(album => ({
      ...album,
      image_count: album.gallery_images?.[0]?.count || 0,
      gallery_images: undefined // Remove the nested array
    })) || [];

    // Drive-synced albums often have no thumbnail_url; derive a poster from each
    // album's first image (videos resolve to their Drive poster JPEG) so the
    // admin list shows real covers instead of empty placeholders.
    await fillAlbumThumbnails(transformedAlbums);

    return NextResponse.json({
      albums: transformedAlbums,
      total: transformedAlbums.length
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/gallery/albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/gallery/albums - Create new album
export async function POST(request: Request) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    // Parse request body
    const body = await request.json();
    const { name, slug, description, thumbnail_url, drive_folder_id, display_order, is_active } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Create album
    const { data: newAlbum, error: createError } = await supabaseAdmin
      .from('gallery_albums')
      .insert({
        name,
        slug,
        description: description || null,
        thumbnail_url: thumbnail_url || null,
        drive_folder_id: drive_folder_id || null,
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating album:', createError);

      // Check for unique constraint violation
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'An album with this name or slug already exists' },
          { status: 409 }
        );
      }

      throw createError;
    }

    return NextResponse.json({
      success: true,
      album: newAlbum,
      message: 'Album created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/admin/gallery/albums:', error);
    return NextResponse.json(
      { error: 'Failed to create album', details: error.message },
      { status: 500 }
    );
  }
}
