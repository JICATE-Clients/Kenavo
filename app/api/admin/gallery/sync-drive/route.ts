import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';
import { listDriveImages, downloadDriveFile } from '@/lib/google-drive';

const GALLERY_BUCKET = 'gallery-images';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    const { album_id } = await request.json();

    if (!album_id) {
      return NextResponse.json({ error: 'album_id is required' }, { status: 400 });
    }

    const { data: album } = await supabaseAdmin
      .from('gallery_albums')
      .select('id, name, slug, drive_folder_id')
      .eq('id', album_id)
      .single();

    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    if (!album.drive_folder_id) {
      return NextResponse.json(
        { error: 'No Google Drive folder linked to this album. Edit the album to add a Drive Folder ID.' },
        { status: 400 }
      );
    }

    // Build set of already-synced Drive file IDs to avoid duplicates
    const { data: existingImages } = await supabaseAdmin
      .from('gallery_images')
      .select('image_url')
      .eq('album_id', album.id);

    const syncedDriveIds = new Set<string>();
    for (const img of existingImages || []) {
      const match = img.image_url.match(/drive_([^.]+)\./);
      if (match) syncedDriveIds.add(match[1]);
    }

    // Fetch image list from Google Drive folder
    const driveFiles = await listDriveImages(album.drive_folder_id);

    if (driveFiles.length === 0) {
      return NextResponse.json({
        synced: 0, skipped: 0, failed: 0, total: 0,
        message: 'No images found in the Drive folder.',
      });
    }

    // Start display_order after existing images
    const { count: existingCount } = await supabaseAdmin
      .from('gallery_images')
      .select('*', { count: 'exact', head: true })
      .eq('album_id', album.id);

    let nextOrder = existingCount || 0;
    let synced = 0, skipped = 0, failed = 0;
    const failedFiles: string[] = [];

    for (const file of driveFiles) {
      if (syncedDriveIds.has(file.id)) {
        skipped++;
        continue;
      }

      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const storagePath = `albums/${album.slug}/drive_${file.id}.${ext}`;

        const buffer = await downloadDriveFile(file.id);

        const { error: uploadError } = await supabaseAdmin.storage
          .from(GALLERY_BUCKET)
          .upload(storagePath, buffer, {
            contentType: file.mimeType,
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from(GALLERY_BUCKET)
          .getPublicUrl(storagePath);

        await supabaseAdmin.from('gallery_images').insert({
          album_id: album.id,
          image_url: publicUrl,
          caption: file.name.replace(/\.[^.]+$/, ''),
          display_order: nextOrder,
          is_active: true,
        });

        nextOrder++;
        synced++;
      } catch (err: any) {
        console.error(`Failed to sync "${file.name}":`, err.message);
        failedFiles.push(file.name);
        failed++;
      }
    }

    const message = `Synced ${synced} new photo${synced !== 1 ? 's' : ''}, skipped ${skipped} already imported.${failed > 0 ? ` ${failed} failed.` : ''}`;

    return NextResponse.json({
      synced, skipped, failed, total: driveFiles.length, message,
      ...(failedFiles.length > 0 ? { errors: failedFiles } : {}),
    });

  } catch (err: any) {
    console.error('Error in POST /api/admin/gallery/sync-drive:', err);
    return NextResponse.json(
      { error: err.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
