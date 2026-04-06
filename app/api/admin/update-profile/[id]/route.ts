import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';
import { deleteProfileImage } from '@/lib/storage-utils';
import { createSlug } from '@/lib/utils/slug';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect this route - require admin authentication
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    const { id } = await params;
    const profileId = parseInt(id);

    if (isNaN(profileId)) {
      return NextResponse.json({ error: 'Invalid profile ID' }, { status: 400 });
    }

    const formData = await request.formData();

    // Extract form fields
    const name = formData.get('name') as string;
    const email = formData.get('email') as string || null;
    const phone = formData.get('phone') as string || null;
    const location = formData.get('location') as string || null;
    const year_graduated = formData.get('year_graduated') as string || null;
    const current_job = formData.get('current_job') as string || null;
    const designation_organisation = formData.get('designation_organisation') as string || null;
    const bio = formData.get('bio') as string || null;
    const linkedin_url = formData.get('linkedin_url') as string || null;
    const nicknames = formData.get('nicknames') as string || null;
    const imageFile = formData.get('image') as File | null;
    const existing_image_url = formData.get('existing_image_url') as string || null;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Validate year_graduated length (database constraint: VARCHAR(20))
    if (year_graduated && year_graduated.length > 20) {
      return NextResponse.json({
        error: `Year graduated "${year_graduated}" exceeds 20 characters. Please use format: "2024" or "1993-2000"`
      }, { status: 400 });
    }

    let profile_image_url = existing_image_url;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    // Upload new image if provided
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
      }
      if (!ALLOWED_TYPES.includes(imageFile.type)) {
        return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }, { status: 400 });
      }

      // Delete old image first to prevent storage bloat
      if (existing_image_url) {
        const deleteResult = await deleteProfileImage(existing_image_url);
        if (deleteResult.success) {
          console.log('✅ Old profile image deleted successfully');
        } else {
          console.warn('⚠️ Could not delete old image:', deleteResult.error);
          // Continue anyway - don't fail the update if cleanup fails
        }
      }

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Convert File to ArrayBuffer for Supabase upload
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('profile-images')
        .upload(filePath, buffer, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        // Continue with update even if image upload fails
      } else {
        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('profile-images')
          .getPublicUrl(filePath);

        profile_image_url = publicUrl;
      }
    }

    // Build update object dynamically (PATCH semantics - only update provided fields)
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Required field
    if (name) updateData.name = name;

    // Optional fields - only update if present in FormData
    if (formData.has('email')) updateData.email = email;
    if (formData.has('phone')) updateData.phone = phone;
    if (formData.has('location')) updateData.location = location;
    if (formData.has('year_graduated')) updateData.year_graduated = year_graduated;
    if (formData.has('current_job')) updateData.current_job = current_job;
    if (formData.has('designation_organisation')) updateData.designation_organisation = designation_organisation;
    if (formData.has('bio')) updateData.bio = bio;
    if (formData.has('linkedin_url')) updateData.linkedin_url = linkedin_url;
    if (formData.has('nicknames')) updateData.nicknames = nicknames;

    // Handle profile image
    if (imageFile && imageFile.size > 0) {
      // New image uploaded
      updateData.profile_image_url = profile_image_url;
    } else if (formData.has('existing_image_url') && existing_image_url) {
      // Explicit preservation (from Edit Modal)
      updateData.profile_image_url = existing_image_url;
    }
    // If neither above is true, profile_image_url not in updateData = preserved in database

    // Update profile in database with only provided fields
    const { data: profile, error: dbError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', profileId)
      .select()
      .maybeSingle();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to update profile: ' + dbError.message }, { status: 500 });
    }

    // Check if profile exists
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Trigger on-demand revalidation for instant updates
    const slug = createSlug(profile.name);
    const pathsToRevalidate = [
      '/directory',
      `/directory/${slug}`,
    ];

    try {
      // Call revalidation API to purge cache
      const revalidateUrl = new URL('/api/revalidate', request.url);
      const revalidateResponse = await fetch(revalidateUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('Cookie') || '', // Forward auth cookies
        },
        body: JSON.stringify({ paths: pathsToRevalidate }),
      });

      if (revalidateResponse.ok) {
        console.log('✅ Cache revalidated for:', pathsToRevalidate);
      } else {
        console.warn('⚠️ Revalidation failed but profile was updated');
      }
    } catch (revalidateError) {
      console.error('Revalidation error:', revalidateError);
      // Don't fail the request if revalidation fails
    }

    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
