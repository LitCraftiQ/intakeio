"use server";

import { revalidatePath } from "next/cache";

import { getUserDisplayName } from
  "@/lib/auth/display-name";
import { getOwnedContacts } from
  "@/lib/contacts/queries";
import { generateAiProposal } from
  "@/lib/proposals/ai";
import { sendProposalEmail } from
  "@/lib/proposals/email";
import {
  contentToRow,
  getOwnedProposalById,
} from "@/lib/proposals/queries";
import {
  createProposalSchema,
  proposalIdSchema,
  saveProposalSchema,
  sendProposalEmailSchema,
} from "@/lib/proposals/schema";
import { emptyProposalContent } from
  "@/lib/proposals/types";
import { createClient } from
  "@/lib/supabase/server";

export type ProposalActionResult =
  | {
      ok: true;
      id: string;
      publicToken?: string;
      message?: string;
    }
  | {
      ok: false;
      message: string;
    };

async function getOwnedContact(contactId: string) {
  const contacts = await getOwnedContacts();

  return (
    contacts.find(
      (contact) => contact.id === contactId,
    ) ?? null
  );
}

export async function createProposalAction(
  input: unknown,
): Promise<ProposalActionResult> {
  const parsed =
    createProposalSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Choose a contact and a creation mode.",
    };
  }

  const contact = await getOwnedContact(
    parsed.data.contactId,
  );

  if (!contact) {
    return {
      ok: false,
      message: "That contact was not found.",
    };
  }

  const supabase = await createClient();
  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return {
      ok: false,
      message: "Your session has expired. Sign in again.",
    };
  }

  let content = emptyProposalContent;
  let message: string | undefined;

  if (parsed.data.mode === "ai") {
    const generated = await generateAiProposal(contact);
    content = generated.content;
    message = generated.message ?? undefined;
  }

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      owner_user_id: userResult.user.id,
      contact_id: contact.id,
      creation_mode: parsed.data.mode,
      ...contentToRow(content),
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      message:
        "The proposal could not be created. Run supabase/migrations/202609020003_proposals.sql in the Supabase SQL Editor, then try again.",
    };
  }

  revalidatePath("/dashboard/proposals");
  revalidatePath("/dashboard/contacts");

  return {
    ok: true,
    id: data.id as string,
    message,
  };
}

export async function saveProposalAction(
  input: unknown,
): Promise<ProposalActionResult> {
  const parsed = saveProposalSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Review the proposal fields.",
    };
  }

  const supabase = await createClient();
  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return {
      ok: false,
      message: "Your session has expired. Sign in again.",
    };
  }

  const { id, ...content } = parsed.data;

  const { data, error } = await supabase
    .from("proposals")
    .update(contentToRow(content))
    .eq("id", id)
    .eq("owner_user_id", userResult.user.id)
    .in("status", ["draft", "changes_requested"])
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      message:
        "This proposal can no longer be edited. Sent proposals stay locked until the client requests changes.",
    };
  }

  revalidatePath(`/dashboard/proposals/${id}`);
  revalidatePath("/dashboard/proposals");

  return {
    ok: true,
    id,
    message: "Proposal saved.",
  };
}

export async function sendProposalAction(
  proposalId: string,
): Promise<ProposalActionResult> {
  const parsed = proposalIdSchema.safeParse(proposalId);

  if (!parsed.success) {
    return {
      ok: false,
      message: "That proposal was not found.",
    };
  }

  const supabase = await createClient();
  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return {
      ok: false,
      message: "Your session has expired. Sign in again.",
    };
  }

  const { data: existing, error: loadError } =
    await supabase
      .from("proposals")
      .select("id, project_title, status")
      .eq("id", parsed.data)
      .eq("owner_user_id", userResult.user.id)
      .maybeSingle();

  if (loadError || !existing) {
    return {
      ok: false,
      message: "That proposal was not found.",
    };
  }

  if (
    existing.status !== "draft" &&
    existing.status !== "changes_requested"
  ) {
    return {
      ok: false,
      message:
        "This proposal has already been sent. Wait for the client to accept or request changes.",
    };
  }

  if (
    typeof existing.project_title !== "string" ||
    existing.project_title.trim().length < 2
  ) {
    return {
      ok: false,
      message: "Add a project title before sending.",
    };
  }

  const { data, error } = await supabase
    .from("proposals")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("id", parsed.data)
    .eq("owner_user_id", userResult.user.id)
    .in("status", ["draft", "changes_requested"])
    .select("id, public_token")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      message: "The proposal could not be sent.",
    };
  }

  revalidatePath(`/dashboard/proposals/${parsed.data}`);
  revalidatePath("/dashboard/proposals");

  return {
    ok: true,
    id: data.id as string,
    publicToken: data.public_token as string,
    message: "Proposal sent. Share the private link with your client.",
  };
}

