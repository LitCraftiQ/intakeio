import { createClient } from
  "@/lib/supabase/server";

import type {
  SharePage,
  SharePageLink,
  ShareLinkPlatform,
  SharePageStatus,
  SharePageTheme,
} from "./types";

type RawSharePageLink = {
  id: string;
  platform: ShareLinkPlatform;
  url: string;
  position: number;
};

type RawSharePage = {
  id: string;
  display_name: string;
  slug: string;

  email: string | null;
  phone: string | null;

  internal_name: string | null;
  introduction: string | null;

  status: SharePageStatus;
  theme: SharePageTheme;

  created_at: string;
  updated_at: string;

  share_page_links:
    | RawSharePageLink[]
    | null;
};

const sharePageSelection = `
  id,
  display_name,
  slug,
  email,
  phone,
  internal_name,
  introduction,
  status,
  theme,
  created_at,
  updated_at,
  share_page_links (
    id,
    platform,
    url,
    position
  )
`;

function mapSharePage(
  row: RawSharePage,
): SharePage {
  const links: SharePageLink[] = [
    ...(row.share_page_links ?? []),
  ]
    .sort(
      (first, second) =>
        first.position -
        second.position,
    )
    .map((link) => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
      position: link.position,
    }));

  return {
    id: row.id,

    displayName: row.display_name,
    slug: row.slug,

    email: row.email,
    phone: row.phone,

    internalName: row.internal_name,
    introduction: row.introduction,

    status: row.status,
    theme: row.theme,

    links,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getOwnedSharePagesErrorMessage(
  code?: string,
) {
  if (code === "PGRST205") {
    return "Share Pages are not installed on this database yet. Run supabase/migrations/202608040001_share_pages_public_links.sql in the Supabase SQL Editor, then reload.";
  }

  return "Unable to load Share Pages right now.";
}

export async function getOwnedSharePages(): Promise<{
  pages: SharePage[];
  errorMessage: string | null;
}> {
  const supabase =
    await createClient();

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  const user = userResult.user;

  if (userError || !user) {
    return {
      pages: [],
      errorMessage: null,
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("share_pages")
    .select(sharePageSelection)
    .eq("owner_user_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    return {
      pages: [],
      errorMessage:
        getOwnedSharePagesErrorMessage(
          error.code,
        ),
    };
  }

  return {
    pages: (
      (data ?? []) as unknown as
        RawSharePage[]
    ).map(mapSharePage),
    errorMessage: null,
  };
}

export async function getOwnedSharePageById(
  id: string,
): Promise<SharePage | null> {
  const supabase =
    await createClient();

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  const user = userResult.user;

  if (userError || !user) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("share_pages")
    .select(sharePageSelection)
    .eq("id", id)
    .eq("owner_user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapSharePage(
    data as unknown as RawSharePage,
  );
}

export async function getPublicSharePageMeta(
  publicUserId: string,
  slug: string,
): Promise<{
  displayName: string;
  theme: SharePageTheme;
} | null> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("share_pages")
    .select(
      "display_name, theme",
    )
    .eq(
      "public_owner_id",
      publicUserId,
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as {
    display_name: string;
    theme: SharePageTheme;
  };

  return {
    displayName: row.display_name,
    theme: row.theme,
  };
}

export async function getPublicSharePage(
  publicUserId: string,
  slug: string,
): Promise<SharePage | null> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("share_pages")
    .select(sharePageSelection)
    .eq(
      "public_owner_id",
      publicUserId,
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapSharePage(
    data as unknown as RawSharePage,
  );
}