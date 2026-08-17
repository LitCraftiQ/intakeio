import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnvironment } from "./env";
import { fetchSupabase } from "./fetch";

let browserClient:
  | ReturnType<typeof createBrowserClient>
  | undefined;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, publishableKey } =
    getSupabaseEnvironment();

  browserClient = createBrowserClient(
    url,
    publishableKey,
    {
      global: {
        fetch: fetchSupabase,
      },
    },
  );

  return browserClient;
}