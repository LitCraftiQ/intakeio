export const proposalStatuses = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "changes_requested",
] as const;

export type ProposalStatus =
  (typeof proposalStatuses)[number];

export const proposalCreationModes = [
  "manual",
  "ai",
] as const;

export type ProposalCreationMode =
  (typeof proposalCreationModes)[number];

export type ProposalContent = Readonly<{
  projectTitle: string;
  executiveSummary: string;
  scopeOfWork: string;
  deliverables: string;
  timeline: string;
  milestones: string;
  pricing: string;
  paymentSchedule: string;
  terms: string;
  acceptanceSection: string;
}>;

export type ProposalRecord = ProposalContent &
  Readonly<{
    id: string;
    contactId: string;
    contactName: string;
    contactEmail: string;
    contactCompany: string;
    publicToken: string;
    creationMode: ProposalCreationMode;
    status: ProposalStatus;
    clientMessage: string | null;
    sentAt: string | null;
    viewedAt: string | null;
    respondedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;

export const emptyProposalContent: ProposalContent = {
  projectTitle: "",
  executiveSummary: "",
  scopeOfWork: "",
  deliverables: "",
  timeline: "",
  milestones: "",
  pricing: "",
  paymentSchedule: "",
  terms: "",
  acceptanceSection: "",
};
