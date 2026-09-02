import { createPrivilegedClient } from
  "@/lib/supabase/privileged";
import { createClient } from
  "@/lib/supabase/server";

import type {
  ProposalContent,
  ProposalCreationMode,
  ProposalRecord,
  ProposalStatus,
} from "./types";

type RawProposal = {
  id: string;
  contact_id: string;
  public_token: string;
  creation_mode: ProposalCreationMode;
  status: ProposalStatus;
  project_title: string;
  executive_summary: string;
  scope_of_work: string;
  deliverables: string;
  timeline: string;
  milestones: string;
  pricing: string;
  payment_schedule: string;
  terms: string;
  acceptance_section: string;
  client_message: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  contacts: {
    full_name: string;
    email: string;
    company_name: string | null;
  } | Array<{
    full_name: string;
    email: string;
    company_name: string | null;
  }> | null;
};

function contactFromRow(row: RawProposal) {
  const contact = Array.isArray(row.contacts)
    ? row.contacts[0]
    : row.contacts;

  return {
    contactName: contact?.full_name ?? "Client",
    contactEmail: contact?.email ?? "",
    contactCompany: contact?.company_name ?? "",
  };
}

function mapProposal(row: RawProposal): ProposalRecord {
  const contact = contactFromRow(row);

  return {
    id: row.id,
    contactId: row.contact_id,
    contactName: contact.contactName,
    contactEmail: contact.contactEmail,
    contactCompany: contact.contactCompany,
    publicToken: row.public_token,
    creationMode: row.creation_mode,
    status: row.status,
    projectTitle: row.project_title,
    executiveSummary: row.executive_summary,
    scopeOfWork: row.scope_of_work,
    deliverables: row.deliverables,
    timeline: row.timeline,
    milestones: row.milestones,
    pricing: row.pricing,
    paymentSchedule: row.payment_schedule,
    terms: row.terms,
    acceptanceSection: row.acceptance_section,
    clientMessage: row.client_message,
    sentAt: row.sent_at,
    viewedAt: row.viewed_at,
    respondedAt: row.responded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const proposalSelect =
  "id, contact_id, public_token, creation_mode, status, project_title, executive_summary, scope_of_work, deliverables, timeline, milestones, pricing, payment_schedule, terms, acceptance_section, client_message, sent_at, viewed_at, responded_at, created_at, updated_at, contacts(full_name, email, company_name)";

export function contentToRow(content: ProposalContent) {
  return {
    project_title: content.projectTitle,
    executive_summary: content.executiveSummary,
    scope_of_work: content.scopeOfWork,
    deliverables: content.deliverables,
    timeline: content.timeline,
    milestones: content.milestones,
    pricing: content.pricing,
    payment_schedule: content.paymentSchedule,
    terms: content.terms,
    acceptance_section: content.acceptanceSection,
  };
}

export async function getOwnedProposals(): Promise<
  ProposalRecord[]
> {
  const supabase = await createClient();
  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("proposals")
    .select(proposalSelect)
    .eq("owner_user_id", userResult.user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return [];
  }

  return ((data ?? []) as unknown as RawProposal[]).map(
    mapProposal,
  );
}

export async function getOwnedProposalById(
  id: string,
): Promise<ProposalRecord | null> {
  const supabase = await createClient();
  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("proposals")
    .select(proposalSelect)
    .eq("owner_user_id", userResult.user.id)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProposal(data as unknown as RawProposal);
}

export async function getPublicProposal(
  token: string,
): Promise<ProposalRecord | null> {
  const supabase = createPrivilegedClient();

  const { data, error } = await supabase
    .from("proposals")
    .select(proposalSelect)
    .eq("public_token", token)
    .neq("status", "draft")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProposal(data as unknown as RawProposal);
}

export async function markPublicProposalViewed(
  token: string,
) {
  const supabase = createPrivilegedClient();

  await supabase.rpc("mark_proposal_viewed", {
    p_token: token,
  });
}
