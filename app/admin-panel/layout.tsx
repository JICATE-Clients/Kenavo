import { redirect } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { getUser, isAdmin } from '@/lib/auth/server';

// Poppins, scoped to the admin panel only. Self-hosted by next/font (no layout
// shift, no external request at runtime). Weights cover the regular/medium/
// semibold/bold usage across the admin UI.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getUser();

  // If not logged in, redirect to login page
  if (!user) {
    redirect('/login');
  }

  // Only users with the admin role may view the admin dashboard.
  // Every other authenticated user is sent to the website, where they can
  // browse all the public pages — they simply can't reach this dashboard.
  const admin = await isAdmin();

  if (!admin) {
    redirect('/');
  }

  // User is authenticated and is an admin - render the admin panel in Poppins
  return <div className={poppins.className}>{children}</div>;
}
