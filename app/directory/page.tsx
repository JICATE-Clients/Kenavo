import DirectoryClient from './DirectoryClient';
import { getAllProfiles } from '@/lib/api/profiles';

export default async function DirectoryPage() {
  let profiles: Awaited<ReturnType<typeof getAllProfiles>> = [];
  let fetchError: string | null = null;

  try {
    profiles = await getAllProfiles();
  } catch (err: any) {
    if (err?.name === 'AbortError' || err?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center max-w-md">
            <p className="text-4xl mb-4">🔌</p>
            <h1 className="text-2xl font-bold text-white mb-2">Service Unavailable</h1>
            <p className="text-purple-200">
              Cannot reach the database. Please check your network connection and try again.
            </p>
          </div>
        </div>
      );
    }
    fetchError = err instanceof Error ? err.message : 'Failed to load profiles';
    console.error('Error fetching profiles server-side:', err);
  }

  return <DirectoryClient profiles={profiles} fetchError={fetchError} />;
}
