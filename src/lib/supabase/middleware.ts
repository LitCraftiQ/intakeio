import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

import { getSupabaseEnvironment } from "./env";
import { fetchSupabase } from "./fetch";

const AUTH_ROUTES = ["/register", "/login"] as const;

function isAuthenticationRoute(pathname: string) {
  return AUTH_ROUTES.includes(
    pathname as (typeof AUTH_ROUTES)[number],
  );
}

function isProtectedRoute(
  pathname: string,
) {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  );
}

function copyCookies(
  source: NextResponse,
  destination: NextResponse,
) {
  source.cookies.getAll().forEach((cookie) => {
    destination.cookies.set(cookie);
  });
}

export async function updateSession(
  request: NextRequest,
) {
  const { url, publishableKey } =
    getSupabaseEnvironment();

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    url,
    publishableKey,
    {
      global: {
        fetch: fetchSupabase,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(name, value);
            },
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options,
              );
            },
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const authenticatedUserId = data?.claims?.sub;
  const pathname = request.nextUrl.pathname;

  if (
    !authenticatedUserId &&
    isProtectedRoute(pathname)
  ) {
    const redirectUrl =
      request.nextUrl.clone();

    redirectUrl.pathname = "/register";
    redirectUrl.searchParams.set(
      "next",
      `${pathname}${request.nextUrl.search}`,
    );

    const redirectResponse =
      NextResponse.redirect(redirectUrl);

    copyCookies(response, redirectResponse);

    return redirectResponse;
  }

  if (
    authenticatedUserId &&
    isAuthenticationRoute(pathname)
  ) {
    const redirectUrl =
      request.nextUrl.clone();

    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";

    const redirectResponse =
      NextResponse.redirect(redirectUrl);

    copyCookies(response, redirectResponse);

    return redirectResponse;
  }

  return response;
}