"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getOtpCookieOptions,
  OTP_EMAIL_COOKIE,
  OTP_FULL_NAME_COOKIE,
  OTP_REQUESTED_AT_COOKIE,
} from "@/lib/auth/otp-cookies";
import type {
  RequestEmailOtpState,
} from "@/lib/auth/otp-action-types";
import { createClient } from
  "@/lib/supabase/server";
import {
  publicEmailSchema,
  publicFullNameSchema,
} from "@/lib/validation/public-auth";

export async function requestEmailOtp(
  _previousState: RequestEmailOtpState,
  formData: FormData,
): Promise<RequestEmailOtpState> {
  const fullNameResult =
    publicFullNameSchema.safeParse(
      formData.get("full_name"),
    );

  if (!fullNameResult.success) {
    return {
      status: "error",
      message:
        fullNameResult.error.issues[0]
          ?.message ??
        "Enter your first and last name.",
    };
  }

  const emailResult =
    publicEmailSchema.safeParse(
      formData.get("email"),
    );

  if (!emailResult.success) {
    return {
      status: "error",
      message:
        emailResult.error.issues[0]
          ?.message ??
        "Enter a valid email address.",
    };
  }

  const fullName = fullNameResult.data;
  const email = emailResult.data;
  const supabase = await createClient();

  const { error } =
    await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          full_name: fullName,
          name: fullName,
        },
      },
    });

  if (error) {
    console.error(
      "Public email OTP request failed.",
      {
        code: error.code,
      },
    );

    return {
      status: "error",
      message:
        "We could not send the code right now. Please wait and try again.",
    };
  }

  const cookieStore = await cookies();
  const cookieOptions =
    getOtpCookieOptions();

  cookieStore.set(
    OTP_EMAIL_COOKIE,
    email,
    cookieOptions,
  );

  cookieStore.set(
    OTP_FULL_NAME_COOKIE,
    fullName,
    cookieOptions,
  );

  cookieStore.set(
    OTP_REQUESTED_AT_COOKIE,
    Date.now().toString(),
    cookieOptions,
  );

  redirect("/verify-email");
}