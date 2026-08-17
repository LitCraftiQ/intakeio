"use client";

import {
  Check,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { completeWelcome } from "./actions";

const REDIRECT_DELAY = 3000;

export function WelcomeRedirect() {
  const router = useRouter();
  const [finishing, setFinishing] =
    useState(false);

  useEffect(() => {
    let active = true;
    let redirectTimer:
      | ReturnType<typeof setTimeout>
      | undefined;

    async function finishRegistration() {
      const firstAttempt =
        await completeWelcome();

      if (!firstAttempt.success) {
        await completeWelcome();
      }

      if (!active) {
        return;
      }

      setFinishing(true);

      redirectTimer = setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, REDIRECT_DELAY);
    }

    void finishRegistration();

    return () => {
      active = false;

      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [router]);

  return (
    <main className="relative isolate grid min-h-[100svh] place-items-center overflow-hidden bg-[#070814] px-5 py-10 text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(124,92,255,0.25),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(55,205,255,0.12),transparent_34%)]"
        aria-hidden="true"
      />

      <section className="relative z-10 w-full max-w-lg rounded-[28px] border border-white/10 bg-white/[0.045] p-7 text-center shadow-[0_35px_100px_-35px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-200 shadow-[0_18px_50px_-20px_rgba(52,211,153,0.8)]">
          <Check
            className="h-8 w-8"
            aria-hidden="true"
          />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-violet-200">
          <Sparkles
            className="h-4 w-4"
            aria-hidden="true"
          />

          Registration successful
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          Welcome to Intakeio
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/55 sm:text-base">
          Your secure account has been created.
          Intakeio will help you collect, organize,
          and manage client information from one
          workspace.
        </p>

        <div
          className="mt-8 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white/55"
          aria-live="polite"
        >
          <LoaderCircle
            className="h-5 w-5 animate-spin text-violet-300"
            aria-hidden="true"
          />

          {finishing
            ? "Please wait… we are redirecting you to your dashboard."
            : "Finishing your registration…"}
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <span className="welcome-progress block h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
        </div>
      </section>
    </main>
  );
}