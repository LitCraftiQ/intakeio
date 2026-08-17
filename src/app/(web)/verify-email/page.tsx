import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  OTP_EMAIL_COOKIE,
} from "@/lib/auth/otp-cookies";
import { createClient } from
  "@/lib/supabase/server";
import { publicEmailSchema } from
  "@/lib/validation/public-auth";

import { OtpVerificationForm } from
  "./otp-verification-form";

import "./verify-email.css";

export const metadata: Metadata = {
  title: "Verify your email",
  description:
    "Verify your Intakeio email address.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export const dynamic = "force-dynamic";

function maskEmail(email: string) {
  const [localPart, domain] =
    email.split("@");

  if (!localPart || !domain) {
    return "your email";
  }

  const visibleCharacters =
    localPart.length <= 2
      ? 1
      : 2;

  const visible = localPart.slice(
    0,
    visibleCharacters,
  );

  const hiddenLength = Math.max(
    localPart.length -
      visibleCharacters,
    3,
  );

  return `${visible}${"•".repeat(
    Math.min(hiddenLength, 8),
  )}@${domain}`;
}

export default async function VerifyEmailPage() {
  const supabase = await createClient();

  const {
    data: claimsResult,
  } = await supabase.auth.getClaims();

  const authenticatedUserId =
    typeof claimsResult?.claims?.sub ===
    "string"
      ? claimsResult.claims.sub
      : null;

  if (authenticatedUserId) {
    redirect("/dashboard");
  }

  const cookieStore = await cookies();

  const emailResult =
    publicEmailSchema.safeParse(
      cookieStore
        .get(OTP_EMAIL_COOKIE)
        ?.value,
    );

  if (!emailResult.success) {
    redirect("/register");
  }

  return (
    <OtpVerificationForm
      maskedEmail={maskEmail(
        emailResult.data,
      )}
    />
  );
}