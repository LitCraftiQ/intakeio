"use server";

import {
  revalidatePath,
} from "next/cache";

import { createClient } from
  "@/lib/supabase/server";
import {
  getOwnedSharePageById,
} from "@/lib/share-pages/queries";
import type {
  DeleteSharePageResult,
  SharePageActionResult,
} from "@/lib/share-pages/types";
import {
  sharePageIdSchema,
  sharePageInputSchema,
} from "@/lib/share-pages/validation";

export async function saveSharePageAction(
  input: unknown,
): Promise<SharePageActionResult> {
  const parsed =
    sharePageInputSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message:
        parsed.error.issues[0]
          ?.message ??
        "Review the Share Page fields.",
    };
  }

  const supabase =
    await createClient();

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !userResult.user
  ) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      message:
        "Your session has expired. Sign in again.",
    };
  }

  const value = parsed.data;

  const {
    data,
    error,
  } = await supabase.rpc(
    "save_share_page",
    {
      p_id: value.id,

      p_display_name:
        value.displayName,

      p_slug: value.slug,

      p_email:
        value.email,

      p_phone:
        value.phone,

      p_internal_name:
        value.internalName,

      p_introduction:
        value.introduction,

      p_status:
        value.status,

      p_theme:
        value.theme,

      p_links:
        value.links.map(
          (link) => ({
            platform:
              link.platform,

            url: link.url,
          }),
        ),
    },
  );

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        code: "SLUG_TAKEN",
        message:
          "That public URL is already being used.",
      };
    }

    if (
      error.code === "P0002"
    ) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message:
          "This Share Page is no longer available.",
      };
    }

    console.error(
      "Unable to save Share Page.",
      {
        code: error.code,
      },
    );

    return {
      ok: false,
      code: "SAVE_FAILED",
      message:
        "The Share Page could not be saved.",
    };
  }

  const id =
    typeof data === "string"
      ? data
      : null;

  if (!id) {
    return {
      ok: false,
      code: "SAVE_FAILED",
      message:
        "The Share Page could not be saved.",
    };
  }

  const page =
    await getOwnedSharePageById(id);

  if (!page) {
    return {
      ok: false,
      code: "SAVE_FAILED",
      message:
        "The saved Share Page could not be loaded.",
    };
  }

  const {
    data: publicUserId,
  } = await supabase.rpc(
    "get_or_create_share_public_id",
  );

  if (typeof publicUserId === "string") {
    await supabase
      .from("share_pages")
      .update({
        public_owner_id: publicUserId,
      })
      .eq("id", id)
      .is("public_owner_id", null);

    revalidatePath(
      `/${publicUserId}/${page.slug}`,
    );
  }

  revalidatePath("/dashboard");

  return {
    ok: true,
    page,
  };
}

export async function deleteSharePageAction(
  input: unknown,
): Promise<DeleteSharePageResult> {
  const parsed =
    sharePageIdSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message:
        "The Share Page identifier is invalid.",
    };
  }

  const supabase =
    await createClient();

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !userResult.user
  ) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      message:
        "Your session has expired. Sign in again.",
    };
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "soft_delete_share_page",
    {
      p_id: parsed.data,
    },
  );

  if (error) {
    if (
      error.code === "P0002"
    ) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message:
          "This Share Page has already been removed.",
      };
    }

    console.error(
      "Unable to delete Share Page.",
      {
        code: error.code,
      },
    );

    return {
      ok: false,
      code: "DELETE_FAILED",
      message:
        "The Share Page could not be deleted.",
    };
  }

  const slug =
    typeof data === "string"
      ? data
      : null;

  const {
    data: publicUserId,
  } = await supabase.rpc(
    "get_or_create_share_public_id",
  );

  revalidatePath("/dashboard");

  if (
    slug &&
    typeof publicUserId === "string"
  ) {
    revalidatePath(
      `/${publicUserId}/${slug}`,
    );
  }

  return {
    ok: true,
    id: parsed.data,
  };
}