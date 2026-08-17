"use server";

import { cookies } from "next/headers";

import {
  getOtpCookieOptions,
  OTP_EMAIL_COOKIE,
  OTP_FULL_NAME_COOKIE,
  OTP_REQUESTED_AT_COOKIE,
  OTP_RESEND_SECONDS,
} from "@/lib/auth/otp-cookies";
import type {
  ResendEmailOtpState,
  VerifyEmailOtpState,
} from "@/lib/auth/otp-action-types";
import {
  getPublicAuthDestination,
  persistUserDisplayName,
} from "@/lib/auth/public-post-auth";
import { createClient } from
  "@/lib/supabase/server";
import {
  emailOtpSchema,
  publicEmailSchema,
  publicFullNameSchema,
} from "@/lib/validation/public-auth";

export async function verifyEmailOtp(
  _previousState: VerifyEmailOtpState,
  formData: FormData,
): Promise<VerifyEmailOtpState> {
  const tokenResult =
    emailOtpSchema.safeParse(
      formData.get("token"),
    );

  if (!tokenResult.success) {
    return {
      status: "error",
      message:
        tokenResult.error.issues[0]
          ?.message ??
        "Enter the complete six-digit code.",
      destination: null,
    };
  }

  const cookieStore = await cookies();

  const emailResult =
    publicEmailSchema.safeParse(
      cookieStore
        .get(OTP_EMAIL_COOKIE)
        ?.value,
    );

  if (!emailResult.success) {
    return {
      status: "error",
      message:
        "Your verification session expired. Return to registration and request a new code.",
      destination: null,
    };
  }

  const supabase = await createClient();

  const {
    data,
    error: verificationError,
  } = await supabase.auth.verifyOtp({
    email: emailResult.data,
    token: tokenResult.data,
    type: "email",
  });

  if (
    verificationError ||
    !data.user
  ) {
    return {
      status: "error",
      message:
        "That code is incorrect or expired. Check the code and try again.",
      destination: null,
    };
  }

  const fullNameResult =
    publicFullNameSchema.safeParse(
      cookieStore.get(
        OTP_FULL_NAME_COOKIE,
      )?.value,
    );

  await persistUserDisplayName(
    supabase,
    data.user,
    fullNameResult.success
      ? fullNameResult.data
      : undefined,
  );

  let destination:
    | "/welcome"
    | "/dashboard" = "/dashboard";

  try {
    destination =
      await getPublicAuthDestination(
        supabase,
        data.user,
      );
  } catch {
    console.error(
      "Unable to complete OTP onboarding.",
    );
  }

  const expiredCookieOptions = {
    ...getOtpCookieOptions(),
    maxAge: 0,
  };

  cookieStore.set(
    OTP_EMAIL_COOKIE,
    "",
    expiredCookieOptions,
  );

  cookieStore.set(
    OTP_FULL_NAME_COOKIE,
    "",
    expiredCookieOptions,
  );

  cookieStore.set(
    OTP_REQUESTED_AT_COOKIE,
    "",
    expiredCookieOptions,
  );

  return {
    status: "success",
    message: "Email verified successfully.",
    destination,
  };
}

export async function resendEmailOtp(
  _previousState: ResendEmailOtpState,
): Promise<ResendEmailOtpState> {
  const cookieStore = await cookies();

  const emailResult =
    publicEmailSchema.safeParse(
      cookieStore
        .get(OTP_EMAIL_COOKIE)
        ?.value,
    );

  if (!emailResult.success) {
    return {
      status: "error",
      message:
        "Your verification session expired.",
      cooldownSeconds: 0,
    };
  }

  const requestedAtValue =
    cookieStore.get(
      OTP_REQUESTED_AT_COOKIE,
    )?.value;

  const requestedAt =
    requestedAtValue
      ? Number(requestedAtValue)
      : 0;

  const elapsedSeconds = Math.floor(
    (Date.now() - requestedAt) / 1000,
  );

  const remainingSeconds = Math.max(
    OTP_RESEND_SECONDS -
      elapsedSeconds,
    0,
  );

  if (remainingSeconds > 0) {
    return {
      status: "error",
      message:
        "Please wait before requesting another code.",
      cooldownSeconds:
        remainingSeconds,
    };
  }

  const supabase = await createClient();
  const fullNameResult =
    publicFullNameSchema.safeParse(
      cookieStore.get(
        OTP_FULL_NAME_COOKIE,
      )?.value,
    );

  const { error } =
    await supabase.auth.signInWithOtp({
      email: emailResult.data,
      options: {
        shouldCreateUser: true,
        data: fullNameResult.success
          ? {
              full_name:
                fullNameResult.data,
              name: fullNameResult.data,
            }
          : undefined,
      },
    });

  if (error) {
    return {
      status: "error",
      message:
        "We could not resend the code right now.",
      cooldownSeconds: 0,
    };
  }

  cookieStore.set(
    OTP_REQUESTED_AT_COOKIE,
    Date.now().toString(),
    getOtpCookieOptions(),
  );

  return {
    status: "sent",
    message:
      "A new verification code was sent.",
    cooldownSeconds:
      OTP_RESEND_SECONDS,
  };
}