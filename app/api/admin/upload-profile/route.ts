import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';

export async function POST(request: NextRequest) {
  // Protect this route - require admin authentication
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
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

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Validate year_graduated length (database constraint: VARCHAR(20))
    if (year_graduated && year_graduated.length > 20) {
      return NextResponse.json({
        error: `Year graduated "${year_graduated}" exceeds 20 characters. Please use format: "2024" or "1993-2000"`
      }, { status: 400 });
    }

    let profile_image_url = null;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    // Upload image to Supabase Storage if provided
    if (imageFile) {
      if (imageFile.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
      }
      if (!ALLOWED_TYPES.includes(imageFile.type)) {
        return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }, { status: 400 });
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
        // Continue without image if upload fails
      } else {
        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('profile-images')
          .getPublicUrl(filePath);

        profile_image_url = publicUrl;
      }
    }

    // Insert profile into database
    const { data: profile, error: dbError } = await supabaseAdmin
      .from('profiles')
      .insert({
        name,
        email,
        phone,
        location,
        year_graduated,
        current_job,
        designation_organisation,
        bio,
        linkedin_url,
        nicknames,
        profile_image_url,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to create profile: ' + dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile created successfully',
    });

  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
