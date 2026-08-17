"use server";

import {
  getPublicSharePageMeta,
} from "@/lib/share-pages/queries";
import {
  grantSharePageAccess,
  verifyRecaptchaToken,
} from "@/lib/share-pages/recaptcha";
import {
  publicShareSlugSchema,
  publicShareUserIdSchema,
} from "@/lib/share-pages/validation";

export async function verifySharePageAccessAction(
  input: Readonly<{
    publicUserId: string;
    slug: string;
    token: string;
  }>,
): Promise<
  | { ok: true }
  | { ok: false; message: string }
> {
  const publicUserId =
    publicShareUserIdSchema.safeParse(
      input.publicUserId,
    );

  const slug =
    publicShareSlugSchema.safeParse(
      input.slug,
    );

  if (
    !publicUserId.success ||
    !slug.success
  ) {
    return {
      ok: false,
      message:
        "This page is no longer available.",
    };
  }

  const page =
    await getPublicSharePageMeta(
      publicUserId.data,
      slug.data,
    );

  if (!page) {
    return {
      ok: false,
      message:
        "This page is no longer available.",
    };
  }

  const passed =
    await verifyRecaptchaToken(
      input.token,
    );

  if (!passed) {
    return {
      ok: false,
      message:
        "Complete the reCAPTCHA check to open this page.",
    };
  }

  await grantSharePageAccess(
    publicUserId.data,
    slug.data,
  );

  return { ok: true };
}
