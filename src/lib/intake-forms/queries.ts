import { createClient } from
  "@/lib/supabase/server";

export async function getOwnedFormLink(): Promise<
  string | null
> {
  const supabase = await createClient();

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("intake_form_links")
    .select("public_owner_id")
    .eq("owner_user_id", userResult.user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as {
    public_owner_id: string;
  };

  return row.public_owner_id;
}

export async function getFormLinkOwner(
  publicOwnerId: string,
): Promise<{
  ownerUserId: string;
  publicOwnerId: string;
} | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("intake_form_links")
    .select("owner_user_id, public_owner_id")
    .eq("public_owner_id", publicOwnerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as {
    owner_user_id: string;
    public_owner_id: string;
  };

  return {
    ownerUserId: row.owner_user_id,
    publicOwnerId: row.public_owner_id,
  };
}

export async function getPublishedSharePath(
  publicOwnerId: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("share_pages")
    .select("slug")
    .eq("public_owner_id", publicOwnerId)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("updated_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as {
    slug: string;
  };

  return `/${publicOwnerId}/${row.slug}`;
}
