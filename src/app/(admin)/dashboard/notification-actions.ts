"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from
  "@/lib/supabase/server";

const notificationIdsSchema = z
  .array(z.string().uuid())
  .min(1)
  .max(50);

export async function markDashboardNotificationsReadAction(
  ids: string[],
) {
  const parsed =
    notificationIdsSchema.safeParse(ids);

  if (!parsed.success) {
    return;
  }

  const supabase = await createClient();

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return;
  }

  const { error } = await supabase
    .from("dashboard_notifications")
    .update({
      read_at: new Date().toISOString(),
    })
    .in("id", parsed.data)
    .eq("owner_user_id", userResult.user.id)
    .is("read_at", null);

  if (error) {
    console.error(
      "Unable to mark notifications read.",
      {
        code: error.code,
      },
    );

    return;
  }

  revalidatePath("/dashboard", "layout");
}

export async function markAllDashboardNotificationsReadAction() {
  const supabase = await createClient();

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return;
  }

  const { error } = await supabase
    .from("dashboard_notifications")
    .update({
      read_at: new Date().toISOString(),
    })
    .eq("owner_user_id", userResult.user.id)
    .is("read_at", null);

  if (error) {
    console.error(
      "Unable to mark notifications read.",
      {
        code: error.code,
      },
    );

    return;
  }

  revalidatePath("/dashboard", "layout");
}
