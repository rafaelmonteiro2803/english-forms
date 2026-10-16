/** Builds "path?query" from a base query, dropping empty values. */
export function withParams(path: string, base: Record<string, string | undefined>, patch: Record<string, string | undefined> = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...base, ...patch })) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}

/** Reads a single string from Next's searchParams. */
export const param = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
