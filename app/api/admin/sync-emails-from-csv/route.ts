import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';

export const dynamic = 'force-dynamic';

/**
 * Sync Emails from Slambook CSV
 * ONLY updates email + phone on existing profiles by matching name.
 * Never creates new profiles, never touches any other field.
 *
 * CSV columns expected:
 *   Col 1  → Full Name
 *   Col 17 → Email
 *   Col 18 → Phone Number
 */

// ── CSV parser (handles quoted multi-line fields) ────────────────────────────
function parseCSV(content: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim()); current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(current.trim());
      if (row.some(c => c.trim())) result.push(row);
      row = []; current = '';
    } else {
      current += char;
    }
  }
  if (current || row.length > 0) {
    row.push(current.trim());
    if (row.some(c => c.trim())) result.push(row);
  }
  return result;
}

// ── Normalize name for fuzzy matching ────────────────────────────────────────
function normalize(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')   // strip punctuation
    .replace(/\s+/g, ' ')      // collapse spaces
    .trim();
}

// ── Strip quotes left from CSV parsing ───────────────────────────────────────
function clean(val: string): string {
  return val?.replace(/^"|"$/g, '').trim() ?? '';
}

// ── POST handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    const formData = await request.formData();
    const csvFile = formData.get('csvFile') as File;

    if (!csvFile || !csvFile.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Please upload a valid CSV file' }, { status: 400 });
    }

    const content = await csvFile.text();
    const rows = parseCSV(content);

    if (rows.length < 2) {
      return NextResponse.json({ error: 'CSV has no data rows' }, { status: 400 });
    }

    // ── Step 1: Parse CSV → name + email + phone only ────────────────────────
    interface CsvEntry { name: string; email: string; phone: string; row: number; }
    const csvEntries: CsvEntry[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue;

      const name  = clean(row[1]);
      const email = clean(row[17] ?? '');
      const phone = clean(row[18] ?? '');

      if (!name) continue;
      // Only include rows that have at least an email
      if (!email || email.toUpperCase() === 'NA') continue;

      csvEntries.push({ name, email, phone, row: i + 1 });
    }

    if (csvEntries.length === 0) {
      return NextResponse.json({ error: 'No valid email entries found in CSV' }, { status: 400 });
    }

    // ── Step 2: Load all profiles from DB ────────────────────────────────────
    const { data: profiles, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email');

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch profiles: ' + fetchError.message }, { status: 500 });
    }

    // Build lookup map: normalizedName → profile
    const profileMap = new Map(
      (profiles ?? []).map(p => [normalize(p.name), p])
    );

    // ── Step 3: Match each CSV entry to a profile ─────────────────────────────
    const matched:   Array<{ profileId: number; profileName: string; csvName: string; email: string; phone: string; }> = [];
    const unmatched: Array<{ csvName: string; email: string; reason: string }> = [];

    for (const entry of csvEntries) {
      const csvNorm = normalize(entry.name);

      // Priority 1: exact normalized match
      if (profileMap.has(csvNorm)) {
        const profile = profileMap.get(csvNorm)!;
        matched.push({ profileId: profile.id, profileName: profile.name, csvName: entry.name, email: entry.email, phone: entry.phone });
        continue;
      }

      // Priority 2: first + last name match
      const words = csvNorm.split(' ').filter(Boolean);
      if (words.length >= 2) {
        const firstLast = `${words[0]} ${words[words.length - 1]}`;
        let partialMatch: typeof profiles[0] | undefined;

        for (const [dbNorm, profile] of profileMap.entries()) {
          const dbWords = dbNorm.split(' ').filter(Boolean);
          if (dbWords.length >= 2) {
            const dbFirstLast = `${dbWords[0]} ${dbWords[dbWords.length - 1]}`;
            if (dbFirstLast === firstLast) { partialMatch = profile; break; }
          }
        }

        if (partialMatch) {
          matched.push({ profileId: partialMatch.id, profileName: partialMatch.name, csvName: entry.name, email: entry.email, phone: entry.phone });
          continue;
        }
      }

      unmatched.push({ csvName: entry.name, email: entry.email, reason: 'No profile found with this name' });
    }

    // ── Step 4: Update ONLY email + phone on matched profiles ─────────────────
    let updatedCount = 0;
    let failedCount  = 0;
    const updateErrors: string[] = [];

    for (const m of matched) {
      const updatePayload: Record<string, string> = { email: m.email };
      if (m.phone && m.phone.toUpperCase() !== 'NA' && m.phone !== '#ERROR!') {
        updatePayload.phone = m.phone;
      }

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update(updatePayload)
        .eq('id', m.profileId);

      if (updateError) {
        failedCount++;
        updateErrors.push(`Profile "${m.profileName}" (ID ${m.profileId}): ${updateError.message}`);
      } else {
        updatedCount++;
        console.log(`✅ Updated email for "${m.profileName}" (ID ${m.profileId}) → ${m.email}`);
      }
    }

    // ── Response ──────────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      summary: {
        totalInCSV:   csvEntries.length,
        matched:      matched.length,
        updated:      updatedCount,
        failed:       failedCount,
        unmatched:    unmatched.length,
      },
      updatedProfiles: matched.map(m => ({
        id:          m.profileId,
        profileName: m.profileName,
        csvName:     m.csvName,
        email:       m.email,
        phone:       m.phone,
      })),
      unmatchedEntries: unmatched,
      errors: updateErrors.length ? updateErrors : undefined,
      message: `Updated email/phone for ${updatedCount} profiles. ${unmatched.length} could not be matched.`,
    });

  } catch (error) {
    console.error('Email sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
