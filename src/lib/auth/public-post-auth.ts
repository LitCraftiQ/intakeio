import type {
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

import {
  getStoredDisplayName,
  hasLinkedAuthProviders,
  isReturningAuthAccount,
} from "./display-name";

export async function persistUserDisplayName(
  supabase: SupabaseClient,
  user: User,
  preferredName?: string,
) {
  const existingName =
    getStoredDisplayName({
      user_metadata: user.user_metadata,
      identities: [],
    });

  if (existingName) {
    return;
  }

  const nextName =
    preferredName?.trim() ||
    getStoredDisplayName(user);

  if (!nextName) {
    return;
  }

  const { error } =
    await supabase.auth.updateUser({
      data: {
        full_name: nextName,
        name: nextName,
      },
    });

  if (error) {
    console.error(
      "Unable to save display name.",
    );
  }
}

export type PublicAuthDestination =
  | "/welcome"
  | "/dashboard";

export async function getPublicAuthDestination(
  supabase: SupabaseClient,
  user: User,
): Promise<PublicAuthDestination> {
  const userId = user.id;

  const {
    data: onboarding,
    error: lookupError,
  } = await supabase
    .from("user_onboarding")
    .select("welcome_pending")
    .eq("user_id", userId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(
      "Unable to read onboarding state.",
    );
  }

  const returningAccount =
    isReturningAuthAccount(user) ||
    (Boolean(onboarding) &&
      hasLinkedAuthProviders(user));

  if (
    onboarding?.welcome_pending === false
  ) {
    return "/dashboard";
  }

  if (
    onboarding?.welcome_pending === true
  ) {
    if (!returningAccount) {
      return "/welcome";
    }

    const now = new Date().toISOString();

    const { error: updateError } =
      await supabase
        .from("user_onboarding")
        .update({
          welcome_pending: false,
          updated_at: now,
        })
        .eq("user_id", userId);

    if (updateError) {
      throw new Error(
        "Unable to update onboarding state.",
      );
    }

    return "/dashboard";
  }

  const { error: insertError } =
    await supabase
      .from("user_onboarding")
      .insert({
        user_id: userId,
        welcome_pending:
          !returningAccount,
      });

  if (!insertError) {
    return returningAccount
      ? "/dashboard"
      : "/welcome";
  }

  if (insertError.code === "23505") {
    const {
      data: existingOnboarding,
      error: secondLookupError,
    } = await supabase
      .from("user_onboarding")
      .select("welcome_pending")
      .eq("user_id", userId)
      .single();

    if (secondLookupError) {
      throw new Error(
        "Unable to confirm onboarding state.",
      );
    }

    if (
      returningAccount ||
      !existingOnboarding.welcome_pending
    ) {
      return "/dashboard";
    }

    return "/welcome";
  }

  throw new Error(
    "Unable to create onboarding state.",
  );
}
