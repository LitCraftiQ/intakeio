import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicProposalView } from
  "@/components/proposals/public-proposal-view";
import {
  getPublicProposal,
  markPublicProposalViewed,
} from "@/lib/proposals/queries";
import { proposalTokenSchema } from
  "@/lib/proposals/schema";

export const dynamic = "force-dynamic";

export const revalidate = 0;

type PublicProposalPageProps = Readonly<{
  params: Promise<{
    token: string;
  }>;
}>;

export async function generateMetadata({
  params,
}: PublicProposalPageProps): Promise<Metadata> {
  const { token } = await params;
  const parsed = proposalTokenSchema.safeParse(token);

  if (!parsed.success) {
    return {
      title: "Proposal unavailable | Intakeio",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const proposal = await getPublicProposal(
    parsed.data,
  );

  return {
    title: proposal
      ? `${proposal.projectTitle || "Proposal"} | Intakeio`
      : "Proposal unavailable | Intakeio",
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  };
}

export default async function PublicProposalPage({
  params,
}: PublicProposalPageProps) {
  const { token } = await params;
  const parsed = proposalTokenSchema.safeParse(token);

  if (!parsed.success) {
    notFound();
  }

  let proposal = await getPublicProposal(parsed.data);

  if (!proposal) {
    notFound();
  }

  if (proposal.status === "sent") {
    await markPublicProposalViewed(parsed.data);

    proposal = {
      ...proposal,
      status: "viewed",
      viewedAt:
        proposal.viewedAt ?? new Date().toISOString(),
    };
  }

  return <PublicProposalView proposal={proposal} />;
}
