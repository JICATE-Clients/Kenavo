import { NextRequest, NextResponse } from 'next/server';
import { getUser, isAdmin } from '@/lib/auth/server';

/**
 * CHECK ADMIN AUTHORIZATION
 *
 * Verifies if the current authenticated user is an admin.
 * Checks both ADMIN_EMAILS whitelist and database role field.
 * Used by client-side components to check authorization before accessing admin features.
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user
    const { user, error } = await getUser();

    if (error || !user) {
      return NextResponse.json(
        {
          authorized: false,
          message: 'Not authenticated',
          user: null
        },
        { status: 401 }
      );
    }

    // Check if user is admin (checks both ADMIN_EMAILS and database role)
    const userEmail = user.email || '';
    console.log('Checking admin access for:', userEmail);

    const adminStatus = await isAdmin();

    if (!adminStatus) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Admin access required'
        },
        { status: 403 }
      );
    }

    console.log('✅ Admin access granted for:', userEmail);

    return NextResponse.json(
      {
        authorized: true,
        message: 'Admin access granted',
        user: {
          email: userEmail,
          id: user.id,
          full_name: user.user_metadata?.full_name
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error checking admin authorization:', error);
    return NextResponse.json(
      {
        authorized: false,
        message: 'Server error',
        error: error.message
      },
      { status: 500 }
    );
  }
}
