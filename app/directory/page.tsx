import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import DirectoryClient from './DirectoryClient';
import { getAllProfiles } from '@/lib/api/profiles';

export default async function DirectoryPage() {
  try {
    // Server-side authentication check - happens BEFORE page loads
    const { user } = await getUser();

    if (!user) {
      // Not authenticated - redirect to login
      redirect('/login?redirect=/directory');
    }

    // Check if user has directory access
    const { data: appUser, error: userError } = await supabaseAdmin
      .from('app_users')
      .select('id, email, username, has_directory_access, status')
      .eq('id', user.id)
      .single();

    if (userError || !appUser) {
      // User not found in app_users table - redirect to login for registration
      redirect('/login?redirect=/directory');
    }

    // Check if account is active
    if (appUser.status !== 'active') {
      redirect('/access-denied?reason=account_inactive');
    }

    // Check directory access permission
    if (!appUser.has_directory_access) {
      redirect('/access-denied?reason=directory_access_denied');
    }

    // User has access - fetch profiles server-side and render
    let profiles: Awaited<ReturnType<typeof getAllProfiles>> = [];
    let fetchError: string | null = null;

    try {
      profiles = await getAllProfiles();
    } catch (profilesErr) {
      fetchError = profilesErr instanceof Error ? profilesErr.message : 'Failed to load profiles';
      console.error('Error fetching profiles server-side:', profilesErr);
    }

    return <DirectoryClient profiles={profiles} fetchError={fetchError} />;
  } catch (error: any) {
    // Supabase unreachable (network block, timeout) — fail fast with clear message
    if (error?.name === 'AbortError' || error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
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
    // Re-throw unexpected errors
    throw error;
  }
}
