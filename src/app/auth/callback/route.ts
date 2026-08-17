import { NextResponse } from "next/server";

import {
  getPublicAuthDestination,
  persistUserDisplayName,
  type PublicAuthDestination,
} from "@/lib/auth/public-post-auth";
import { getServerEnvironment } from
  "@/lib/env/server";
import { createClient } from
  "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code =
    requestUrl.searchParams.get("code");

  const { APP_URL } =
    getServerEnvironment();

  const registrationErrorUrl = new URL(
    "/register",
    APP_URL,
  );

  registrationErrorUrl.searchParams.set(
    "error",
    "authentication_failed",
  );

  if (!code) {
    return NextResponse.redirect(
      registrationErrorUrl,
      {
        status: 303,
      },
    );
  }

  const supabase = await createClient();

  const { error: exchangeError } =
    await supabase.auth
      .exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      registrationErrorUrl,
      {
        status: 303,
      },
    );
  }

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  const user = userResult.user;

  if (userError || !user) {
    await supabase.auth.signOut({
      scope: "local",
    });

    return NextResponse.redirect(
      registrationErrorUrl,
      {
        status: 303,
      },
    );
  }

  await persistUserDisplayName(
    supabase,
    user,
  );

  let destination:
    PublicAuthDestination = "/dashboard";

  try {
    destination =
      await getPublicAuthDestination(
        supabase,
        user,
      );
  } catch {
    console.error(
      "Unable to complete public onboarding.",
    );
  }

  return NextResponse.redirect(
    new URL(destination, APP_URL),
    {
      status: 303,
    },
  );
}