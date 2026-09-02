"use client";

import {
  FileText,
  LoaderCircle,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createProposalAction } from
  "@/app/(admin)/dashboard/proposal-actions";
import type { ContactSubmission } from
  "@/lib/dashboard/types";

type ProposalCreatePickerProps = Readonly<{
  contacts: ContactSubmission[];
  selectedContactId: string | null;
}>;

export function ProposalCreatePicker({
  contacts,
  selectedContactId,
}: ProposalCreatePickerProps) {
  const router = useRouter();
  const [contactId, setContactId] = useState(
    selectedContactId ?? contacts[0]?.id ?? "",
  );
  const [message, setMessage] = useState<string | null>(
    null,
  );
  const [pendingMode, setPendingMode] = useState<
    "manual" | "ai" | null
  >(null);
  const [pending, startTransition] = useTransition();

  function create(mode: "manual" | "ai") {
    setMessage(null);
    setPendingMode(mode);

    startTransition(async () => {
      const result = await createProposalAction({
        contactId,
        mode,
      });

      if (!result.ok) {
        setPendingMode(null);
        setMessage(result.message);
        return;
      }

      router.push(`/dashboard/proposals/${result.id}`);
    });
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
        <p className="text-sm text-[var(--dash-muted)]">
          You need a client submission before you can write a proposal.
        </p>

        <Link
          href="/dashboard/contacts"
          className="mt-4 inline-flex text-sm font-bold text-[var(--dash-accent)]"
        >
          Open contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--dash-muted)]">
          Client submission
        </span>

        <select
          value={contactId}
          onChange={(event) => {
            setContactId(event.target.value);
          }}
          className="dashboard-input dashboard-input-select"
        >
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.fullName}
              {contact.projectTitle
                ? ` · ${contact.projectTitle}`
                : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => create("manual")}
          className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 text-left transition hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-surface-hover)] disabled:opacity-60"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] text-[var(--dash-accent)]">
            {pendingMode === "manual" ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </span>

          <p className="mt-4 text-base font-bold">
            Manual
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--dash-muted)]">
            Write the proposal yourself: scope, deliverables, timeline, pricing, terms, and signature.
          </p>
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => create("ai")}
          className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 text-left transition hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-surface-hover)] disabled:opacity-60"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] text-[var(--dash-accent)]">
            {pendingMode === "ai" ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </span>

          <p className="mt-4 text-base font-bold">
            AI generated
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--dash-muted)]">
            Draft from the intake form, then edit anything before you send it.
          </p>
        </button>
      </div>

      {message ? (
        <p className="text-sm text-rose-400">{message}</p>
      ) : null}

      <p className="inline-flex items-center gap-2 text-xs text-[var(--dash-soft)]">
        <Send className="h-3.5 w-3.5" />
        You can review and edit the proposal before sharing it.
      </p>
    </div>
  );
}
