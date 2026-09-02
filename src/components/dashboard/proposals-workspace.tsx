"use client";

import {
  Check,
  Copy,
  FileText,
  Mail,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useEffect,
  useState,
  useTransition,
} from "react";

import {
  deleteProposalAction,
  prepareProposalLinkAction,
  sendProposalEmailAction,
} from "@/app/(admin)/dashboard/proposal-actions";
import { proposalPublicPath } from
  "@/lib/proposals/sections";
import type { ProposalRecord } from
  "@/lib/proposals/types";

type ProposalsWorkspaceProps = Readonly<{
  proposals: ProposalRecord[];
}>;

const statusLabels: Record<
  ProposalRecord["status"],
  string
> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  changes_requested: "Changes requested",
};

export function ProposalsWorkspace({
  proposals,
}: ProposalsWorkspaceProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<
    string | null
  >(null);
  const [copiedId, setCopiedId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(
    null,
  );
  const [emailProposal, setEmailProposal] =
    useState<ProposalRecord | null>(null);
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!emailProposal) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setEmailProposal(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [emailProposal]);

  function copyLink(proposal: ProposalRecord) {
    setPendingId(proposal.id);
    setMessage(null);

    startTransition(async () => {
      const prepared = await prepareProposalLinkAction(
        proposal.id,
      );

      setPendingId(null);

      if (!prepared.ok || !prepared.publicToken) {
        setMessage(
          prepared.ok
            ? "The proposal link could not be copied."
            : prepared.message,
        );
        return;
      }

      try {
        await navigator.clipboard.writeText(
          `${window.location.origin}${proposalPublicPath(
            prepared.publicToken,
          )}`,
        );
        setCopiedId(proposal.id);
        window.setTimeout(() => setCopiedId(null), 1400);
        router.refresh();
      } catch {
        setMessage("The proposal link could not be copied.");
      }
    });
  }

  function deleteProposal(proposal: ProposalRecord) {
    const confirmed = window.confirm(
      `Delete ${proposal.projectTitle || "this proposal"}?`,
    );

    if (!confirmed) {
      return;
    }

    setPendingId(proposal.id);
    setMessage(null);

    startTransition(async () => {
      const result = await deleteProposalAction(
        proposal.id,
      );

      setPendingId(null);

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      router.refresh();
    });
  }

  function sendEmail() {
    if (!emailProposal) {
      return;
    }

    setPendingId(emailProposal.id);
    setMessage(null);

    startTransition(async () => {
      const result = await sendProposalEmailAction({
        id: emailProposal.id,
        email,
      });

      setPendingId(null);

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      setEmailProposal(null);
      setMessage(result.message ?? "Proposal sent by email.");
      router.refresh();
    });
  }

  return (
    <div className="dashboard-page-enter mx-auto w-full max-w-[1540px]">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-5 shadow-[var(--dash-card-shadow)] sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--dash-accent)]">
              After intake
            </p>

            <h1 className="mt-2 text-2xl font-black tracking-[-0.05em] sm:text-3xl">
              Proposals
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--dash-muted)]">
              Review a submission, draft a proposal by hand or with AI, send a private link, and track acceptance or change requests.
            </p>
          </div>

          <Link
            href="/dashboard/proposals/new"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--dash-accent)] px-4 text-sm font-bold text-white"
          >
            New proposal
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
        {proposals.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <FileText className="mx-auto h-6 w-6 text-[var(--dash-soft)]" />
            <p className="mt-3 text-sm font-semibold">
              No proposals yet
            </p>
            <p className="mt-2 text-sm text-[var(--dash-muted)]">
              Open a contact and create a manual or AI proposal from their intake form.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--dash-border)]">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(140px,0.7fr)_auto_auto] sm:items-center sm:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {proposal.projectTitle || "Untitled proposal"}
                  </p>
                  <p className="mt-1 truncate text-xs text-[var(--dash-muted)]">
                    {proposal.contactName}
                    {proposal.contactCompany
                      ? ` · ${proposal.contactCompany}`
                      : ""}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-[var(--dash-soft)]">
                    {proposalPublicPath(proposal.publicToken)}
                  </p>
                </div>

                <p className="text-xs font-semibold text-[var(--dash-muted)]">
                  {proposal.creationMode === "ai"
                    ? "AI generated"
                    : "Manual"}
                </p>

                <span className="justify-self-start rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-2.5 py-1 text-[10px] font-bold sm:justify-self-end">
                  {statusLabels[proposal.status]}
                </span>

                <div className="flex items-center gap-1.5 sm:justify-self-end">
                  <IconAction
                    label="Copy link"
                    disabled={pending && pendingId === proposal.id}
                    onClick={() => {
                      copyLink(proposal);
                    }}
                  >
                    {copiedId === proposal.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </IconAction>

                  <IconAction
                    label="Send to mail"
                    disabled={pending && pendingId === proposal.id}
                    onClick={() => {
                      setMessage(null);
                      setEmailProposal(proposal);
                      setEmail(proposal.contactEmail);
                    }}
                  >
                    <Mail className="h-4 w-4" />
                  </IconAction>

                  <IconAction
                    href={`/dashboard/proposals/${proposal.id}`}
                    label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </IconAction>

                  <IconAction
                    label="Delete"
                    disabled={pending && pendingId === proposal.id}
                    onClick={() => {
                      deleteProposal(proposal);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconAction>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {message ? (
        <p className="mt-3 text-sm text-[var(--dash-muted)]">
          {message}
        </p>
      ) : null}

      {emailProposal ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[var(--dash-overlay)] px-4"
          role="presentation"
          onClick={() => {
            if (!pending) {
              setEmailProposal(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="send-proposal-title"
            className="w-full max-w-md rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-popover)] p-5 shadow-[var(--dash-popover-shadow)] sm:p-6"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--dash-accent)]">
                  Client submission
                </p>
                <h2
                  id="send-proposal-title"
                  className="mt-2 text-lg font-black tracking-[-0.04em]"
                >
                  Send proposal to mail
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--dash-muted)]">
                  Prefills from {emailProposal.contactName}. You can change the address before sending.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                disabled={pending}
                onClick={() => {
                  setEmailProposal(null);
                }}
                className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--dash-border)] text-[var(--dash-muted)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold">
                Email
              </span>
              <input
                type="email"
                value={email}
                disabled={pending}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                className="dashboard-input"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={sendEmail}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--dash-accent)] px-4 text-sm font-bold text-white"
              >
                Send proposal to mail
              </button>

              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setEmailProposal(null);
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--dash-border)] px-4 text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function IconAction({
  label,
  children,
  href,
  disabled,
  onClick,
}: Readonly<{
  label: string;
  children: ReactNode;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
}>) {
  const className =
    "group relative grid h-9 w-9 place-items-center rounded-xl border border-[var(--dash-border)] text-[var(--dash-muted)] transition hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-surface-hover)] hover:text-[var(--dash-text)] disabled:opacity-50";

  const tooltip = (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--dash-border)] bg-[var(--dash-popover)] px-2 py-1 text-[10px] font-bold text-[var(--dash-text)] opacity-0 shadow-[var(--dash-popover-shadow)] transition group-hover:opacity-100 group-focus-visible:opacity-100">
      {label}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        className={className}
      >
        {children}
        {tooltip}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {children}
      {tooltip}
    </button>
  );
}
