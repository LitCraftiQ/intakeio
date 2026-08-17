"use server";

import { createClient } from "@/lib/supabase/server";

export type CompleteWelcomeResult = Readonly<{
  success: boolean;
}>;

export async function completeWelcome(): Promise<CompleteWelcomeResult> {
  const supabase = await createClient();

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  const user = userResult.user;

  if (userError || !user) {
    return {
      success: false,
    };
  }

  const now = new Date().toISOString();

  const { data: updatedRows, error } =
    await supabase
      .from("user_onboarding")
      .update({
        welcome_pending: false,
        welcome_shown_at: now,
        updated_at: now,
      })
      .eq("user_id", user.id)
      .select("user_id");

  if (error) {
    console.error(
      "Unable to complete welcome state.",
    );

    return {
      success: false,
    };
  }

  if (updatedRows && updatedRows.length > 0) {
    return {
      success: true,
    };
  }

  const { error: upsertError } =
    await supabase
      .from("user_onboarding")
      .upsert(
        {
          user_id: user.id,
          welcome_pending: false,
          welcome_shown_at: now,
          updated_at: now,
        },
        {
          onConflict: "user_id",
        },
      );

  if (upsertError) {
    console.error(
      "Unable to complete welcome state.",
    );

    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}
