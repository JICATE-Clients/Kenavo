import { redirect } from 'next/navigation';
import { getUser, isAdmin } from '@/lib/auth/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current user
  const { user } = await getUser();

  // If not authenticated, redirect to login
  if (!user) {
    redirect('/login?message=Please login to access the directory');
  }

  // Check if user is admin (admins always have access)
  const admin = await isAdmin();

  if (admin) {
    // Admins have full access to directory
    return <>{children}</>;
  }

  // For non-admin users, check if they have directory access
  try {
    const { data: appUser, error } = await supabaseAdmin
      .from('app_users')
      .select('has_directory_access, status')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error checking directory access:', error);
      // If user doesn't exist in app_users table, deny access
      redirect('/access-denied?reason=no_permission');
    }

    // Check if account is active
    if (appUser.status !== 'active') {
      redirect('/access-denied?reason=account_inactive');
    }

    // Check if directory access is granted
    if (!appUser.has_directory_access) {
      redirect('/access-denied?reason=directory_access_denied');
    }

    // User has directory access
    return <>{children}</>;

  } catch (error: any) {
    console.error('Error in directory layout:', error);
    // Network timeout reaching Supabase — do not silently deny access.
    // Re-throw so Next.js renders a 500 page (or add a specific UI here).
    // Redirecting to access-denied on a transient DB error wrongly locks out valid users.
    if (error?.name === 'AbortError' || error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
      throw new Error('Database unreachable — please refresh the page.');
    }
    // Genuine unexpected error — still re-throw rather than silently deny.
    throw error;
  }
}
