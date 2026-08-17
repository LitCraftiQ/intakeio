/**
 * Next.js patches global fetch and may cache or stall Auth requests.
 * Auth token refresh must always hit the network.
 */
export function fetchSupabase(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  return fetch(input, {
    ...init,
    cache: "no-store",
  });
}
