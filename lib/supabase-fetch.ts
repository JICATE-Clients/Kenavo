/**
 * Fetch wrapper with AbortController timeout for Supabase clients.
 * Prevents server-side hangs when Supabase is unreachable (firewall, network block, etc.)
 * Used in both supabase-admin.ts and auth/server.ts
 */
const SUPABASE_TIMEOUT_MS = 8000; // 8 s — must be under Vercel Hobby's 10s function limit
const MAX_RETRIES = 2; // total attempts for transient connection errors (safe methods only)
const RETRY_BACKOFF_MS = 300;

// Transient connection failures (resets, DNS blips) surface as a TypeError
// "fetch failed" whose `cause` carries the syscall errno. These are worth a retry.
// Our own timeout (AbortError) is intentional and must NOT be retried.
function isTransientNetworkError(err: unknown): boolean {
  if (err instanceof Error && err.name === 'AbortError') return false;
  const code = (err as any)?.cause?.code ?? (err as any)?.code;
  if (code) {
    return ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'EPIPE'].includes(code);
  }
  return err instanceof TypeError; // generic "fetch failed"
}

// Only retry idempotent requests so a reset-on-read never double-sends a write.
function isRetriableMethod(init?: RequestInit): boolean {
  const method = (init?.method ?? 'GET').toUpperCase();
  return method === 'GET' || method === 'HEAD';
}

export async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const attempts = isRetriableMethod(init) ? MAX_RETRIES : 1;
  let lastErr: unknown;

  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1 && isTransientNetworkError(err)) {
        await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS * (i + 1)));
        continue;
      }
      throw err;
    } finally {
      clearTimeout(id);
    }
  }

  throw lastErr;
}
