"use client";

import {
  Check,
  Copy,
  Link2,
  LoaderCircle,
} from "lucide-react";
import {
  useState,
  useTransition,
} from "react";

import { createIntakeFormLinkAction } from
  "@/app/(admin)/dashboard/form-link-actions";

type FormLinkMenuProps = Readonly<{
  publicOwnerId: string | null;
}>;

export function FormLinkMenu({
  publicOwnerId,
}: FormLinkMenuProps) {
  const [createdOwnerId, setCreatedOwnerId] =
    useState(publicOwnerId);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<
    string | null
  >(null);
  const [pending, startTransition] =
    useTransition();

  const formPath = createdOwnerId
    ? `/${createdOwnerId}/form`
    : null;

  async function copyLink() {
    if (!formPath) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${formPath}`,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch {
      setCopied(false);
    }
  }

  function createLink() {
    setMessage(null);

    startTransition(async () => {
      const result =
        await createIntakeFormLinkAction();

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      setCreatedOwnerId(result.publicOwnerId);
    });
  }

  return (
    <div className="rounded-xl bg-[var(--dash-surface)] p-3">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--dash-accent)]">
        <Link2
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
        Intake form
      </div>

      {formPath ? (
        <>
          <p className="mt-2 text-xs leading-5 text-[var(--dash-muted)]">
            Send this link anywhere. Submissions
            are saved to your contacts.
          </p>

          <p className="mt-2 truncate rounded-lg border border-[var(--dash-border)] bg-[var(--dash-input)] px-2.5 py-2 text-[11px] font-medium text-[var(--dash-text)]">
            {formPath}
          </p>

          <button
            type="button"
            onClick={copyLink}
            className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--dash-border)] px-3 text-sm font-semibold transition hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-surface-hover)]"
          >
            {copied ? (
              <Check
                className="h-4 w-4"
                aria-hidden="true"
              />
            ) : (
              <Copy
                className="h-4 w-4"
                aria-hidden="true"
              />
            )}
            {copied ? "Copied" : "Copy form link"}
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-xs leading-5 text-[var(--dash-muted)]">
            Create your form link once. The form
            is the same for every user. Your
            public id decides where the customer
            is saved.
          </p>

          <button
            type="button"
            onClick={createLink}
            disabled={pending}
            className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--dash-accent)] px-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? (
              <LoaderCircle
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Link2
                className="h-4 w-4"
                aria-hidden="true"
              />
            )}
            {pending
              ? "Creating..."
              : "Create form link"}
          </button>
        </>
      )}

      {message ? (
        <p className="mt-2 text-[11px] leading-5 text-rose-500">
          {message}
        </p>
      ) : null}
    </div>
  );
}
