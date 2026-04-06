import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for large uploads

/**
 * Complete Slambook Upload API
 * Handles single CSV file with both profile and Q&A data
 * Automatically splits, creates profiles, and uploads Q&A answers
 */

// Interface for parsed row
interface SlambookRow {
  rowNumber: number;
  name: string;
  nickname: string;
  location: string;
  currentJob: string;
  tenure: string;
  designationOrganisation: string;
  answers: string[]; // 10 Q&A answers
  email: string;     // Col R (index 17)
  phone: string;     // Col S (index 18)
}

// Parse CSV content - FIXED to handle multiline quoted fields correctly
function parseCSV(content: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  // Process the entire content character by character
  // This correctly handles newlines INSIDE quoted fields
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      // Handle escaped quotes (double quotes "")
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip the escaped quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator (only when not inside quotes)
      row.push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // Row separator (only when not inside quotes)
      // Handle both \r\n and \n line endings
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip the \n in \r\n
      }

      // Push current field and complete the row
      row.push(current.trim());

      // Only add row if it has content (skip empty rows)
      if (row.length > 0 && row.some(cell => cell.trim())) {
        result.push(row);
      }

      // Reset for next row
      row = [];
      current = '';
    } else {
      // Add character to current field (including newlines inside quotes)
      current += char;
    }
  }

  // Handle last row if content doesn't end with newline
  if (current || row.length > 0) {
    row.push(current.trim());
    if (row.some(cell => cell.trim())) {
      result.push(row);
    }
  }

  return result;
}

// Extract graduation year from tenure - ENHANCED to handle multiple formats including ranges
function extractGradYear(tenure: string): string {
  if (!tenure) return '';

  // PRIORITY 1: Year range (e.g., "1993-2000" or "1993 - 2000")
  const rangeMatch = tenure.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) {
    return `${rangeMatch[1]}-${rangeMatch[2]}`;  // Return full range
  }

  // PRIORITY 2: Single year patterns
  const singleYearPatterns = [
    /class of (\d{4})/i,                 // Matches "Class of 1995"
    /batch[:\s]+(\d{4})/i,               // Matches "Batch: 1995" or "Batch 1995"
    /(\d{4})[:\s]*batch/i,               // Matches "1995 Batch"
    /graduated[:\s]+(\d{4})/i,           // Matches "Graduated: 1995"
    /(\d{4})$/,                          // Matches "1995" at end
    /\b(\d{4})\b/,                       // Any 4-digit number (fallback)
  ];

  for (const pattern of singleYearPatterns) {
    const match = tenure.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return '';
}

// Parse slambook rows
function parseSlambookData(rows: string[][]): SlambookRow[] {
  const data: SlambookRow[] = [];

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Need at least 17 columns (1 serial + 6 profile + 10 Q&A); email/phone at 17-18 are optional
    if (row.length < 17) continue;

    // Remove quotes from values
    const cleanValue = (val: string) => val?.replace(/^"|"$/g, '').trim() ?? '';

    const slambookRow: SlambookRow = {
      rowNumber: i,
      name: cleanValue(row[1]) || '', // Full Name
      nickname: cleanValue(row[2]) || '', // Nickname at School
      location: cleanValue(row[3]) || '', // Current Residential Address
      currentJob: cleanValue(row[4]) || '', // Current Profession
      tenure: cleanValue(row[5]) || '', // Tenure at Montfort
      designationOrganisation: cleanValue(row[6]) || '', // Designation / Organisation
      answers: [
        cleanValue(row[7]) || '',  // Q1
        cleanValue(row[8]) || '',  // Q2
        cleanValue(row[9]) || '',  // Q3
        cleanValue(row[10]) || '', // Q4
        cleanValue(row[11]) || '', // Q5
        cleanValue(row[12]) || '', // Q6
        cleanValue(row[13]) || '', // Q7
        cleanValue(row[14]) || '', // Q8
        cleanValue(row[15]) || '', // Q9
        cleanValue(row[16]) || '', // Q10
      ],
      email: cleanValue(row[17]) || '', // Col R - Email
      phone: cleanValue(row[18]) || '', // Col S - Phone Number
    };

    // Only add if has a name
    if (slambookRow.name) {
      data.push(slambookRow);
    }
  }

  return data;
}

