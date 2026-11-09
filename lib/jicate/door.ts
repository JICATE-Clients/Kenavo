/**
 * JICATE AI door client (server only).
 *
 * The alumni chat can run on JICATE's own AI engine (Claude workers on the
 * JICATE Windows box) instead of calling Google Gemini directly. The app sends
 * one job to the JICATE Control Tower door and waits for the answer.
 *
 * Switched by env, so merging this code alone changes nothing:
 *   AI_PROVIDER   'jicate' to use the door; anything else (default) = Gemini
 *   AI_DOOR_URL   https://jkkn-centralized-bug-reporter.vercel.app/api/v1/public/ai/run
 *   AI_DOOR_KEY   this app's Control Tower API key (server env only, never public)
 *
 * Returns null whenever the door is off, refuses, fails or does not answer in
 * time ("the box is resting"). The caller then falls back to Gemini, so the
 * chat never goes silent.
 */

const TASK = 'kenavo.alumni_chat';
const POLL_EVERY_MS = 3000;
/** A real answer takes 10-30 s. After this long the box is busy or off. */
const DEFAULT_WAIT_MS = 60_000;

export type DoorTurn = { role: 'user' | 'assistant'; text: string };

export interface AlumniChatPayload {
  question: string;
  /** One line per alumnus, as built by buildAlumniContext. */
  alumni: string[];
  /** Earlier turns of this chat session, oldest first. */
  history: DoorTurn[];
  /** 'member' = signed in (location may be in the lines), 'guest' = not. */
  viewer: 'member' | 'guest';
}

export function jicateDoorEnabled(): boolean {
  return (
    (process.env.AI_PROVIDER || '').trim().toLowerCase() === 'jicate' &&
    !!process.env.AI_DOOR_URL &&
    !!process.env.AI_DOOR_KEY
  );
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Ask the JICATE engine. null = use the fallback (never throws). */
export async function askJicateDoor(
  payload: AlumniChatPayload,
  waitMs: number = DEFAULT_WAIT_MS
): Promise<string | null> {
  if (!jicateDoorEnabled()) return null;
  const door = process.env.AI_DOOR_URL!;
  const key = process.env.AI_DOOR_KEY!;
  const started = Date.now();

  let jobId = '';
  try {
    const r = await fetch(door, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
      body: JSON.stringify({ task: TASK, payload }),
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
    const j = await r.json().catch(() => ({}));
    jobId = j?.data?.job_id || j?.job_id || '';
    if (r.status !== 202 || !jobId) {
      // 503 task_switched_off, 429 rate limit, 403 not allowed, 5xx: fall back.
      console.warn('JICATE door refused, using fallback:', r.status, j?.error?.code ?? '');
      return null;
    }
  } catch (err) {
    console.warn('JICATE door unreachable, using fallback:', (err as Error)?.message);
    return null;
  }

  while (Date.now() - started < waitMs) {
    await sleep(POLL_EVERY_MS);
    try {
      const r = await fetch(`${door}?job_id=${encodeURIComponent(jobId)}`, {
        headers: { 'X-API-Key': key },
        signal: AbortSignal.timeout(10_000),
        cache: 'no-store',
      });
      if (r.status === 404) return null; // the door has no such job for our key
      if (!r.ok) continue; // 502 etc. are temporary: keep waiting
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const status = String(d?.status || '');
      if (status === 'done') {
        const result = d?.result;
        const answer = String(
          result?.answer ?? (typeof result === 'string' ? result : '')
        ).trim();
        return answer || null;
      }
      if (status === 'error') {
        console.warn('JICATE job failed, using fallback:', d?.error);
        return null;
      }
    } catch {
      // network blip: keep waiting until the time budget runs out
    }
  }

  console.warn(`JICATE box gave no answer in ${Math.round(waitMs / 1000)} s (resting), using fallback`);
  return null;
}
