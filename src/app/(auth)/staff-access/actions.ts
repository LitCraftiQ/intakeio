"use server";

import { randomUUID } from "crypto";
import { z } from "zod";

import { getServerEnvironment } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";
import { createPrivilegedClient } from "@/lib/supabase/privileged";

const staffAccessSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .max(320),
});

export type StaffAccessState = Readonly<{
  status:
    | "idle"
    | "validation_error"
    | "sent"
    | "error";

  message: string;
}>;

const GENERIC_SENT_MESSAGE =
  "If this email has active staff access, a secure sign-in link has been sent.";

export async function requestStaffAccess(
  _previousState: StaffAccessState,
  formData: FormData,
): Promise<StaffAccessState> {
  const parsed =
    staffAccessSchema.safeParse({
      email: formData.get("email"),
    });

  if (!parsed.success) {
    return {
      status: "validation_error",
      message:
        "Enter a valid email address.",
    };
  }

  const email = parsed.data.email;
  const requestId = randomUUID();

  const privilegedSupabase =
    createPrivilegedClient();

  const {
    data: membership,
    error: membershipError,
  } = await privilegedSupabase
    .from("admin_memberships")
    .select("id")
    .eq("email", email)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) {
    console.error(
      "Staff access membership lookup failed.",
      {
        requestId,
      },
    );

    return {
      status: "error",
      message:
        "Staff access is temporarily unavailable.",
    };
  }

  /*
   * Always return the same response when the
   * email is not authorized. This prevents
   * administrator-account enumeration.
   */
  if (!membership) {
    return {
      status: "sent",
      message: GENERIC_SENT_MESSAGE,
    };
  }

  const { APP_URL } =
    getServerEnvironment();

  const callbackUrl = new URL(
    "/auth/staff-callback",
    APP_URL,
  );

  const supabase = await createClient();

  const { error: signInError } =
    await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo:
          callbackUrl.toString(),
      },
    });

  if (signInError) {
    console.error(
      "Staff sign-in link could not be sent.",
      {
        requestId,
      },
    );

    return {
      status: "error",
      message:
        "Staff access is temporarily unavailable.",
    };
  }

  return {
    status: "sent",
    message: GENERIC_SENT_MESSAGE,
  };
}