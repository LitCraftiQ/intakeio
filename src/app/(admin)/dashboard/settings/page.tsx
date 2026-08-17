import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsWorkspace } from
  "@/components/dashboard/settings-workspace";
import { getUserDisplayName } from
  "@/lib/auth/display-name";
import { getOwnedFormLink } from
  "@/lib/intake-forms/queries";
import { createClient } from
  "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  const user = userResult.user;

  if (userError || !user) {
    redirect("/register");
  }

  const formPublicOwnerId =
    await getOwnedFormLink();

  const providers = Array.from(
    new Set(
      (user.identities ?? [])
        .map((identity) => identity.provider)
        .filter(Boolean),
    ),
  );

  return (
    <SettingsWorkspace
      displayName={getUserDisplayName(user)}
      email={user.email ?? "Authenticated user"}
      providers={providers}
      formPublicOwnerId={formPublicOwnerId}
    />
  );
}
