import type { Metadata } from "next";

import { ProposalsWorkspace } from
  "@/components/dashboard/proposals-workspace";
import { getOwnedProposals } from
  "@/lib/proposals/queries";

export const metadata: Metadata = {
  title: "Proposals",
};

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const proposals = await getOwnedProposals();

  return (
    <ProposalsWorkspace proposals={proposals} />
  );
}
