import type { ProposalContent } from "./types";

export const proposalBodySections = [
  {
    key: "executiveSummary",
    label: "Executive summary",
  },
  {
    key: "scopeOfWork",
    label: "Scope of work",
  },
  {
    key: "deliverables",
    label: "Deliverables",
  },
  {
    key: "timeline",
    label: "Timeline",
  },
  {
    key: "milestones",
    label: "Milestones",
  },
  {
    key: "pricing",
    label: "Pricing",
  },
  {
    key: "paymentSchedule",
    label: "Payment schedule",
  },
  {
    key: "terms",
    label: "Terms & conditions",
  },
  {
    key: "acceptanceSection",
    label: "Acceptance",
  },
] as const satisfies ReadonlyArray<{
  key: keyof ProposalContent;
  label: string;
}>;

export function proposalPublicPath(token: string) {
  return `/p/${token}`;
}
