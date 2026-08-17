import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import {
  cookies,
} from "next/headers";

import {
  getServerEnvironment,
} from "@/lib/env/server";

const ACCESS_COOKIE =
  "share_page_ok";

const ACCESS_MAX_AGE_SECONDS =
  60 * 60 * 12;

export function getRecaptchaSiteKey() {
  return (
    process.env
      .NEXT_PUBLIC_RECAPTCHA_SITE_KEY ??
    ""
  ).trim();
}

function getRecaptchaSecretKey() {
  return (
    process.env.RECAPTCHA_SECRET_KEY ??
    ""
  ).trim();
}

function getSigningSecret() {
  return (
    getRecaptchaSecretKey() ||
    getServerEnvironment()
      .SUPABASE_SECRET_KEY
  );
}

function sign(value: string) {
  return createHmac(
    "sha256",
    getSigningSecret(),
  )
    .update(value)
    .digest("hex");
}

function signaturesMatch(
  left: string,
  right: string,
) {
  const leftBuffer =
    Buffer.from(left);
  const rightBuffer =
    Buffer.from(right);

  if (
    leftBuffer.length !==
    rightBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    leftBuffer,
    rightBuffer,
  );
}

function createAccessToken(
  publicUserId: string,
  slug: string,
) {
  const expiresAt =
    Date.now() +
    ACCESS_MAX_AGE_SECONDS * 1000;

  const payload = `${publicUserId}:${slug}:${expiresAt}`;

  return `${expiresAt}.${sign(payload)}`;
}

function isValidAccessToken(
  token: string,
  publicUserId: string,
  slug: string,
) {
  const [expiresAtRaw, signature] =
    token.split(".");

  const expiresAt = Number(expiresAtRaw);

  if (
    !expiresAtRaw ||
    !signature ||
    !Number.isFinite(expiresAt) ||
    expiresAt < Date.now()
  ) {
    return false;
  }

  return signaturesMatch(
    signature,
    sign(
      `${publicUserId}:${slug}:${expiresAt}`,
    ),
  );
}

export async function hasSharePageAccess(
  publicUserId: string,
  slug: string,
) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(ACCESS_COOKIE)
      ?.value;

  if (!token) {
    return false;
  }

  return isValidAccessToken(
    token,
    publicUserId,
    slug,
  );
}

export async function grantSharePageAccess(
  publicUserId: string,
  slug: string,
) {
  const cookieStore = await cookies();

  cookieStore.set(
    ACCESS_COOKIE,
    createAccessToken(
      publicUserId,
      slug,
    ),
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      path: `/${publicUserId}/${slug}`,
      maxAge: ACCESS_MAX_AGE_SECONDS,
    },
  );
}

export async function verifyRecaptchaToken(
  token: string,
) {
  const secret = getRecaptchaSecretKey();

  if (!secret || !token.trim()) {
    return false;
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as {
    success?: boolean;
  };

  return result.success === true;
}
