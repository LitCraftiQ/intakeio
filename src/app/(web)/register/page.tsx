import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { RegistrationForm } from "./registration-form";

import "./register.css";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create your secure client intake platform account.",
};

export const dynamic = "force-dynamic";

type RegisterPageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
}>;

function getSafeNextPath(value?: string) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/dashboard";
  }

  return value;
}

function getErrorMessage(error?: string) {
  switch (error) {
    case "google_sign_in_failed":
      return "Google sign-in could not be started. Please try again.";

    case "authentication_failed":
      return "Your authentication could not be completed. Please try again.";

    default:
      return undefined;
  }
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next);
  const errorMessage = getErrorMessage(params.error);

  return (
    <main className="registration-page relative isolate min-h-[100svh] overflow-hidden bg-[#070814] px-4 py-6 text-white sm:px-6 sm:py-10">
      <div
        className="registration-glow registration-glow-one"
        aria-hidden="true"
      />

      <div
        className="registration-glow registration-glow-two"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />

            Back
          </Link>

          <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/90 shadow-[0_10px_30px_-15px_rgba(124,92,255,0.8)] backdrop-blur-md">
              {/* <Sparkles
                className="h-4 w-4 text-violet-300"
                aria-hidden="true"
              /> */}
              <img src="/favicon.png" alt="Intakeio" className="h-full w-full object-cover"/>
            </span>


            Client Intake
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <section className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] shadow-[0_35px_100px_-35px_rgba(0,0,0,0.9)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
            <div className="hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
                  <ShieldCheck
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Secure access
                </div>

                <h1 className="mt-7 max-w-md text-4xl font-bold leading-tight tracking-[-0.04em] xl:text-5xl">
                  Your private client workspace starts here.
                </h1>

                <p className="mt-5 max-w-md text-base leading-7 text-white/55">
                  Sign in once, create your workspace, and begin
                  collecting complete client information through one
                  secure link.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-200">
                    <LockKeyhole
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <strong className="text-sm font-semibold">
                      No passwords stored
                    </strong>

                    <p className="mt-1 text-sm leading-6 text-white/45">
                      Authentication is handled through your verified
                      identity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-200">
                    <ShieldCheck
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <strong className="text-sm font-semibold">
                      Isolated workspace
                    </strong>

                    <p className="mt-1 text-sm leading-6 text-white/45">
                      Your future contacts and submissions remain
                      restricted to your workspace.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center p-6 sm:p-10 xl:p-14">
              <div className="mx-auto w-full max-w-sm">
                <div className="lg:hidden">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
                    <ShieldCheck
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    Secure account access
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-white/50 sm:text-base">
                  Continue with your Google account.
                </p>

                <div className="mt-6">
                  <RegistrationForm
                    errorMessage={errorMessage}
                    nextPath={nextPath}
                  />
                </div>

                <p className="mt-7 text-center text-xs leading-5 text-white/35">
                  By continuing, you agree to the future Terms of
                  Service and Privacy Policy.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}