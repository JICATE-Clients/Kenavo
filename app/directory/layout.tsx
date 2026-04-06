import { redirect } from 'next/navigation';
import { getUser, isAdmin } from '@/lib/auth/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const maxDuration = 30; // Allow up to 30s on Vercel Pro (ignored on Hobby)

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
      console.error('app_users query error:', error.code, error.message);
      // PGRST116 = row not found — auto-provision instead of denying
      if (error.code === 'PGRST116') {
        const { error: insertError } = await supabaseAdmin.from('app_users').insert({
          id: user.id,
          email: user.email ?? '',
          role: 'user',
          has_directory_access: true,
          status: 'active',
        });
        if (insertError) {
          console.error('Auto-provision failed:', insertError.code, insertError.message);
          redirect('/access-denied?reason=no_permission');
        }
        console.log(`✅ Auto-provisioned app_users for ${user.email}`);
        return <>{children}</>;
      }
      // Any other DB error (e.g. missing service role key, network) — deny gracefully
      console.error('Error checking directory access:', error);
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
    // Always re-throw Next.js internal redirect/notFound — never swallow these
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.digest === 'NEXT_NOT_FOUND') {
      throw error;
    }
    console.error('Error in directory layout:', error);
    // Re-throw all errors — do not silently redirect to access-denied on DB timeouts
    // as that wrongly locks out valid users on cold starts
    throw error;
  }
}
