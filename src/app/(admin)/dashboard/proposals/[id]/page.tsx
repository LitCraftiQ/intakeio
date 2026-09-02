import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProposalEditor } from
  "@/components/dashboard/proposal-editor";
import { getOwnedProposalById } from
  "@/lib/proposals/queries";
import { proposalIdSchema } from
  "@/lib/proposals/schema";

export const dynamic = "force-dynamic";

type ProposalEditorPageProps = Readonly<{
  params: Promise<{
    id: string;
  }>;
}>;

export async function generateMetadata({
  params,
}: ProposalEditorPageProps): Promise<Metadata> {
  const { id } = await params;
  const parsed = proposalIdSchema.safeParse(id);

  if (!parsed.success) {
    return {
      title: "Proposal",
    };
  }

  const proposal = await getOwnedProposalById(
    parsed.data,
  );

  return {
    title: proposal?.projectTitle || "Proposal",
  };
}

export default async function ProposalEditorPage({
  params,
}: ProposalEditorPageProps) {
  const { id } = await params;
  const parsed = proposalIdSchema.safeParse(id);

  if (!parsed.success) {
    notFound();
  }

  const proposal = await getOwnedProposalById(
    parsed.data,
  );

  if (!proposal) {
    notFound();
  }

  return (
    <div className="dashboard-page-enter mx-auto w-full max-w-[860px]">
      <Link
        href="/dashboard/proposals"
        className="text-xs font-bold text-[var(--dash-accent)]"
      >
        All proposals
      </Link>

      <div className="mt-5">
        <ProposalEditor
          key={`${proposal.id}-${proposal.status}-${proposal.updatedAt}`}
          proposal={proposal}
        />
      </div>
    </div>
  );
}