export async function POST(request: NextRequest) {
  // Protect this route
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  try {
    const formData = await request.formData();
    const csvFile = formData.get('csvFile') as File;

    if (!csvFile) {
      return NextResponse.json(
        { error: 'No CSV file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!csvFile.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV file' },
        { status: 400 }
      );
    }

    // Read CSV content
    const content = await csvFile.text();
    const rows = parseCSV(content);

    if (rows.length < 2) {
      return NextResponse.json(
        { error: 'CSV file is empty or has no data rows' },
        { status: 400 }
      );
    }

    // Parse slambook data
    const slambookData = parseSlambookData(rows);

    if (slambookData.length === 0) {
      return NextResponse.json(
        { error: 'No valid data found in CSV' },
        { status: 400 }
      );
    }

    console.log(`Parsed ${slambookData.length} profiles from CSV`);

    // Step 1: Check which profiles already exist by matching name + year_graduated
    // Normalize function for better matching - strips special characters for consistent matching
    const normalizeName = (name: string): string => {
      return name
        .trim()
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove ALL special characters (periods, commas, etc.)
        .replace(/\s+/g, ' ')     // Normalize whitespace to single spaces
        .trim();
    };

    // ENHANCED: Get first and last name for partial matching
    const getFirstLastName = (normalizedName: string): string => {
      const words = normalizedName.split(' ').filter(w => w.length > 0);
      if (words.length >= 2) {
        return `${words[0]} ${words[words.length - 1]}`;
      }
      return normalizedName;
    };

    // ENHANCED: Multi-level matching function
    interface MatchResult {
      profile: any;
      confidence: number;
      matchType: 'exact' | 'name-only' | 'partial' | 'none';
      reason?: string;
    }

    const findBestMatch = (csvName: string, csvYear: string, profileMap: Map<string, any>): MatchResult => {
      const csvNormalized = normalizeName(csvName);

      // PRIORITY 1: Name-only match (ALWAYS prefer updating existing profile)
      // This ensures we UPDATE existing profiles instead of creating duplicates
      // Even if the year differs, we update the year rather than create new profile
      for (const [key, profile] of profileMap.entries()) {
        const [dbName, dbYear] = key.split('|');
        if (dbName === csvNormalized) {
          const isExactMatch = dbYear === csvYear;
          return {
            profile,
            confidence: isExactMatch ? 100 : 95,
            matchType: isExactMatch ? 'exact' : 'name-only',
            reason: isExactMatch
              ? 'Exact name and year match'
              : `Name matches, year will be updated (DB: "${dbYear}" → CSV: "${csvYear}")`
          };
        }
      }

      // PRIORITY 2: Partial match (first + last name only)
      // Only used if full name doesn't match (e.g., middle name differences)
      const csvFirstLast = getFirstLastName(csvNormalized);
      if (csvFirstLast.split(' ').length >= 2) {
        for (const [key, profile] of profileMap.entries()) {
          const [dbName] = key.split('|');
          const dbFirstLast = getFirstLastName(dbName);
          if (csvFirstLast === dbFirstLast) {
            return {
              profile,
              confidence: 75,
              matchType: 'partial',
              reason: `Partial match: "${csvNormalized}" ≈ "${dbName}"`
            };
          }
        }
      }

      // PRIORITY 3: No match found - create new profile
      // Only create if name doesn't exist in database at all
      return {
        profile: null,
        confidence: 0,
        matchType: 'none'
      };
    };

    const profileIdentifiers = slambookData.map(row => ({
      name: row.name,
      year_graduated: extractGradYear(row.tenure)
    }));

    // Get all existing profiles to check for matches
    // ENHANCED: Also fetch profile_image_url to preserve it during updates
    const { data: existingProfiles, error: existingError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, year_graduated, profile_image_url');

    if (existingError) {
      console.error('Error fetching existing profiles:', existingError);
      return NextResponse.json(
        {
          error: 'Failed to fetch existing profiles',
          details: existingError.message,
        },
        { status: 500 }
      );
    }

    // Create a map of existing profiles: "normalized_name|year" -> profile
    // Use normalized names for better matching
    const existingProfileMap = new Map(
      (existingProfiles || []).map(p => [
        `${normalizeName(p.name)}|${p.year_graduated || ''}`,
        p
      ])
    );

    console.log(`Found ${existingProfileMap.size} existing profiles in database`);

    // Step 2: Get max ID for new profiles
    const { data: maxIdResult, error: maxIdError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (maxIdError) {
      console.error('Error getting max profile ID:', maxIdError);
      return NextResponse.json(
        {
          error: 'Failed to get max profile ID',
          details: maxIdError.message,
        },
        { status: 500 }
      );
    }

    let nextId = (maxIdResult && maxIdResult.length > 0 ? maxIdResult[0].id : 0) + 1;
    console.log(`Starting new profile IDs from: ${nextId}`);

    // Step 3: ENHANCED - Prepare profiles for UPSERT with multi-level matching
    let exactMatchCount = 0;
    let nameOnlyMatchCount = 0;
    let partialMatchCount = 0;
    let noMatchCount = 0;

    // Track match details for response
    const matchDetails: Array<{
      csvName: string;
      csvYear: string;
      matchType: string;
      profileId?: number;
      confidence?: number;
      reason?: string;
    }> = [];

    const profilesToUpsert = slambookData.map((row) => {
      const yearGraduated = extractGradYear(row.tenure);

      // ENHANCED: Use multi-level matching
      const matchResult = findBestMatch(row.name, yearGraduated, existingProfileMap);

      const profileData: Record<string, string> = {
        name: row.name.trim(), // Keep original name but trimmed
        nicknames: row.nickname,
        location: row.location,
        current_job: row.currentJob,
        year_graduated: yearGraduated,
        designation_organisation: row.designationOrganisation,
        ...(row.email ? { email: row.email } : {}),
        ...(row.phone ? { phone: row.phone } : {}),
      };

      // Track match type for statistics
      if (matchResult.matchType === 'exact') {
        exactMatchCount++;
        console.log(`✓ Exact Match: "${row.name}" -> Profile ID ${matchResult.profile.id} (100%)`);
      } else if (matchResult.matchType === 'name-only') {
        nameOnlyMatchCount++;
        console.log(`≈ Name Match: "${row.name}" -> Profile ID ${matchResult.profile.id} (90%) - ${matchResult.reason}`);
      } else if (matchResult.matchType === 'partial') {
        partialMatchCount++;
        console.log(`~ Partial Match: "${row.name}" -> Profile ID ${matchResult.profile.id} (75%) - ${matchResult.reason}`);
      } else {
        noMatchCount++;
        const newId = nextId++;
        console.log(`+ New Profile: "${row.name}" -> Profile ID ${newId} (no match found)`);
        matchDetails.push({
          csvName: row.name,
          csvYear: yearGraduated,
          matchType: 'new',
          profileId: newId,
          confidence: 0,
          reason: 'No matching profile found in database'
        });
      }

      if (matchResult.profile) {
        // Profile matched (exact, name-only, or partial) - update it
        matchDetails.push({
          csvName: row.name,
          csvYear: yearGraduated,
          matchType: matchResult.matchType,
          profileId: matchResult.profile.id,
          confidence: matchResult.confidence,
          reason: matchResult.reason
        });

        // IMPORTANT: Preserve existing profile_image_url when updating
        const updateData: any = {
          id: matchResult.profile.id,
          ...profileData
        };

        // Only preserve profile_image_url if the existing profile has one
        if (matchResult.profile.profile_image_url) {
          updateData.profile_image_url = matchResult.profile.profile_image_url;
          console.log(`  → Preserving profile image for "${row.name}"`);
        }

        return updateData;
      } else {
        // New profile - assign new ID (no profile_image_url)
        const newId = nextId++;
        return {
          id: newId,
          ...profileData
        };
      }
    });

    const totalMatched = exactMatchCount + nameOnlyMatchCount + partialMatchCount;
    console.log(`\nMatching Summary:`);
    console.log(`  ✓ Exact matches: ${exactMatchCount} (100% confidence)`);
    console.log(`  ≈ Name-only matches: ${nameOnlyMatchCount} (90% confidence)`);
    console.log(`  ~ Partial matches: ${partialMatchCount} (75% confidence)`);
    console.log(`  + New profiles: ${noMatchCount}`);
    console.log(`  Total matched: ${totalMatched}/${slambookData.length}\n`);

    // Step 4: Perform UPSERT (update existing, insert new)
    const { data: upsertedProfiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profilesToUpsert, {
        onConflict: 'id'  // Use ID as conflict resolution
      })
      .select('id, name');

    if (profileError) {
      console.error('Error upserting profiles:', profileError);
      return NextResponse.json(
        {
          error: 'Failed to upsert profiles',
          details: profileError.message,
        },
        { status: 500 }
      );
    }

    if (!upsertedProfiles || upsertedProfiles.length === 0) {
      return NextResponse.json(
        { error: 'No profiles were upserted' },
        { status: 500 }
      );
    }

    console.log(`Upserted ${upsertedProfiles.length} profiles (${totalMatched} matched, ${noMatchCount} created)`);

    // Step 5: Map profiles to Q&A data
    // The order of upserted profiles matches the order of slambook data
    const qaEntries: Array<{
      profile_id: number;
      question_id: number;
      answer: string;
    }> = [];

    for (let i = 0; i < upsertedProfiles.length; i++) {
      const profile = upsertedProfiles[i];
      const slambookRow = slambookData[i];

      // Add Q&A entries for this profile (questions 1-10)
      for (let q = 0; q < 10; q++) {
        const answer = slambookRow.answers[q];

        // Only add if answer is not empty
        if (answer && answer.trim()) {
          qaEntries.push({
            profile_id: profile.id,
            question_id: q + 1, // Questions are 1-indexed
            answer: answer,
          });
        }
      }
    }

    console.log(`Prepared ${qaEntries.length} Q&A entries`);

    // Step 6: Handle Q&A answers (delete old ones for updated profiles, then insert new)
    let qaCreatedCount = 0;
    let qaDeletedCount = 0;
    let qaErrorCount = 0;

    if (qaEntries.length > 0) {
      // Debug: Find profiles with no Q&A answers
      const profilesWithQA = new Set(qaEntries.map(qa => qa.profile_id));
      const profilesWithoutQA = upsertedProfiles.filter(p => !profilesWithQA.has(p.id));
      if (profilesWithoutQA.length > 0) {
        console.log(`⚠️  Warning: ${profilesWithoutQA.length} profile(s) have NO Q&A answers (all questions blank):`);
        profilesWithoutQA.forEach(p => console.log(`   - ID ${p.id}: ${p.name}`));
      }

      // Get ALL profile IDs that were upserted, not just ones with new answers
      // This ensures profiles with all empty answers also get their old Q&A deleted
      const profileIdsWithQA = upsertedProfiles.map(p => p.id);

      console.log(`Deleting old Q&A for ${profileIdsWithQA.length} profiles...`);

      // Delete existing Q&A answers for these profiles to prevent duplicates
      const { error: deleteError, count: deletedCount } = await supabaseAdmin
        .from('profile_answers')
        .delete()
        .in('profile_id', profileIdsWithQA);

      if (deleteError) {
        console.error('Error deleting old Q&A answers:', deleteError);
      } else {
        qaDeletedCount = deletedCount || 0;
        console.log(`Deleted ${qaDeletedCount} old Q&A answers`);
      }

      // Insert new Q&A answers
      console.log(`Inserting ${qaEntries.length} new Q&A answers...`);
      const { data: createdQA, error: qaError } = await supabaseAdmin
        .from('profile_answers')
        .insert(qaEntries)
        .select('id');

      if (qaError) {
        console.error('Error creating Q&A answers:', qaError);
        qaErrorCount = qaEntries.length;
      } else {
        qaCreatedCount = createdQA?.length || 0;
      }
    }

    console.log(`Q&A Summary: Deleted ${qaDeletedCount}, Created ${qaCreatedCount}`);

    // ENHANCED: Prepare response with detailed matching information
    const unmatchedProfiles = matchDetails.filter(m => m.matchType === 'new');
    const partialMatches = matchDetails.filter(m => m.matchType === 'partial');
    const nameOnlyMatches = matchDetails.filter(m => m.matchType === 'name-only');

    const response = {
      success: true,
      profiles: {
        total: slambookData.length,
        matched: totalMatched,
        exactMatch: exactMatchCount,
        nameOnlyMatch: nameOnlyMatchCount,
        partialMatch: partialMatchCount,
        unmatched: noMatchCount,
        failed: slambookData.length - upsertedProfiles.length,
      },
      qaAnswers: {
        total: qaEntries.length,
        deleted: qaDeletedCount,
        created: qaCreatedCount,
        failed: qaErrorCount,
      },
      matchingDetails: {
        totalProcessed: slambookData.length,
        matchRate: `${((totalMatched / slambookData.length) * 100).toFixed(1)}%`,
        unmatchedProfiles: unmatchedProfiles.map(m => ({
          name: m.csvName,
          year: m.csvYear,
          newProfileId: m.profileId,
          reason: m.reason
        })),
        partialMatches: partialMatches.map(m => ({
          csvName: m.csvName,
          matchedProfileId: m.profileId,
          confidence: m.confidence,
          reason: m.reason
        })),
        nameOnlyMatches: nameOnlyMatches.map(m => ({
          csvName: m.csvName,
          matchedProfileId: m.profileId,
          confidence: m.confidence,
          reason: m.reason
        })),
      },
      details: {
        profileIds: upsertedProfiles.map(p => p.id),
        profileNames: upsertedProfiles.map(p => p.name),
      },
      message: totalMatched > 0
        ? `Successfully matched ${totalMatched}/${slambookData.length} profiles ` +
          `(${exactMatchCount} exact, ${nameOnlyMatchCount} name-only, ${partialMatchCount} partial). ` +
          `Created ${noMatchCount} new profiles. ` +
          `Q&A: Replaced ${qaDeletedCount} old answers with ${qaCreatedCount} new answers.`
        : `Created ${noMatchCount} new profiles with ${qaCreatedCount} Q&A answers.`,
      warnings: noMatchCount > 0 || partialMatchCount > 0
        ? [
            ...(noMatchCount > 0 ? [`${noMatchCount} profiles had no match and were created as new (potential duplicates)`] : []),
            ...(partialMatchCount > 0 ? [`${partialMatchCount} profiles matched only partially (first+last name)`] : []),
          ]
        : undefined,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error processing slambook CSV:', error);
    return NextResponse.json(
      {
        error: 'Failed to process slambook CSV',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
