/**
 * Unified Gallery Image Upload API
 * Handles both ZIP file uploads and multiple individual file uploads
 * POST /api/admin/gallery/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';
import {
  uploadGalleryImage,
  validateGalleryMedia,
} from '@/lib/gallery-storage-utils';
import JSZip from 'jszip';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // allow longer processing for video uploads

// Extension → MIME map for files coming out of a ZIP (the entries have no type).
const ZIP_MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  avi: 'video/x-msvideo',
};

interface UploadResult {
  url: string;
  path: string;
  originalName: string;
  success: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    const formData = await request.formData();
    const albumId = formData.get('album_id') as string;
    const albumSlug = formData.get('album_slug') as string;
    const uploadType = formData.get('upload_type') as 'zip' | 'files';

    // Validate required fields
    if (!albumId || !albumSlug) {
      return NextResponse.json(
        { error: 'album_id and album_slug are required' },
        { status: 400 }
      );
    }

    // Verify album exists
    const { data: album, error: albumError } = await supabaseAdmin
      .from('gallery_albums')
      .select('id, slug, name')
      .eq('id', parseInt(albumId))
      .single();

    if (albumError || !album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    let results: UploadResult[] = [];

    if (uploadType === 'zip') {
      // Handle ZIP file upload
      const zipFile = formData.get('zip_file') as File;

      if (!zipFile) {
        return NextResponse.json(
          { error: 'No ZIP file provided' },
          { status: 400 }
        );
      }

      results = await handleZipUpload(zipFile, albumSlug, parseInt(albumId));
    } else {
      // Handle multiple individual files
      const files: File[] = [];

      // Extract all files from formData
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('file_') && value instanceof File) {
          files.push(value);
        }
      }

      if (files.length === 0) {
        return NextResponse.json(
          { error: 'No files provided' },
          { status: 400 }
        );
      }

      results = await handleMultiFileUpload(files, albumSlug, parseInt(albumId));
    }

    // Count successes and failures
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: failureCount === 0,
      uploaded_count: successCount,
      failed_count: failureCount,
      total: results.length,
      results,
      album_id: parseInt(albumId),
      album_slug: albumSlug,
    });

  } catch (error: any) {
    console.error('Error in gallery upload:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle ZIP file upload
 * Extract images from ZIP and upload to storage
 */
async function handleZipUpload(
  zipFile: File,
  albumSlug: string,
  albumId: number
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  try {
    // Read ZIP file
    const zipBuffer = await zipFile.arrayBuffer();
    const zip = await JSZip.loadAsync(zipBuffer);

    // Filter for supported media files only (images + videos)
    const mediaFiles = Object.keys(zip.files).filter(filename => {
      const ext = filename.split('.').pop()?.toLowerCase();
      return (
        !filename.startsWith('__MACOSX') &&
        !filename.startsWith('.') &&
        ext &&
        ext in ZIP_MIME_BY_EXT &&
        !zip.files[filename].dir
      );
    });

    // Limit to 100 files per ZIP for safety
    if (mediaFiles.length > 100) {
      throw new Error(`ZIP contains too many files (${mediaFiles.length}). Maximum is 100 per upload.`);
    }

    // Process each file
    for (const filename of mediaFiles) {
      try {
        const fileData = await zip.files[filename].async('blob');
        const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = ZIP_MIME_BY_EXT[ext] || 'image/jpeg';

        // Create File object
        const file = new File([fileData], filename, { type: mimeType });

        // Validate file
        const validation = validateGalleryMedia(file);
        if (!validation.valid) {
          results.push({
            url: '',
            path: '',
            originalName: filename,
            success: false,
            error: validation.error,
          });
          continue;
        }

        // Upload to storage
        const { url, path } = await uploadGalleryImage(file, albumSlug, false);

        // Create database record
        await supabaseAdmin.from('gallery_images').insert({
          album_id: albumId,
          image_url: url,
          caption: null,
          display_order: 0,
          is_active: true,
        });

        results.push({
          url,
          path,
          originalName: filename,
          success: true,
        });
      } catch (error: any) {
        results.push({
          url: '',
          path: '',
          originalName: filename,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error: any) {
    throw new Error(`ZIP processing failed: ${error.message}`);
  }
}

/**
 * Handle multiple individual file uploads
 */
async function handleMultiFileUpload(
  files: File[],
  albumSlug: string,
  albumId: number
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const file of files) {
    try {
      // Validate file
      const validation = validateGalleryMedia(file);
      if (!validation.valid) {
        results.push({
          url: '',
          path: '',
          originalName: file.name,
          success: false,
          error: validation.error,
        });
        continue;
      }

      // Upload to storage
      const { url, path } = await uploadGalleryImage(file, albumSlug, false);

      // Create database record
      await supabaseAdmin.from('gallery_images').insert({
        album_id: albumId,
        image_url: url,
        caption: null,
        display_order: 0,
        is_active: true,
      });

      results.push({
        url,
        path,
        originalName: file.name,
        success: true,
      });
    } catch (error: any) {
      results.push({
        url: '',
        path: '',
        originalName: file.name,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}
