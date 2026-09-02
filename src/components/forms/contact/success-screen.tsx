"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

import { resolveCloseDestination } from
  "@/lib/intake-forms/leave-href";

type SuccessScreenProps = Readonly<{
  publicOwnerId: string;
  leaveHref: string | null;
  onDismiss: () => void;
}>;

export function SuccessScreen({
  publicOwnerId,
  leaveHref,
  onDismiss,
}: SuccessScreenProps) {
  useEffect(() => {
    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeThankYou();
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown,
    );

    return () => {
      document.body.style.overflow =
        originalOverflow;
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
    };
  }, [leaveHref, publicOwnerId]);

  function closeThankYou() {
    const destination = resolveCloseDestination({
      leaveHref,
      referrer: document.referrer,
      publicOwnerId,
      appOrigin: window.location.origin,
    });

    if (destination) {
      window.location.assign(destination);
      return;
    }

    onDismiss();
  }

  return (
    <div
      className="intake-success-overlay"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="intake-success-title"
        className="glass-card intake-success-dialog animate-fade-up rounded-3xl p-8 text-center sm:p-12"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
          <CheckCircle2
            className="h-8 w-8 text-primary"
            strokeWidth={1.5}
          />
        </div>

        <h2
          id="intake-success-title"
          className="text-3xl tracking-tight text-foreground sm:text-4xl"
          style={{
            fontFamily: "var(--font-display)",
          }}
        >
          Thank you.
        </h2>

        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Your information has been received
          successfully. We&rsquo;ll review your
          submission and get back to you as soon
          as possible.
        </p>

        <div className="mx-auto mt-8 h-px w-24 bg-linear-to-r from-transparent via-white/25 to-transparent" />

        <p className="mt-6 text-[12px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Submission confirmed
        </p>

        <button
          type="button"
          onClick={closeThankYou}
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-linear-to-b from-primary to-[oklch(0.62_0.18_270)] px-6 py-3 text-[14px] font-medium tracking-wide text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.72_0.16_265/0.6),inset_0_1px_0_oklch(1_0_0/0.25)] transition-all hover:-translate-y-0.5 hover:brightness-110"
        >
          Close
        </button>
      </div>
    </div>
  );
}
