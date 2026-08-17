import type { Metadata } from "next";
import {
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { StaffAccessForm } from "./staff-access-form";

export const metadata: Metadata = {
  title: "Staff Access",
  description:
    "Private access for authorized platform staff.",
  robots: {
    index: false,
    follow: false,
    noarchive: false,
  },
};

export const dynamic = "force-dynamic";

export default async function StaffAccessPage() {
  const supabase = await createClient();

  const {
    data: claimsResult,
  } = await supabase.auth.getClaims();

  const userId =
    typeof claimsResult?.claims?.sub ===
    "string"
      ? claimsResult.claims.sub
      : null;

  if (userId) {
    const { data: membership } =
      await supabase
        .from("admin_memberships")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

    if (membership) {
      redirect("/platform-console");
    }
  }

  return (
    <main className="relative isolate grid min-h-[100svh] place-items-center overflow-hidden bg-[#070914] px-4 py-10 text-white sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(124,92,255,0.19),transparent_34%),radial-gradient(circle_at_85%_82%,rgba(47,203,255,0.12),transparent_30%)]"
        aria-hidden="true"
      />

      <section className="relative z-10 w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_35px_100px_-35px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:p-9">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-violet-300/15 bg-violet-400/10 text-violet-200">
          <KeyRound
            className="h-6 w-6"
            aria-hidden="true"
          />
        </span>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
          Restricted staff access
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          Verify your staff identity
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/50">
          Secure access links are sent only to
          active platform administrators.
        </p>

        <StaffAccessForm />

        <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300"
              aria-hidden="true"
            />

            <p className="text-xs leading-5 text-white/40">
              Public account registration does not
              grant platform-console access.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <LockKeyhole
              className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300"
              aria-hidden="true"
            />

            <p className="text-xs leading-5 text-white/40">
              Unauthorized access attempts receive
              no information about staff accounts.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}