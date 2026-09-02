"use client";

import {
  Check,
  Copy,
  LoaderCircle,
  Save,
  Send,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  saveProposalAction,
  sendProposalAction,
} from "@/app/(admin)/dashboard/proposal-actions";
import { proposalPublicPath } from
  "@/lib/proposals/sections";
import type {
  ProposalContent,
  ProposalRecord,
} from "@/lib/proposals/types";

type ProposalEditorProps = Readonly<{
  proposal: ProposalRecord;
}>;

const fields: Array<{
  key: keyof ProposalContent;
  label: string;
  helper: string;
  rows: number;
}> = [
  {
    key: "projectTitle",
    label: "Project title",
    helper: "Shown at the top of the client proposal.",
    rows: 2,
  },
  {
    key: "executiveSummary",
    label: "Executive summary",
    helper: "A short overview of the recommended work.",
    rows: 5,
  },
  {
    key: "scopeOfWork",
    label: "Scope of work",
    helper: "What is included in this engagement.",
    rows: 6,
  },
  {
    key: "deliverables",
    label: "Deliverables",
    helper: "One item per line.",
    rows: 5,
  },
  {
    key: "timeline",
    label: "Timeline",
    helper: "Overall duration or target dates.",
    rows: 4,
  },
  {
    key: "milestones",
    label: "Milestones",
    helper: "One milestone per line.",
    rows: 5,
  },
  {
    key: "pricing",
    label: "Pricing",
    helper: "Investment, packages, or rate.",
    rows: 4,
  },
  {
    key: "paymentSchedule",
    label: "Payment schedule",
    helper: "When invoices are due.",
    rows: 4,
  },
  {
    key: "terms",
    label: "Terms & conditions",
    helper: "Validity, revisions, and legal notes.",
    rows: 6,
  },
  {
    key: "acceptanceSection",
    label: "Signature / acceptance",
    helper: "What accepting this proposal confirms.",
    rows: 4,
  },
];

const statusCopy: Record<ProposalRecord["status"], string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  changes_requested: "Changes requested",
};

export function ProposalEditor({
  proposal,
}: ProposalEditorProps) {
  const router = useRouter();
  const locked =
    proposal.status === "sent" ||
    proposal.status === "viewed" ||
    proposal.status === "accepted";

  const [values, setValues] = useState<ProposalContent>({
    projectTitle: proposal.projectTitle,
    executiveSummary: proposal.executiveSummary,
    scopeOfWork: proposal.scopeOfWork,
    deliverables: proposal.deliverables,
    timeline: proposal.timeline,
    milestones: proposal.milestones,
    pricing: proposal.pricing,
    paymentSchedule: proposal.paymentSchedule,
    terms: proposal.terms,
    acceptanceSection: proposal.acceptanceSection,
  });
  const [message, setMessage] = useState<string | null>(
    proposal.creationMode === "ai"
      ? "This draft was generated from the intake form. Edit anything before sending."
      : null,
  );
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const sharePath = proposalPublicPath(
    proposal.publicToken,
  );

  function save(thenSend = false) {
    startTransition(async () => {
      const saved = await saveProposalAction({
        id: proposal.id,
        ...values,
      });

      if (!saved.ok) {
        setMessage(saved.message);
        return;
      }

      if (!thenSend) {
        setMessage(saved.message ?? "Proposal saved.");
        router.refresh();
        return;
      }

      const sent = await sendProposalAction(proposal.id);

      if (!sent.ok) {
        setMessage(sent.message);
        return;
      }

      setMessage(sent.message ?? "Proposal sent.");
      router.refresh();
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${sharePath}`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--dash-accent)]">
            {proposal.creationMode === "ai"
              ? "AI draft"
              : "Manual proposal"}
          </p>

          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            For {proposal.contactName}
            {proposal.contactCompany
              ? ` · ${proposal.contactCompany}`
              : ""}
          </p>
        </div>

        <span className="rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-3 py-1 text-xs font-bold">
          {statusCopy[proposal.status]}
        </span>
      </div>

      {proposal.status !== "draft" ? (
        <p className="text-sm text-[var(--dash-muted)]">
          Client link:{" "}
          <span className="font-semibold text-[var(--dash-text)]">
            {sharePath}
          </span>
        </p>
      ) : null}

      {proposal.status === "changes_requested" &&
      proposal.clientMessage ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm">
          <p className="font-bold">Client requested changes</p>
          <p className="mt-2 leading-6 text-[var(--dash-muted)]">
            {proposal.clientMessage}
          </p>
        </div>
      ) : null}

      {locked ? (
        <p className="text-sm text-[var(--dash-muted)]">
          {proposal.status === "accepted"
            ? "The client accepted this proposal."
            : "This proposal has been sent. It stays locked until the client accepts or requests changes."}
        </p>
      ) : null}

      <div className="grid gap-4">
        {fields.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-1 block text-sm font-semibold">
              {field.label}
            </span>
            <span className="mb-2 block text-xs text-[var(--dash-muted)]">
              {field.helper}
            </span>
            {field.key === "projectTitle" ? (
              <input
                value={values.projectTitle}
                disabled={locked || pending}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    projectTitle: event.target.value,
                  }));
                }}
                className="dashboard-input"
              />
            ) : (
              <textarea
                value={values[field.key]}
                disabled={locked || pending}
                rows={field.rows}
                onChange={(event) => {
                  const key = field.key;
                  const nextValue = event.target.value;
                  setValues((current) => ({
                    ...current,
                    [key]: nextValue,
                  }));
                }}
                className="dashboard-input min-h-24 resize-y py-3"
              />
            )}
          </label>
        ))}
      </div>

      {message ? (
        <p className="text-sm text-[var(--dash-muted)]">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {locked ? null : (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => save(false)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--dash-border)] px-4 text-sm font-bold"
            >
              {pending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save draft
            </button>

            <button
              type="button"
              disabled={pending}
              onClick={() => save(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--dash-accent)] px-4 text-sm font-bold text-white"
            >
              <Send className="h-4 w-4" />
              Save and send
            </button>
          </>
        )}

        <button
          type="button"
          disabled={pending}
          onClick={() => {
            router.push("/dashboard/proposals");
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--dash-border)] px-4 text-sm font-bold"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>

        {proposal.status !== "draft" ? (
          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--dash-border)] px-4 text-sm font-bold"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy client link"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
