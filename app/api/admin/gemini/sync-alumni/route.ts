import { NextResponse } from 'next/server';

/**
 * POST /api/admin/gemini/sync-alumni — SWITCHED OFF (410 Gone)
 *
 * This route used to copy every alumni profile, including emails and phone
 * numbers, into Google Gemini's document store. It is switched off for privacy.
 * It no longer reads profiles and never calls Google.
 *
 * Note: anything sent to Google before this change is NOT removed by it.
 * The old code is in git history if a privacy-safe version is ever needed.
 */
const GONE_MESSAGE =
  "Alumni sync to Google Gemini is switched off for privacy: it sent classmates' emails and phone numbers to Google. Contact the site admin if you need it.";

export async function POST() {
  return NextResponse.json({ error: GONE_MESSAGE }, { status: 410 });
}
