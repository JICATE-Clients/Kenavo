/**
 * Gallery Storage Utilities
 * Functions for managing gallery images in Supabase Storage
 * Bucket: gallery-images
 */

import { supabaseAdmin } from './supabase-admin';
import { galleryPosterUrl } from './gallery-media';

const GALLERY_BUCKET = 'gallery-images';
const THUMBNAILS_FOLDER = 'thumbnails';
const ALBUMS_FOLDER = 'albums';

/**
 * Generate a unique filename for a gallery image
 * Format: {timestamp}-{random}.{extension}
 */
export function generateGalleryImageFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Upload a gallery image to Supabase Storage
 * @param file - The image file to upload
 * @param albumSlug - The album slug (e.g., 'group', 'sports')
 * @param isThumbnail - Whether this is an album thumbnail
 * @returns The public URL of the uploaded image
 */
export async function uploadGalleryImage(
  file: File,
  albumSlug: string,
  isThumbnail: boolean = false
): Promise<{ url: string; path: string }> {
  try {
    const filename = isThumbnail
      ? `${albumSlug}.${file.name.split('.').pop()?.toLowerCase() || 'jpg'}`
      : generateGalleryImageFilename(file.name);

    const folder = isThumbnail ? THUMBNAILS_FOLDER : `${ALBUMS_FOLDER}/${albumSlug}`;
    const filePath = `${folder}/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(GALLERY_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: isThumbnail, // Allow overwriting thumbnails
      });

    if (error) {
      console.error('Error uploading gallery image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(GALLERY_BUCKET)
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      path: filePath,
    };
  } catch (error: any) {
    console.error('Error in uploadGalleryImage:', error);
    throw error;
  }
}

/**
 * Upload multiple gallery images in bulk
 * @param files - Array of image files
 * @param albumSlug - The album slug
 * @returns Array of uploaded image URLs and paths
 */
export async function uploadGalleryImagesBulk(
  files: File[],
  albumSlug: string
): Promise<Array<{ url: string; path: string; originalName: string; success: boolean; error?: string }>> {
  const results = [];

  for (const file of files) {
    try {
      const { url, path } = await uploadGalleryImage(file, albumSlug, false);
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

/**
 * Delete a gallery image from Supabase Storage
 * @param imagePath - The storage path of the image (e.g., 'albums/group/12345-abc.jpg')
 * @returns Success boolean
 */
export async function deleteGalleryImage(imagePath: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(GALLERY_BUCKET)
      .remove([imagePath]);

    if (error) {
      console.error('Error deleting gallery image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteGalleryImage:', error);
    return false;
  }
}

/**
 * Delete multiple gallery images from Supabase Storage
 * @param imagePaths - Array of storage paths
 * @returns Number of successfully deleted images
 */
export async function deleteGalleryImagesBulk(imagePaths: string[]): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(GALLERY_BUCKET)
      .remove(imagePaths);

    if (error) {
      console.error('Error in bulk delete:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error in deleteGalleryImagesBulk:', error);
    return 0;
  }
}

/**
 * Extract storage path from a full Supabase Storage URL
 * Example: https://.../storage/v1/object/public/gallery-images/albums/group/123.jpg
 * Returns: albums/group/123.jpg
 */
export function extractGalleryStoragePath(url: string): string | null {
  try {
    const bucketPrefix = `/storage/v1/object/public/${GALLERY_BUCKET}/`;
    const bucketIndex = url.indexOf(bucketPrefix);

    if (bucketIndex === -1) {
      return null;
    }

    return url.substring(bucketIndex + bucketPrefix.length);
  } catch (error) {
    console.error('Error extracting storage path:', error);
    return null;
  }
}

/**
 * List all images in a specific album folder
 * @param albumSlug - The album slug
 * @returns Array of file paths
 */
export async function listAlbumImages(albumSlug: string): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(GALLERY_BUCKET)
      .list(`${ALBUMS_FOLDER}/${albumSlug}`, {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error listing album images:', error);
      return [];
    }

    return data?.map((file) => `${ALBUMS_FOLDER}/${albumSlug}/${file.name}`) || [];
  } catch (error) {
    console.error('Error in listAlbumImages:', error);
    return [];
  }
}

// Allowed gallery media types (shared by the uploader, the upload API and the bucket).
export const GALLERY_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const GALLERY_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];

// Per-kind size limits (MB). Videos are larger but note that very large manual
// uploads can still hit the hosting request-body limit — use Drive sync for those.
export const GALLERY_IMAGE_MAX_MB = 5;
export const GALLERY_VIDEO_MAX_MB = 50;

/**
 * Validate a gallery media file (image or video) by type and size.
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export function validateGalleryMedia(file: File): { valid: boolean; error?: string } {
  const isImage = GALLERY_IMAGE_TYPES.includes(file.type);
  const isVideo = GALLERY_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type || 'unknown'}. Allowed: JPEG, PNG, WebP, GIF, MP4, MOV, WebM, AVI`,
    };
  }

  const maxSizeMB = isVideo ? GALLERY_VIDEO_MAX_MB : GALLERY_IMAGE_MAX_MB;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Fill in a thumbnail for any album missing one, using its first active image
 * (videos resolve to their Drive poster JPEG via galleryPosterUrl). Drive-synced
 * and newly created albums often have no thumbnail_url yet — this keeps cards from
 * falling back to a missing placeholder. Mutates and returns the same array.
 */
export async function fillAlbumThumbnails<
  T extends { id: number; thumbnail_url: string | null }
>(albums: T[]): Promise<T[]> {
  await Promise.all(
    albums
      .filter((album) => !album.thumbnail_url)
      .map(async (album) => {
        const { data: firstImage } = await supabaseAdmin
          .from('gallery_images')
          .select('image_url')
          .eq('album_id', album.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(1)
          .maybeSingle();
        if (firstImage?.image_url) {
          album.thumbnail_url = galleryPosterUrl(firstImage.image_url);
        }
      })
  );
  return albums;
}

/**
 * Get public URL for a gallery image path
 * @param path - Storage path (e.g., 'albums/group/123.jpg')
 * @returns Public URL
 */
export function getGalleryImagePublicUrl(path: string): string {
  const { data } = supabaseAdmin.storage
    .from(GALLERY_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Delete all images in an album folder
 * Useful when deleting an entire album
 * @param albumSlug - The album slug
 * @returns Number of images deleted
 */
export async function deleteAllAlbumImages(albumSlug: string): Promise<number> {
  try {
    const imagePaths = await listAlbumImages(albumSlug);

    if (imagePaths.length === 0) {
      return 0;
    }

    return await deleteGalleryImagesBulk(imagePaths);
  } catch (error) {
    console.error('Error in deleteAllAlbumImages:', error);
    return 0;
  }
}
