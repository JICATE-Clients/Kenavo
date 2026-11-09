import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';

export const dynamic = 'force-dynamic'; // Disable static optimization
export const revalidate = 0; // Disable caching

export async function GET(
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

    // Fetch profile data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch Q&A answers for this profile
    const { data: qaData, error: qaError } = await supabaseAdmin
      .from('profile_answers')
      .select(`
        question_id,
        answer,
        profile_questions (
          question_text,
          order_index
        )
      `)
      .eq('profile_id', profileId)
      .order('profile_questions(order_index)');

    if (qaError) {
      console.warn('Error fetching Q&A:', qaError);
      // Continue without Q&A if table doesn't exist
    }

    // Transform Q&A data
    const qaResponses = qaData?.map((item: any) => ({
      question_id: item.question_id,
      question_text: item.profile_questions?.question_text || '',
      answer: item.answer,
      order_index: item.profile_questions?.order_index || 0
    })) || [];

    // Fetch all questions for the form (in case some aren't answered yet)
    const { data: allQuestions } = await supabaseAdmin
      .from('profile_questions')
      .select('id, question_text, order_index')
      .eq('is_active', true)
      .order('order_index');

    const response = NextResponse.json({
      profile,
      qa_responses: qaResponses,
      all_questions: allQuestions || [],
    });

    // Prevent caching to ensure fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Error in get-profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