export async function deleteProposalAction(
  proposalId: string,
): Promise<ProposalActionResult> {
  const parsed = proposalIdSchema.safeParse(proposalId);

  if (!parsed.success) {
    return {
      ok: false,
      message: "That proposal was not found.",
    };
  }

  const supabase = await createClient();
  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return {
      ok: false,
      message: "Your session has expired. Sign in again.",
    };
  }

  const { data, error } = await supabase
    .from("proposals")
    .delete()
    .eq("id", parsed.data)
    .eq("owner_user_id", userResult.user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      message: "The proposal could not be deleted.",
    };
  }

  revalidatePath("/dashboard/proposals");
  revalidatePath(`/dashboard/proposals/${parsed.data}`);
  revalidatePath("/dashboard/contacts");

  return {
    ok: true,
    id: parsed.data,
    message: "Proposal deleted.",
  };
}

export async function prepareProposalLinkAction(
  proposalId: string,
): Promise<ProposalActionResult> {
  const parsed = proposalIdSchema.safeParse(proposalId);

  if (!parsed.success) {
    return {
      ok: false,
      message: "That proposal was not found.",
    };
  }

  const proposal = await getOwnedProposalById(
    parsed.data,
  );

  if (!proposal) {
    return {
      ok: false,
      message: "That proposal was not found.",
    };
  }

  if (proposal.projectTitle.trim().length < 2) {
    return {
      ok: false,
      message: "Add a project title before sharing.",
    };
  }

  if (
    proposal.status !== "draft" &&
    proposal.status !== "changes_requested"
  ) {
    return {
      ok: true,
      id: proposal.id,
      publicToken: proposal.publicToken,
    };
  }

  return sendProposalAction(proposal.id);
}

export async function sendProposalEmailAction(
  input: unknown,
): Promise<ProposalActionResult> {
  const parsed = sendProposalEmailSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Enter a valid email address.",
    };
  }

  const prepared = await prepareProposalLinkAction(
    parsed.data.id,
  );

  if (!prepared.ok) {
    return prepared;
  }

  const proposal = await getOwnedProposalById(
    parsed.data.id,
  );

  if (!proposal) {
    return {
      ok: false,
      message: "That proposal was not found.",
    };
  }

  const supabase = await createClient();
  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return {
      ok: false,
      message: "Your session has expired. Sign in again.",
    };
  }

  const sent = await sendProposalEmail({
    proposal: {
      ...proposal,
      publicToken:
        prepared.publicToken ?? proposal.publicToken,
      status:
        proposal.status === "draft" ||
        proposal.status === "changes_requested"
          ? "sent"
          : proposal.status,
    },
    to: parsed.data.email,
    senderName: getUserDisplayName(userResult.user),
    senderEmail: userResult.user.email ?? null,
  });

  if (!sent.ok) {
    return sent;
  }

  revalidatePath("/dashboard/proposals");
  revalidatePath(`/dashboard/proposals/${parsed.data.id}`);

  return {
    ok: true,
    id: parsed.data.id,
    publicToken:
      prepared.publicToken ?? proposal.publicToken,
    message: `Proposal sent to ${parsed.data.email}.`,
  };
}
