import { ArrowRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ContactFormController } from
  "./use-contact-form";

type SubmitSectionProps = Readonly<{
  form: ContactFormController;
}>;

export function SubmitSection({
  form,
}: SubmitSectionProps) {
  return (
    <>
      {form.serverError ? (
        <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {form.serverError}
        </p>
      ) : null}

      <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-muted-foreground">
          By submitting, you agree to be contacted about your project. We
          respect your privacy.
        </p>

        <button
          type="submit"
          disabled={form.submitting}
          className={cn(
            "group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-[14px] font-medium tracking-wide",
            "bg-linear-to-b from-primary to-[oklch(0.62_0.18_270)] text-primary-foreground",
            "shadow-[0_10px_30px_-10px_oklch(0.72_0.16_265/0.6),inset_0_1px_0_oklch(1_0_0/0.25)]",
            "transition-all hover:-translate-y-0.5 hover:brightness-110",
            "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0",
          )}
        >
          {form.submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit information
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </>
  );
}
