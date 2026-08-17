import type {
  Metadata,
} from "next";
import {
  notFound,
} from "next/navigation";
import {
  cache,
} from "react";

import {
  PublicSharePage,
} from "@/components/share-pages/public-share-page";
import {
  SharePageGate,
} from "@/components/share-pages/share-page-gate";
import {
  notifySharePageOpened,
} from "@/lib/dashboard/notifications";
import {
  getPublicSharePage,
  getPublicSharePageMeta,
} from "@/lib/share-pages/queries";
import {
  getRecaptchaSiteKey,
  hasSharePageAccess,
} from "@/lib/share-pages/recaptcha";
import {
  publicShareSlugSchema,
  publicShareUserIdSchema,
} from "@/lib/share-pages/validation";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type PublicSharePageProps =
  Readonly<{
    params: Promise<{
      publicUserId: string;
      slug: string;
    }>;
  }>;

const getCachedPublicPage =
  cache(
    getPublicSharePage,
  );

const getCachedPublicMeta =
  cache(
    getPublicSharePageMeta,
  );

async function parseParams(
  publicUserId: string,
  slug: string,
) {
  const parsedUserId =
    publicShareUserIdSchema.safeParse(
      publicUserId,
    );

  const parsedSlug =
    publicShareSlugSchema.safeParse(
      slug,
    );

  if (
    !parsedUserId.success ||
    !parsedSlug.success
  ) {
    return null;
  }

  return {
    publicUserId: parsedUserId.data,
    slug: parsedSlug.data,
  };
}

export async function generateMetadata({
  params,
}: PublicSharePageProps): Promise<Metadata> {
  const {
    publicUserId,
    slug,
  } = await params;

  const parsed = await parseParams(
    publicUserId,
    slug,
  );

  const unavailable = {
    title:
      "Page unavailable | Intakeio",
    robots: {
      index: false,
      follow: false,
    },
  };

  if (!parsed) {
    return unavailable;
  }

  const meta =
    await getCachedPublicMeta(
      parsed.publicUserId,
      parsed.slug,
    );

  if (!meta) {
    return unavailable;
  }

  const allowed =
    await hasSharePageAccess(
      parsed.publicUserId,
      parsed.slug,
    );

  if (!allowed) {
    return {
      title:
        `${meta.displayName} | Intakeio`,
      robots: {
        index: false,
        follow: false,
        noarchive: true,
      },
    };
  }

  const page =
    await getCachedPublicPage(
      parsed.publicUserId,
      parsed.slug,
    );

  if (!page) {
    return unavailable;
  }

  return {
    title:
      `${page.displayName} | Intakeio`,

    description:
      page.introduction ??
      `Contact links shared by ${page.displayName}.`,

    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  };
}

export default async function PublicShareRoute({
  params,
}: PublicSharePageProps) {
  const {
    publicUserId,
    slug,
  } = await params;

  const parsed = await parseParams(
    publicUserId,
    slug,
  );

  if (!parsed) {
    notFound();
  }

  const meta =
    await getCachedPublicMeta(
      parsed.publicUserId,
      parsed.slug,
    );

  if (!meta) {
    notFound();
  }

  const allowed =
    await hasSharePageAccess(
      parsed.publicUserId,
      parsed.slug,
    );

  if (!allowed) {
    return (
      <SharePageGate
        publicUserId={
          parsed.publicUserId
        }
        slug={parsed.slug}
        displayName={meta.displayName}
        theme={meta.theme}
        siteKey={getRecaptchaSiteKey()}
      />
    );
  }

  const page =
    await getCachedPublicPage(
      parsed.publicUserId,
      parsed.slug,
    );

  if (!page) {
    notFound();
  }

  await notifySharePageOpened(
    parsed.publicUserId,
    parsed.slug,
  );

  return (
    <PublicSharePage
      page={page}
    />
  );
}
