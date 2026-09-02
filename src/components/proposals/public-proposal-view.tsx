"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { respondToProposalAction } from
  "@/app/(web)/p/[token]/actions";
import { AnimatedBackground } from
  "@/components/forms/contact/animated-background";
import { proposalBodySections } from
  "@/lib/proposals/sections";
import type { ProposalRecord } from
  "@/lib/proposals/types";

type PublicProposalViewProps = Readonly<{
  proposal: ProposalRecord;
}>;

const sections = proposalBodySections;

export function PublicProposalView({
  proposal,
}: PublicProposalViewProps) {
  const router = useRouter();
  const awaitingResponse =
    proposal.status === "sent" ||
    proposal.status === "viewed";

  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(
    null,
  );
  const [requestingChanges, setRequestingChanges] =
    useState(false);
  const [pending, startTransition] = useTransition();

  function respond(
    decision: "accepted" | "changes_requested",
  ) {
    setError(null);

    startTransition(async () => {
      const result = await respondToProposalAction({
        token: proposal.publicToken,
        decision,
        message,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <>
      <AnimatedBackground />

      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-10 sm:px-8 sm:py-16">
        <header className="animate-fade-up">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
            Proposal
          </p>

          <h1
            className="mt-3 text-[2.2rem] leading-[1.05] tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {proposal.projectTitle || "Project proposal"}
          </h1>

          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Prepared for {proposal.contactName}
            {proposal.contactCompany
              ? ` at ${proposal.contactCompany}`
              : ""}
            . Review the scope below, then accept or request changes.
          </p>
        </header>

        <div className="mt-10 space-y-4 sm:mt-14">
          {sections.map((section) => {
            const value = proposal[section.key].trim();

            if (!value) {
              return null;
            }

            return (
              <section
                key={section.key}
                className="glass-card animate-fade-up rounded-3xl p-5 sm:p-6"
              >
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
                  {section.label}
                </h2>

                <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-foreground/90">
                  {value}
                </p>
              </section>
            );
          })}
        </div>

        <section className="glass-card mt-6 rounded-3xl p-5 sm:p-6">
          {proposal.status === "accepted" ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
              <p
                className="mt-4 text-2xl tracking-tight"
                style={{
                  fontFamily: "var(--font-display)",
                }}
              >
                Proposal accepted
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Thank you. The sender has been notified and will follow up with next steps.
              </p>
            </div>
          ) : null}

          {proposal.status === "changes_requested" ? (
            <div>
              <p
                className="text-2xl tracking-tight"
                style={{
                  fontFamily: "var(--font-display)",
                }}
              >
                Change request received
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your notes were sent. You will receive an updated proposal when it is ready.
              </p>
            </div>
          ) : null}

          {awaitingResponse ? (
            <div>
              <p
                className="text-2xl tracking-tight"
                style={{
                  fontFamily: "var(--font-display)",
                }}
              >
                Ready to proceed?
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Accept this proposal as written, or tell us what you would like changed.
              </p>

              {requestingChanges ? (
                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-medium">
                    What should change?
                  </span>
                  <textarea
                    value={message}
                    rows={5}
                    disabled={pending}
                    onChange={(event) => {
                      setMessage(event.target.value);
                    }}
                    className="glass-input w-full resize-y rounded-2xl px-4 py-3 text-[15px] text-foreground outline-none"
                  />
                </label>
              ) : null}

              {error ? (
                <p className="mt-3 text-sm text-rose-300">
                  {error}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => respond("accepted")}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-b from-primary to-[oklch(0.62_0.18_270)] px-5 text-sm font-medium text-primary-foreground"
                >
                  {pending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : null}
                  Accept proposal
                </button>

                {requestingChanges ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      respond("changes_requested")
                    }
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-medium"
                  >
                    Send change request
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setRequestingChanges(true);
                    }}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-medium"
                  >
                    Request changes
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </section>

        <footer className="mt-14 flex items-center justify-between text-[12px] text-muted-foreground/70">
          <span>
            © {new Date().getFullYear()} Intakeio
          </span>
          <span className="tracking-wide">
            Private proposal link
          </span>
        </footer>
      </main>
    </>
  );
}
