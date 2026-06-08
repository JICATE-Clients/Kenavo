/**
 * Smart alumni search with natural-language response formatting.
 * Used as a fallback when the Gemini API is unavailable.
 */

export type AlumniRecord = {
  name: string;
  location: string | null;
  current_job: string | null;
  designation_organisation: string | null;
  year_graduated: string | null;
  nicknames: string | null;
};

const STOP_WORDS = new Set([
  'who', 'what', 'where', 'how', 'tell', 'me', 'about', 'the', 'is', 'are',
  'any', 'some', 'a', 'an', 'and', 'or', 'in', 'at', 'from', 'to', 'for',
  'of', 'do', 'does', 'working', 'lives', 'based', 'classmate', 'alumni',
  'directory', 'kenavo', 'montfort', 'know', 'find', 'show', 'get', 'list',
  'all', 'their', 'they', 'them', 'with', 'have', 'has', 'was', 'were',
  'class', '2000', 'year', 'anyone', 'somebody', 'people', 'person',
]);

function extractTerms(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function scoreProfile(terms: string[], p: AlumniRecord): number {
  const fields = [
    { value: p.name,                      weight: 5 },
    { value: p.nicknames,                 weight: 4 },
    { value: p.location,                  weight: 3 },
    { value: p.current_job,               weight: 2 },
    { value: p.designation_organisation,  weight: 2 },
    { value: p.year_graduated,            weight: 1 },
  ];

  let score = 0;
  for (const { value, weight } of fields) {
    if (!value) continue;
    const lower = value.toLowerCase();
    for (const term of terms) {
      if (lower.includes(term)) {
        score += weight;
        if (lower.startsWith(term)) score += weight; // prefix bonus
      }
    }
  }
  return score;
}

/** Return alumni ranked by relevance to the query. */
export function searchAlumni(query: string, profiles: AlumniRecord[]): AlumniRecord[] {
  const terms = extractTerms(query);
  if (terms.length === 0) return profiles.slice(0, 5);

  return profiles
    .map(p => ({ p, score: scoreProfile(terms, p) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(s => s.p);
}

function describeProfile(p: AlumniRecord): string {
  const job = p.current_job && p.designation_organisation
    ? `${p.current_job} at ${p.designation_organisation}`
    : p.current_job || p.designation_organisation || '';
  const loc = p.location ? `based in ${p.location}` : '';
  return [job, loc].filter(Boolean).join(', ');
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Build a natural-sounding response from search results. */
export function buildSmartResponse(query: string, allProfiles: AlumniRecord[]): string {
  const lower = query.trim().toLowerCase();

  // Greeting
  if (/^(hi|hello|hey|howdy|namaste|greetings|good\s*(morning|evening|afternoon))[\s!.,?]*$/i.test(query.trim())) {
    return "Hey there! I'm Kenavo AI — your guide to the Montfort Class of 2000 alumni directory. Ask me about any classmate. Try something like \"Tell me about Srinivasan\" or \"Who's working in tech?\"";
  }

  // Count queries
  if (/(how many|total number|count of|number of)\s*(alumni|people|classmates|members)?/.test(lower)) {
    return `There are ${allProfiles.length} alumni in the Kenavo directory from the Montfort Class of 2000. Ask me about any of them!`;
  }

  // General / browse
  if (/(everyone|all alumni|whole class|all of them|all classmates|show all)/.test(lower)) {
    const sample = allProfiles.slice(0, 6).map(p => {
      const desc = describeProfile(p);
      return `• ${p.name}${desc ? ' — ' + desc : ''}`;
    }).join('\n');
    return `Here's a sample of our ${allProfiles.length} alumni:\n\n${sample}\n\nTry asking about someone specific or by location / job!`;
  }

  const results = searchAlumni(query, allProfiles);

  if (results.length === 0) {
    return `I couldn't find anyone matching "${query}" in the directory. Try searching by name, city, or job — for example, "Who's in Chennai?" or "Tell me about Tom Jogy".`;
  }

  if (results.length === 1) {
    const p = results[0];
    const desc = describeProfile(p);
    const parts: string[] = [`Here's what I know about ${p.name}!`];
    if (desc) parts.push(cap(desc) + '.');
    if (p.year_graduated) parts.push(`Part of the Montfort Class of ${p.year_graduated}.`);
    if (p.nicknames) parts.push(`Known to friends as ${p.nicknames}.`);
    return parts.join(' ');
  }

  if (results.length <= 4) {
    const list = results
      .map(p => `• ${p.name}${describeProfile(p) ? ' — ' + describeProfile(p) : ''}`)
      .join('\n');
    return `I found ${results.length} alumni matching your search:\n\n${list}`;
  }

  // 5+ results — show top 5 with a "more" note
  const list = results.slice(0, 5)
    .map(p => `• ${p.name}${describeProfile(p) ? ' — ' + describeProfile(p) : ''}`)
    .join('\n');
  const more = results.length > 5
    ? `\n\nShowing 5 of ${results.length} matches. Try a more specific search to narrow it down!`
    : '';
  return `Here are some alumni matching your search:\n\n${list}${more}`;
}

/** Generate contextual example questions from the actual alumni data. */
export function generateDataDrivenQuestions(profiles: AlumniRecord[]): string[] {
  const questions: string[] = [];

  // Top locations
  const locationCounts: Record<string, number> = {};
  profiles.forEach(p => {
    if (p.location) {
      const loc = p.location.split(',')[0].trim(); // city part only
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    }
  });
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([loc]) => loc);

  if (topLocations[0]) questions.push(`Who's based in ${topLocations[0]}?`);
  if (topLocations[1]) questions.push(`Any alumni in ${topLocations[1]}?`);

  // Pick a couple of real names
  const withJobs = profiles.filter(p => p.current_job || p.designation_organisation);
  if (withJobs.length > 0) {
    const pick = withJobs[Math.floor(withJobs.length / 3)]; // pick one from the middle
    questions.push(`Tell me about ${pick.name}`);
  }

  // Tech / industry queries
  const techAlumni = profiles.filter(p =>
    (p.current_job || p.designation_organisation || '')
      .toLowerCase()
      .match(/tech|software|engineer|it |digital|developer/i)
  );
  if (techAlumni.length > 0) questions.push("Who's working in tech?");

  // Always-good questions
  questions.push("What are classmates doing now?");
  questions.push(`How many alumni are in the directory?`);

  return questions.slice(0, 6);
}
