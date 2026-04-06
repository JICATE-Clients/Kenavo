/**
 * Fetch wrapper with AbortController timeout for Supabase clients.
 * Prevents server-side hangs when Supabase is unreachable (firewall, network block, etc.)
 * Used in both supabase-admin.ts and auth/server.ts
 */
const SUPABASE_TIMEOUT_MS = 8000; // 8 s — must be under Vercel Hobby's 10s function limit

export function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}
