"use server";

import { redirect } from "next/navigation";

import { getServerEnvironment } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(): Promise<never> {
  const { APP_URL } = getServerEnvironment();
  const supabase = await createClient();

  const callbackUrl = new URL(
    "/auth/callback",
    APP_URL,
  );

  const { data, error } =
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

  if (error || !data.url) {
    redirect(
      "/register?error=google_sign_in_failed",
    );
  }

  redirect(data.url);
}