"use server";

import { revalidatePath } from "next/cache";

import { createClient } from
  "@/lib/supabase/server";

export type CreateIntakeFormLinkResult =
  | {
      ok: true;
      publicOwnerId: string;
    }
  | {
      ok: false;
      message: string;
    };

function getCreateFormLinkErrorMessage(
  code?: string,
) {
  if (
    code === "PGRST205" ||
    code === "PGRST202" ||
    code === "42883"
  ) {
    return "The intake form is not installed on this database yet. Run supabase/migrations/202608160005_intake_form_links_and_contacts.sql in the Supabase SQL Editor, then reload.";
  }

  return "Unable to create your form link right now.";
}

export async function createIntakeFormLinkAction(): Promise<
  CreateIntakeFormLinkResult
> {
  const supabase = await createClient();

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return {
      ok: false,
      message:
        "Your session has expired. Sign in again.",
    };
  }

  const { data, error } =
    await supabase.rpc(
      "create_intake_form_link",
    );

  if (error) {
    return {
      ok: false,
      message:
        getCreateFormLinkErrorMessage(
          error.code,
        ),
    };
  }

  if (typeof data !== "string") {
    return {
      ok: false,
      message:
        "Unable to create your form link right now.",
    };
  }

  revalidatePath("/dashboard", "layout");

  return {
    ok: true,
    publicOwnerId: data,
  };
}
