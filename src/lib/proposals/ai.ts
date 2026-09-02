import "server-only";

import type { ContactSubmission } from
  "@/lib/dashboard/types";

import { proposalContentSchema } from
  "./schema";
import {
  emptyProposalContent,
  type ProposalContent,
} from "./types";

function getOpenAiApiKey() {
  const value = process.env.OPENAI_API_KEY?.trim();

  return value && value.length > 20
    ? value
    : null;
}

export function draftFromContact(
  contact: ContactSubmission,
): ProposalContent {
  const title =
    contact.projectTitle.trim() ||
    `Proposal for ${contact.fullName}`;

  const description =
    contact.projectDescription.trim() ||
    "the submitted project request";

  const budget =
    contact.budget.trim() ||
    "To be confirmed";

  const timeline =
    contact.preferredMeetingTime.trim() ||
    "To be scheduled after kickoff";

  return {
    projectTitle: title,
    executiveSummary:
      `${contact.fullName} requested support for ${title}. This proposal outlines a focused delivery plan based on the intake submission, including recommended scope, timeline, and investment.`,
    scopeOfWork:
      `We will design and deliver ${title}. The work is based on this brief:\n\n${description}`,
    deliverables:
      "Discovery and requirements confirmation\nCore product build\nReview, revisions, and launch support",
    timeline,
    milestones:
      "Kickoff and planning\nBuild and internal review\nClient review and revisions\nLaunch and handoff",
    pricing: budget,
    paymentSchedule:
      `50% to begin, 50% on delivery. Investment: ${budget}.`,
    terms:
      "This proposal is valid for 14 days. Work begins after written acceptance and the initial payment. One revision round is included unless otherwise stated.",
    acceptanceSection:
      `By accepting this proposal, ${contact.fullName} authorizes Intakeio to proceed with the scope and payment schedule above.`,
  };
}

export async function generateAiProposal(
  contact: ContactSubmission,
): Promise<{
  content: ProposalContent;
  usedAi: boolean;
  message: string | null;
}> {
  const fallback = draftFromContact(contact);
  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    return {
      content: fallback,
      usedAi: false,
      message:
        "AI is not configured yet, so this draft was prefilled from the submission. Add OPENAI_API_KEY to generate a fuller proposal.",
    };
  }

  const prompt = {
    fullName: contact.fullName,
    company: contact.companyName,
    email: contact.email,
    projectTitle: contact.projectTitle,
    projectDescription: contact.projectDescription,
    budget: contact.budget,
    preferredMeetingTime: contact.preferredMeetingTime,
    additionalInformation:
      contact.additionalInformation,
  };

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.4,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You write concise client proposals as JSON with keys: projectTitle, executiveSummary, scopeOfWork, deliverables, timeline, milestones, pricing, paymentSchedule, terms, acceptanceSection. Use line breaks for lists. Do not invent a company name for the sender. Keep a professional tone.",
            },
            {
              role: "user",
              content: JSON.stringify(prompt),
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      return {
        content: fallback,
        usedAi: false,
        message:
          "The AI draft could not be generated, so the submission was used to prefill the proposal.",
      };
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: { content?: string };
      }>;
    };

    const raw = payload.choices?.[0]?.message?.content;

    if (!raw) {
      return {
        content: fallback,
        usedAi: false,
        message:
          "The AI draft was empty, so the submission was used to prefill the proposal.",
      };
    }

    const parsedJson = JSON.parse(raw) as Record<
      string,
      unknown
    >;

    const parsed = proposalContentSchema.safeParse({
      ...emptyProposalContent,
      ...parsedJson,
    });

    if (!parsed.success) {
      return {
        content: fallback,
        usedAi: false,
        message:
          "The AI draft was incomplete, so the submission was used to prefill the proposal.",
      };
    }

    return {
      content: parsed.data,
      usedAi: true,
      message: null,
    };
  } catch {
    return {
      content: fallback,
      usedAi: false,
      message:
        "The AI draft could not be generated, so the submission was used to prefill the proposal.",
    };
  }
}
