/**
 * Gallery media URL helpers (client- AND server-safe — no server-only imports).
 *
 * Gallery videos are NOT copied into Supabase Storage. Phone videos are large
 * (often 50–200MB) and pulling dozens of them into a single serverless request
 * caused MIME rejections, ECONNRESET and abort timeouts. Instead, the Drive sync
 * stores an embeddable Google Drive preview link, which streams straight from
 * Drive at no storage/bandwidth cost. These helpers build and recognise that link.
 */

// A video stored as an embeddable Google Drive preview link.
const DRIVE_PREVIEW_RE = /drive\.google\.com\/file\/d\/([^/]+)\/preview/i;

// A direct video file (e.g. a small video uploaded into Storage) by extension.
const VIDEO_EXT_RE = /\.(mp4|mov|webm|avi)(\?.*)?$/i;

/** Build the embeddable preview URL for a Google Drive file id. */
export function buildDriveVideoEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Our own proxy URL that streams the Drive video bytes for a native <video>.
 * Drive blocks video playback inside third-party iframes, so we never embed the
 * Drive player — we stream through this endpoint instead.
 */
export function buildDriveStreamUrl(fileId: string): string {
  return `/api/gallery/drive-video/${fileId}`;
}

/** True if the URL is a Google Drive embeddable preview link (render in an <iframe>). */
export function isDriveVideoEmbed(url: string): boolean {
  return DRIVE_PREVIEW_RE.test(url);
}

/** True if the URL is a direct video file by extension (render in a <video>). */
export function isDirectVideo(url: string): boolean {
  return VIDEO_EXT_RE.test(url);
}

/** True for any video, whether a Drive embed or a direct file. */
export function isGalleryVideo(url: string): boolean {
  return isDriveVideoEmbed(url) || isDirectVideo(url);
}

/** Extract the Drive file id from a preview/thumbnail/uc URL, or null. */
export function driveFileIdFromUrl(url: string): string | null {
  const match = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  return match ? match[1] : null;
}

/**
 * Lightweight poster image for a Drive file (a single static JPEG), used as a
 * facade in grids so we don't mount dozens of heavy Drive player iframes at once.
 * The full player (buildDriveVideoEmbedUrl) is only loaded on click.
 *
 * Uses the canonical lh3 CDN URL directly rather than drive.google.com/thumbnail:
 * the latter 302-redirects and varies on Sec-Fetch-Dest, so it fails to hotlink
 * from an <img> tag. lh3 serves the JPEG straight with Access-Control-Allow-Origin: *.
 */
export function buildDriveThumbnailUrl(fileId: string, width = 800): string {
  return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
}

/**
 * A displayable <img> src for any gallery item. For a Drive video this is the
 * static poster JPEG (renders in <img>); for images it's the URL itself. Use
 * this anywhere a single item is shown as an image (detail/thumbnail pickers,
 * album thumbnails) so a Drive /preview URL never lands in an <img> tag.
 */
export function galleryPosterUrl(url: string): string {
  if (isDriveVideoEmbed(url)) {
    const fileId = driveFileIdFromUrl(url);
    return fileId ? buildDriveThumbnailUrl(fileId) : '';
  }
  return url;
}
