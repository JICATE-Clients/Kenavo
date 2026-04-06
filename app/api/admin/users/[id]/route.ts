import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';
import type { UpdateAppUserInput } from '@/lib/types/database';

/**
 * GET /api/admin/users/[id]
 * Get a single user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect this route - require admin authentication
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from('app_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Error in GET /api/admin/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update a user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect this route - require admin authentication
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    const { id } = await params;
    const body: UpdateAppUserInput = await request.json();
    const { email, username, password, role, has_directory_access, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('app_users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Validate password length if provided
    if (password && password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Update auth user if email or password changed
    if (email || password) {
      const updateData: Record<string, unknown> = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        updateData
      );

      if (authError) {
        console.error('Error updating auth user:', authError);
        return NextResponse.json(
          { error: authError.message || 'Failed to update user authentication' },
          { status: 500 }
        );
      }
    }

    // Update username in user metadata if provided
    if (username !== undefined) {
      const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        {
          user_metadata: { username },
        }
      );

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
      }
    }

    // Build update object for app_users table
    const updateData: Record<string, unknown> = {};
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (role !== undefined) updateData.role = role;
    if (has_directory_access !== undefined) updateData.has_directory_access = has_directory_access;
    if (status !== undefined) updateData.status = status;

    // Update app_users record
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('app_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Failed to update user' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    });

    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Error in PUT /api/admin/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (both from app_users and auth.users)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect this route - require admin authentication
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('app_users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete from app_users table (will cascade due to ON DELETE CASCADE in foreign key)
    const { error: deleteError } = await supabaseAdmin
      .from('app_users')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting user from app_users:', deleteError);
      return NextResponse.json(
        { error: deleteError.message || 'Failed to delete user' },
        { status: 500 }
      );
    }

    // Delete from Supabase Auth
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      // Continue anyway - app_users record is already deleted
    }

    const response = NextResponse.json({
      message: 'User deleted successfully',
    });

    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
