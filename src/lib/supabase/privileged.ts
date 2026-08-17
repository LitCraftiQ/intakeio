import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerEnvironment } from "@/lib/env/server";
import { fetchSupabase } from "./fetch";

export function createPrivilegedClient() {
  const {
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SECRET_KEY,
  } = getServerEnvironment();

  return createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SECRET_KEY,
    {
      global: {
        fetch: fetchSupabase,
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
}