"use client";

import {
  ArrowRight,
  LoaderCircle,
  Mail,
} from "lucide-react";
import { useActionState } from "react";

import {
  requestStaffAccess,
  type StaffAccessState,
} from "./actions";

const INITIAL_STATE: StaffAccessState = {
  status: "idle",
  message: "",
};

export function StaffAccessForm() {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    requestStaffAccess,
    INITIAL_STATE,
  );

  return (
    <form
      action={formAction}
      className="mt-8 space-y-5"
    >
      <div>
        <label
          htmlFor="staff-email"
          className="text-sm font-medium text-white/75"
        >
          Authorized email
        </label>

        <div className="relative mt-2">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30"
            aria-hidden="true"
          />

          <input
            id="staff-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={320}
            required
            disabled={pending}
            placeholder="name@example.com"
            className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] py-3 pl-12 pr-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-violet-300/50 focus:ring-4 focus:ring-violet-400/10 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_-20px_rgba(124,92,255,0.9)] transition hover:scale-[1.01] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070914] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <LoaderCircle
              className="h-5 w-5 animate-spin"
              aria-hidden="true"
            />

            Checking access…
          </>
        ) : (
          <>
            Send secure access link

            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {state.message && (
        <div
          role={
            state.status === "error" ||
            state.status ===
              "validation_error"
              ? "alert"
              : "status"
          }
          className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
            state.status === "error" ||
            state.status ===
              "validation_error"
              ? "border-red-300/20 bg-red-400/10 text-red-100"
              : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
          }`}
        >
          {state.message}
        </div>
      )}
    </form>
  );
}