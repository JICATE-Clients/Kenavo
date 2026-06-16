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

export async function downloadDriveFile(fileId: string): Promise<Buffer> {
  const drive = google.drive({ version: 'v3', auth: getAuth() });
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data as ArrayBuffer);
}
