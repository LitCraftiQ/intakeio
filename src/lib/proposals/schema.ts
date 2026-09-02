import { z } from "zod";

import { proposalCreationModes } from
  "./types";

const section = (maximum: number) =>
  z
    .string()
    .trim()
    .max(
      maximum,
      "That section is too long.",
    );

export const proposalContentSchema = z.object({
  projectTitle: z
    .string()
    .trim()
    .min(2, "Enter a project title.")
    .max(160, "Enter a shorter title."),
  executiveSummary: section(8000),
  scopeOfWork: section(8000),
  deliverables: section(8000),
  timeline: section(4000),
  milestones: section(8000),
  pricing: section(4000),
  paymentSchedule: section(4000),
  terms: section(8000),
  acceptanceSection: section(4000),
});

export const saveProposalSchema =
  proposalContentSchema.extend({
    id: z.string().uuid(),
  });

export const createProposalSchema = z.object({
  contactId: z.string().uuid(),
  mode: z.enum(proposalCreationModes),
});

export const proposalIdSchema = z.string().uuid();

export const proposalTokenSchema = z
  .string()
  .trim()
  .regex(
    /^[a-f0-9]{6}$|^[a-f0-9]{24}$/,
    "Invalid proposal link.",
  );

export const sendProposalEmailSchema = z.object({
  id: z.string().uuid(),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(255),
});

export const proposalDecisionSchema = z.object({
  token: proposalTokenSchema,
  decision: z.enum([
    "accepted",
    "changes_requested",
  ]),
  message: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .default(""),
});
