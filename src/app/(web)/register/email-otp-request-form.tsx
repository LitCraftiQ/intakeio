"use client";

import {
  ArrowRight,
  LoaderCircle,
  Mail,
} from "lucide-react";
import { useActionState } from "react";

import type {
  RequestEmailOtpState,
} from "@/lib/auth/otp-action-types";

import { requestEmailOtp } from
  "./email-otp-actions";

const initialState: RequestEmailOtpState = {
  status: "idle",
  message: "",
};

export function EmailOtpRequestForm() {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    requestEmailOtp,
    initialState,
  );

  return (
    <div className="mt-6">
      <div className="mb-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-white/10" />

        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
          Or continue with email
        </span>

        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form
        action={formAction}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="registration-email"
            className="mb-2 block text-sm font-medium text-white/75"
          >
            Email address
          </label>

          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35"
              aria-hidden="true"
            />

            <input
              id="registration-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={320}
              required
              disabled={pending}
              placeholder="you@company.com"
              className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] py-3 pl-12 pr-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-wait disabled:opacity-60"
            />
          </div>
        </div>

        {state.status === "error" ? (
          <p
            className="text-sm text-rose-300"
            role="alert"
          >
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0a0b14] transition hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? (
            <>
              <LoaderCircle
                className="h-5 w-5 animate-spin"
                aria-hidden="true"
              />

              Sending code…
            </>
          ) : (
            <>
              Continue with email

              <ArrowRight
                className="h-5 w-5"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
