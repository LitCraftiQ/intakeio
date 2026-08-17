import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";
import { z } from "zod";

import {
  ADMIN_ROLES,
  ADMIN_ROLE_LABELS,
  canAccessAdminSection,
  isAdminSection,
  type AdminRole,
} from "@/lib/auth/admin-policy";
import { createClient } from "@/lib/supabase/server";

const claimsSchema = z
  .object({
    sub: z.string().uuid(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email()
      .max(320),
  })
  .passthrough();

const membershipSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .max(320),

  role: z.enum(ADMIN_ROLES),

  status: z.enum([
    "active",
    "suspended",
  ]),

  display_name: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .nullable(),
});

export type AdminContext = Readonly<{
  membershipId: string;
  userId: string;
  role: AdminRole;
  roleLabel: string;
  status: "active";
  displayName: string;
  email: string;
  initials: string;
}>;

function createInitials(value: string) {
  const initials = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase(),
    )
    .join("");

  return initials || "AD";
}

export const requireAdmin = cache(
  async (): Promise<AdminContext> => {
    const supabase = await createClient();

    const {
      data: claimsResult,
      error: claimsError,
    } = await supabase.auth.getClaims();

    const parsedClaims =
      claimsSchema.safeParse(
        claimsResult?.claims,
      );

    /*
     * No session means 404.
     * The console never redirects to login.
     */
    if (
      claimsError ||
      !parsedClaims.success
    ) {
      notFound();
    }

    const {
      data: membershipResult,
      error: membershipError,
    } = await supabase
      .from("admin_memberships")
      .select(
        [
          "id",
          "user_id",
          "email",
          "role",
          "status",
          "display_name",
        ].join(","),
      )
      .eq(
        "user_id",
        parsedClaims.data.sub,
      )
      .maybeSingle();

    if (membershipError) {
      console.error(
        "Administrative membership lookup failed.",
      );

      notFound();
    }

    const parsedMembership =
      membershipSchema.safeParse(
        membershipResult,
      );

    if (
      !parsedMembership.success ||
      parsedMembership.data.status !==
        "active" ||
      parsedMembership.data.email !==
        parsedClaims.data.email
    ) {
      notFound();
    }

    const displayName =
      parsedMembership.data.display_name ??
      parsedClaims.data.email.split(
        "@",
      )[0] ??
      "Administrator";

    return {
      membershipId:
        parsedMembership.data.id,

      userId:
        parsedMembership.data.user_id,

      role:
        parsedMembership.data.role,

      roleLabel:
        ADMIN_ROLE_LABELS[
          parsedMembership.data.role
        ],

      status: "active",

      displayName,

      email:
        parsedMembership.data.email,

      initials:
        createInitials(displayName),
    };
  },
);

export async function requireAdminSection(
  section: string,
) {
  if (!isAdminSection(section)) {
    notFound();
  }

  const admin = await requireAdmin();

  if (
    !canAccessAdminSection(
      admin.role,
      section,
    )
  ) {
    notFound();
  }

  return admin;
}