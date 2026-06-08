import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { chatWithContext } from '@/lib/gemini/service';
import { buildSmartResponse } from '@/lib/alumni/smartSearch';
import type { ChatRequest, ChatMessage } from '@/lib/types/database';
import { v4 as uuidv4 } from 'uuid';

type ProfileRow = {
  name: string;
  location: string | null;
  current_job: string | null;
  designation_organisation: string | null;
  year_graduated: string | null;
  nicknames: string | null;
};

function buildAlumniContext(profiles: ProfileRow[]): string {
  return profiles.map(p => {
    const parts: string[] = [p.name];
    if (p.current_job && p.designation_organisation) parts.push(`${p.current_job} at ${p.designation_organisation}`);
    else if (p.current_job) parts.push(p.current_job);
    else if (p.designation_organisation) parts.push(p.designation_organisation);
    if (p.location) parts.push(p.location);
    if (p.year_graduated) parts.push(`Class of ${p.year_graduated}`);
    if (p.nicknames) parts.push(`aka ${p.nicknames}`);
    return parts.join(' | ');
  }).join('\n');
}

/** Returns true when the error is a permanent API-level block (not transient). */
function isPermanentBlock(err: any): boolean {
  const status = err?.status ?? err?.error?.code;
  const msg = err?.message?.toLowerCase() ?? '';
  return (
    status === 403 ||
    msg.includes('permission_denied') ||
    msg.includes('denied access') ||
    msg.includes('api key')
  );
}

/**
 * POST /api/gemini/chat
 *
 * Flow:
 *  1. Fetch all alumni profiles from Supabase.
 *  2. Try Gemini AI with alumni context injected into the system prompt.
 *  3. If Gemini returns a permanent 403 (project blocked / key invalid),
 *     fall back to the smart keyword-search response — zero AI needed.
 *  4. Save both turns to chat history and return the response.
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, sessionId } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const currentSessionId = sessionId || uuidv4();

    // ── 1. Fetch alumni profiles ───────────────────────────────────────────
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('name, location, current_job, designation_organisation, year_graduated, nicknames')
      .order('name');

    const safeProfiles: ProfileRow[] = profiles || [];

    // ── 2. Load session chat history ───────────────────────────────────────
    const { data: historyRecords } = await supabaseAdmin
      .from('gemini_chat_history')
      .select('message_role, message_text')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true });

    const history: ChatMessage[] = (historyRecords || []).map(r => ({
      role: r.message_role as 'user' | 'model',
      parts: [{ text: r.message_text }],
    }));

    // ── 3. Get AI response (Gemini first, smart search fallback) ──────────
    let responseText: string;

    try {
      const alumniContext = buildAlumniContext(safeProfiles);
      const aiResult = await chatWithContext(alumniContext, message, history);
      responseText = aiResult.text;
    } catch (geminiErr: any) {
      if (isPermanentBlock(geminiErr)) {
        // Gemini project is blocked — use smart keyword search instead
        responseText = buildSmartResponse(message, safeProfiles);
      } else if ((geminiErr?.status ?? 0) === 429) {
        return NextResponse.json(
          { error: "I'm a little busy right now — too many people asking at once! Please try again in a minute." },
          { status: 429 }
        );
      } else {
        // Transient error — still fall back gracefully
        console.error('Gemini error, falling back to smart search:', geminiErr?.message);
        responseText = buildSmartResponse(message, safeProfiles);
      }
    }

    // ── 4. Persist both turns ──────────────────────────────────────────────
    await supabaseAdmin.from('gemini_chat_history').insert([
      {
        session_id: currentSessionId,
        user_id: null,
        message_role: 'user',
        message_text: message,
        grounding_chunks: null,
      },
      {
        session_id: currentSessionId,
        user_id: null,
        message_role: 'model',
        message_text: responseText,
        grounding_chunks: null,
      },
    ]);

    return NextResponse.json({
      response: responseText,
      groundingChunks: [],
      sessionId: currentSessionId,
    });

  } catch (err: any) {
    console.error('Unexpected error in POST /api/gemini/chat:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
