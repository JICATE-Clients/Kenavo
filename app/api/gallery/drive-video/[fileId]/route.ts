import { NextRequest } from 'next/server';
import { Readable } from 'node:stream';
import { streamDriveFile } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Public video proxy: streams a Google Drive video through our server so it can
// play in a native <video> element. Drive blocks video playback in third-party
// iframes (the /preview embed fails with "Unable to load video"), so we serve the
// bytes ourselves via the service account. Range requests are forwarded, so the
// browser only fetches the chunks it needs and seeking works.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  // Drive file ids are [A-Za-z0-9_-]; reject anything else.
  if (!/^[A-Za-z0-9_-]+$/.test(fileId)) {
    return new Response('Invalid file id', { status: 400 });
  }

  const range = request.headers.get('range') || undefined;

  try {
    const driveRes = await streamDriveFile(fileId, range);

    // gaxios returns a fetch Headers object; read with .get() (bracket access
    // silently yields undefined and would drop Content-Length/Content-Range).
    const src = driveRes.headers as unknown as Headers;
    const readHeader = (key: string): string | undefined =>
      typeof src?.get === 'function' ? src.get(key) ?? undefined : (src as any)?.[key];

    const headers = new Headers();
    headers.set('Content-Type', readHeader('content-type') || 'video/mp4');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=3600');
    const contentLength = readHeader('content-length');
    const contentRange = readHeader('content-range');
    if (contentLength) headers.set('Content-Length', contentLength);
    if (contentRange) headers.set('Content-Range', contentRange);

    // Drive returns 206 when a Range was honored, 200 otherwise.
    const status = driveRes.status === 206 ? 206 : 200;

    const webStream = Readable.toWeb(driveRes.data as unknown as Readable) as ReadableStream;
    return new Response(webStream, { status, headers });
  } catch (err: any) {
    const status = err?.code === 404 || err?.response?.status === 404 ? 404 : 502;
    console.error(`drive-video proxy failed for ${fileId}:`, err?.message);
    return new Response('Failed to load video', { status });
  }
}
