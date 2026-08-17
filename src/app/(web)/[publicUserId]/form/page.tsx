import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { IntakeFormPage } from
  "@/components/forms/contact/intake-form-page";
import { getServerEnvironment } from
  "@/lib/env/server";
import { resolveFormLeaveHref } from
  "@/lib/intake-forms/leave-href";
import {
  getFormLinkOwner,
  getPublishedSharePath,
} from "@/lib/intake-forms/queries";
import {
  publicShareUserIdSchema,
} from "@/lib/share-pages/validation";

export const dynamic = "force-dynamic";

export const revalidate = 0;

type PublicIntakeFormPageProps =
  Readonly<{
    params: Promise<{
      publicUserId: string;
    }>;
    searchParams: Promise<{
      from?: string | string[];
    }>;
  }>;

function getSingleParameter(
  value: string | string[] | undefined,
) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return "";
}

export async function generateMetadata({
  params,
}: PublicIntakeFormPageProps): Promise<Metadata> {
  const { publicUserId } = await params;

  const parsedUserId =
    publicShareUserIdSchema.safeParse(
      publicUserId,
    );

  if (!parsedUserId.success) {
    return {
      title: "Form unavailable | Intakeio",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const owner = await getFormLinkOwner(
    parsedUserId.data,
  );

  if (!owner) {
    return {
      title: "Form unavailable | Intakeio",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title:
      "Project intake | Intakeio",
    description:
      "Share your company and project details so the team can review your request and follow up.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PublicIntakeFormRoute({
  params,
  searchParams,
}: PublicIntakeFormPageProps) {
  const { publicUserId } = await params;
  const parameters = await searchParams;

  const parsedUserId =
    publicShareUserIdSchema.safeParse(
      publicUserId,
    );

  if (!parsedUserId.success) {
    notFound();
  }

  const owner = await getFormLinkOwner(
    parsedUserId.data,
  );

  if (!owner) {
    notFound();
  }

  const requestHeaders = await headers();
  const { APP_URL } =
    getServerEnvironment();

  const publishedSharePath =
    await getPublishedSharePath(
      owner.publicOwnerId,
    );

  const leaveHref = resolveFormLeaveHref({
    publicOwnerId: owner.publicOwnerId,
    fromQuery: getSingleParameter(
      parameters.from,
    ) || null,
    referer:
      requestHeaders.get("referer"),
    publishedSharePath,
    appUrl: APP_URL,
  });

  return (
    <IntakeFormPage
      publicOwnerId={owner.publicOwnerId}
      leaveHref={leaveHref}
    />
  );
}
