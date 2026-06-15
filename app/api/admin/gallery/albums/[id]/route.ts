import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { protectAdminRoute } from '@/lib/auth/api-protection';

export const dynamic = 'force-dynamic';

// GET /api/admin/gallery/albums/[id] - Get single album
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  const { id: albumId } = await params;

  try {

    // Fetch album with images
    const { data: album, error: albumError } = await supabaseAdmin
      .from('gallery_albums')
      .select(`
        *,
        gallery_images (
          id,
          image_url,
          caption,
          display_order,
          is_active,
          created_at
        )
      `)
      .eq('id', albumId)
      .single();

    if (albumError) {
      if (albumError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Album not found' }, { status: 404 });
      }
      throw albumError;
    }

    return NextResponse.json({ album });

  } catch (error: any) {
    console.error(`Error in GET /api/admin/gallery/albums/${albumId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch album', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/gallery/albums/[id] - Update album
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  const { id: albumId } = await params;

  try {
    const body = await request.json();
    const { name, slug, description, thumbnail_url, drive_folder_id, display_order, is_active } = body;

    // Build update object (only include provided fields)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (drive_folder_id !== undefined) updateData.drive_folder_id = drive_folder_id || null;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update album
    const { data: updatedAlbum, error: updateError } = await supabaseAdmin
      .from('gallery_albums')
      .update(updateData)
      .eq('id', albumId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating album:', updateError);

      // Check for unique constraint violation
      if (updateError.code === '23505') {
        return NextResponse.json(
          { error: 'An album with this name or slug already exists' },
          { status: 409 }
        );
      }

      // Check if album not found
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Album not found' }, { status: 404 });
      }

      throw updateError;
    }

    return NextResponse.json({
      success: true,
      album: updatedAlbum,
      message: 'Album updated successfully'
    });

  } catch (error: any) {
    console.error(`Error in PUT /api/admin/gallery/albums/${albumId}:`, error);
    return NextResponse.json(
      { error: 'Failed to update album', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/gallery/albums/[id] - Delete album
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  const { id: albumId } = await params;

  try {

    // Check if album exists and get image count
    const { data: album, error: checkError } = await supabaseAdmin
      .from('gallery_albums')
      .select('id, name, gallery_images(count)')
      .eq('id', albumId)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Album not found' }, { status: 404 });
      }
      throw checkError;
    }

    const imageCount = album.gallery_images?.[0]?.count || 0;

    // Delete album (CASCADE will delete related images)
    const { error: deleteError } = await supabaseAdmin
      .from('gallery_albums')
      .delete()
      .eq('id', albumId);

    if (deleteError) {
      console.error('Error deleting album:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: `Album "${album.name}" and ${imageCount} associated image(s) deleted successfully`,
      deleted_images: imageCount
    });

  } catch (error: any) {
    console.error(`Error in DELETE /api/admin/gallery/albums/${albumId}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete album', details: error.message },
      { status: 500 }
    );
  }
}
