"use server";

import { revalidatePath } from "next/cache";

import { createPrivilegedClient } from
  "@/lib/supabase/privileged";
import { proposalDecisionSchema } from
  "@/lib/proposals/schema";

export type RespondToProposalResult =
  | { ok: true }
  | { ok: false; message: string };

export async function respondToProposalAction(
  input: unknown,
): Promise<RespondToProposalResult> {
  const parsed =
    proposalDecisionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "That response could not be sent.",
    };
  }

  if (
    parsed.data.decision === "changes_requested" &&
    parsed.data.message.trim().length < 8
  ) {
    return {
      ok: false,
      message:
        "Tell us what you would like changed.",
    };
  }

  const supabase = createPrivilegedClient();

  const { data, error } = await supabase.rpc(
    "respond_to_proposal",
    {
      p_token: parsed.data.token,
      p_decision: parsed.data.decision,
      p_message: parsed.data.message,
    },
  );

  if (error || data !== true) {
    return {
      ok: false,
      message:
        "This proposal is no longer waiting for a response.",
    };
  }

  revalidatePath(`/p/${parsed.data.token}`);
  revalidatePath("/dashboard/proposals");

  return { ok: true };
}
