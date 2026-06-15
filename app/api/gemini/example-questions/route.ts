import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateExampleQuestions } from '@/lib/gemini/service';
import { generateDataDrivenQuestions } from '@/lib/alumni/smartSearch';
import { getUser } from '@/lib/auth/server';

const FALLBACK_QUESTIONS = [
  "Who's working in tech these days?",
  "Any alumni in Chennai?",
  "Tell me about the class of 2000",
  "What are classmates doing now?",
  "How many alumni are in the directory?",
  "Who's working abroad?",
];

/**
 * GET /api/gemini/example-questions
 *
 * Tries Gemini AI to generate contextual questions from alumni data.
 * Falls back to data-driven questions (no AI) when Gemini is unavailable.
 * Always returns 200 — the widget should always show suggestions.
 */
export async function GET(_request: NextRequest) {
  try {
    // Check authentication — location is only used in suggestions for logged-in users
    const { user } = await getUser();
    const isAuthenticated = !!user;

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('name, location, current_job, designation_organisation, year_graduated')
      .order('name')
      .limit(40);

    // Redact location for unauthenticated users so generated suggestions don't reveal addresses
    const safeProfiles = (profiles || []).map(p =>
      isAuthenticated ? p : { ...p, location: null }
    );

    // Try Gemini first (better, more varied questions)
    if (safeProfiles.length > 0) {
      try {
        const sampleContext = safeProfiles.map(p => {
          const parts: string[] = [p.name];
          if (p.current_job) parts.push(p.current_job);
          if (p.designation_organisation) parts.push(p.designation_organisation);
          if (p.location) parts.push(p.location);
          return parts.join(' | ');
        }).join('\n');

        const aiQuestions = await generateExampleQuestions(sampleContext);
        if (aiQuestions.length > 0) {
          return NextResponse.json({ questions: aiQuestions.slice(0, 6) });
        }
      } catch {
        // Gemini unavailable — fall through to data-driven questions
      }

      // Generate questions directly from data (no AI needed)
      const dataQuestions = generateDataDrivenQuestions(
        safeProfiles.map(p => ({
          name: p.name,
          location: p.location,
          current_job: p.current_job,
          designation_organisation: p.designation_organisation,
          year_graduated: p.year_graduated,
          nicknames: null,
        }))
      );

      if (dataQuestions.length > 0) {
        return NextResponse.json({ questions: dataQuestions });
      }
    }

    return NextResponse.json({ questions: FALLBACK_QUESTIONS });

  } catch (error) {
    console.error('Error in example-questions:', error);
    return NextResponse.json({ questions: FALLBACK_QUESTIONS });
  }
}
