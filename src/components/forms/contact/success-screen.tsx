import { CheckCircle2 } from "lucide-react";

type SuccessScreenProps = Readonly<{
  leaveHref: string;
}>;

export function SuccessScreen({
  leaveHref,
}: SuccessScreenProps) {
  return (
    <div className="glass-card animate-fade-up rounded-3xl p-10 text-center sm:p-14">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
        <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.5} />
      </div>
      <h2
        className="text-3xl tracking-tight text-foreground sm:text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Thank you.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        Your information has been received successfully. We&rsquo;ll review your submission
        and get back to you as soon as possible.
      </p>
      <div className="mx-auto mt-8 h-px w-24 bg-linear-to-r from-transparent via-white/25 to-transparent" />
      <p className="mt-6 text-[12px] uppercase tracking-[0.2em] text-muted-foreground/70">
        Submission confirmed
      </p>
      <a
        href={leaveHref}
        className="mt-8 inline-flex items-center justify-center rounded-xl bg-linear-to-b from-primary to-[oklch(0.62_0.18_270)] px-6 py-3 text-[14px] font-medium tracking-wide text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.72_0.16_265/0.6),inset_0_1px_0_oklch(1_0_0/0.25)] transition-all hover:-translate-y-0.5 hover:brightness-110"
      >
        Close
      </a>
    </div>
  );
}
