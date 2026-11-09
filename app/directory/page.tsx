import DirectoryClient from './DirectoryClient';
import { getAllProfiles } from '@/lib/api/profiles';
import { createClient } from '@/lib/auth/server';
import type { SupabaseClient } from '@supabase/supabase-js';

// Rendered per request: what a visitor receives depends on whether they are signed in.
export const dynamic = 'force-dynamic';

export default async function DirectoryPage() {
  let profiles: Awaited<ReturnType<typeof getAllProfiles>> = [];
  let fetchError: string | null = null;

  // Only signed-in classmates get location, and it is read through THEIR session
  // (not the public anon key). Strangers never fetch it. If the check fails, treat
  // the visitor as a stranger.
  let viewer: SupabaseClient | null = null;
  try {
    const sessionClient = await createClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    if (user) viewer = sessionClient;
  } catch (err) {
    console.error('Directory auth check failed, hiding locations:', err);
  }

  try {
    profiles = await getAllProfiles(viewer);
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
