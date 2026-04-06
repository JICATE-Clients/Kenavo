/**
 * Fetch wrapper with AbortController timeout for Supabase clients.
 * Prevents server-side hangs when Supabase is unreachable (firewall, network block, etc.)
 * Used in both supabase-admin.ts and auth/server.ts
 */
const SUPABASE_TIMEOUT_MS = 15000; // 15 s — Admin API calls (e.g. listUsers) can be slow on cold start

export function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}
