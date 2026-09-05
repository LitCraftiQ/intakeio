"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { signInWithGoogle } from "./actions";
import { EmailOtpRequestForm } from "./email-otp-request-form";

type RegistrationFormProps = Readonly<{
  errorMessage?: string;
  nextPath: string;
}>;

function GoogleLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z"
      />

      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.38l-3.24-2.53c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.61A10 10 0 0 0 12 22Z"
      />

      <path
        fill="#FBBC05"
        d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.47H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.53l3.34-2.61Z"
      />

      <path
        fill="#EA4335"
        d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.95 5.47l3.34 2.61C7.18 7.71 9.39 5.95 12 5.95Z"
      />
    </svg>
  );
}

function GoogleSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.8)] transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080914] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
    >
      {pending ? (
        <LoaderCircle
          className="h-5 w-5 animate-spin"
          aria-hidden="true"
        />
      ) : (
        <GoogleLogo />
      )}

      <span>
        {pending
          ? "Connecting securely..."
          : "Continue with Google"}
      </span>

      {!pending && (
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export function RegistrationForm({
  errorMessage,
  nextPath,
}: RegistrationFormProps) {
  return (
    <div className="w-full">
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-100"
        >
          {errorMessage}
        </div>
      )}

      {/* Google registration */}
      <form action={signInWithGoogle}>
        <input
          type="hidden"
          name="next"
          value={nextPath}
        />

        <GoogleSubmitButton />
      </form>

      {/* Email OTP registration */}
      <EmailOtpRequestForm />

      {/* Passwordless information */}
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />

        <span className="text-xs uppercase tracking-[0.18em] text-white/35">
          Account setup
        </span>

        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid gap-3 text-sm text-white/55">
        <p className="flex items-start gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
          Create easy access account free.
        </p>

        <p className="flex items-start gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
          New users receive an account automatically.
        </p>

        <p className="flex items-start gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300" />
          Returning users securely enter thier workspace.
        </p>
      </div>
    </div>
  );
}