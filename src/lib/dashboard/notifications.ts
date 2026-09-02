import { createPrivilegedClient } from
  "@/lib/supabase/privileged";
import { createClient } from
  "@/lib/supabase/server";

import type {
  DashboardNotification,
  DashboardNotificationType,
} from "./types";

type RawDashboardNotification = {
  id: string;
  type: DashboardNotificationType;
  title: string;
  body: string;
  href: string;
  created_at: string;
  read_at: string | null;
};

type RawSharePageOwner = {
  id: string;
  owner_user_id: string;
  display_name: string;
  internal_name: string | null;
};

const openedThrottleMs =
  30 * 60 * 1000;

function mapDashboardNotification(
  row: RawDashboardNotification,
): DashboardNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

function getDashboardNotificationsErrorMessage(
  code?: string,
) {
  if (code === "PGRST205") {
    return "Notifications are not installed on this database yet. Run supabase/migrations/202608160003_dashboard_notifications.sql, then supabase/migrations/202609020001_notifications_realtime.sql and 202609020002_notify_contact_submitted.sql in the Supabase SQL Editor, then reload.";
  }

  return "Unable to load notifications right now.";
}

export async function getDashboardNotifications(): Promise<{
  notifications: DashboardNotification[];
  errorMessage: string | null;
}> {
  const supabase = await createClient();

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return {
      notifications: [],
      errorMessage: null,
    };
  }

  const { data, error } = await supabase
    .from("dashboard_notifications")
    .select(
      "id, type, title, body, href, created_at, read_at",
    )
    .eq("owner_user_id", userResult.user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(20);

  if (error) {
    return {
      notifications: [],
      errorMessage:
        getDashboardNotificationsErrorMessage(
          error.code,
        ),
    };
  }

  return {
    notifications: (
      (data ?? []) as RawDashboardNotification[]
    ).map(mapDashboardNotification),
    errorMessage: null,
  };
}

export async function notifySharePageOpened(
  publicOwnerId: string,
  slug: string,
) {
  try {
    const supabase =
      createPrivilegedClient();

    const { data: page, error: pageError } =
      await supabase
        .from("share_pages")
        .select(
          "id, owner_user_id, display_name, internal_name",
        )
        .eq("public_owner_id", publicOwnerId)
        .eq("slug", slug)
        .eq("status", "published")
        .is("deleted_at", null)
        .maybeSingle();

    if (pageError || !page) {
      return;
    }

    const ownerPage =
      page as RawSharePageOwner;

    const since = new Date(
      Date.now() - openedThrottleMs,
    ).toISOString();

    const { data: recent } = await supabase
      .from("dashboard_notifications")
      .select("id")
      .eq(
        "owner_user_id",
        ownerPage.owner_user_id,
      )
      .eq("share_page_id", ownerPage.id)
      .eq("type", "share_page_opened")
      .gte("created_at", since)
      .limit(1);

    if (recent && recent.length > 0) {
      return;
    }

    const pageName =
      ownerPage.internal_name?.trim() ||
      ownerPage.display_name;

    await supabase
      .from("dashboard_notifications")
      .insert({
        owner_user_id:
          ownerPage.owner_user_id,
        type: "share_page_opened",
        title: "Share page opened",
        body:
          `Someone opened ${pageName}.`.slice(
            0,
            180,
          ),
        href: "/dashboard",
        share_page_id: ownerPage.id,
      });
  } catch {
    return;
  }
}
