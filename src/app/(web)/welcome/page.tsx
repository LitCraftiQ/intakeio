import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { WelcomeRedirect } from "./welcome-redirect";

import "./welcome.css";

export const metadata: Metadata = {
  title: "Welcome to Intakeio",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const supabase = await createClient();

  const {
    data: claimsResult,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId =
    typeof claimsResult?.claims?.sub ===
    "string"
      ? claimsResult.claims.sub
      : null;

  if (claimsError || !userId) {
    redirect("/register");
  }

  const {
    data: onboarding,
    error: onboardingError,
  } = await supabase
    .from("user_onboarding")
    .select("welcome_pending")
    .eq("user_id", userId)
    .maybeSingle();

  if (
    onboardingError ||
    !onboarding ||
    onboarding.welcome_pending !== true
  ) {
    redirect("/dashboard");
  }

  return <WelcomeRedirect />;
}