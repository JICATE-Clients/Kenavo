import { google } from 'googleapis';

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
};

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set. Add your service account key to .env.local.');
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(raw),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}

export async function listDriveImages(folderId: string): Promise<DriveFile[]> {
  const drive = google.drive({ version: 'v3', auth: getAuth() });
  const res = await drive.files.list({
    q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`,
    fields: 'files(id,name,mimeType)',
    pageSize: 1000,
  });
  return (res.data.files || []).filter(
    (f): f is DriveFile => !!(f.id && f.name && f.mimeType)
  );
}

/**
 * Stream a Drive file's bytes (for proxying video to a native <video> element).
 * Forwards the browser's Range header so seeking works and only the needed
 * chunks are fetched. Returns the gaxios response: `.data` is a Node Readable,
 * plus `.status` (206 for ranged) and `.headers` (content-type/length/range).
 */
export async function streamDriveFile(fileId: string, range?: string) {
  const drive = google.drive({ version: 'v3', auth: getAuth() });
  return drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream', headers: range ? { Range: range } : undefined }
  );
}

export async function downloadDriveFile(fileId: string): Promise<Buffer> {
  const drive = google.drive({ version: 'v3', auth: getAuth() });

  // Transient ECONNRESET / "fetch failed" from Drive is common; retry a few
  // times with backoff and cap each attempt so one stall can't hang the request.
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer', timeout: 60_000 }
      );
      return Buffer.from(res.data as ArrayBuffer);
    } catch (err) {
      lastErr = err;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}
