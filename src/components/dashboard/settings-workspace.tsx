"use client";

import {
  Check,
  LoaderCircle,
  LogOut,
  Monitor,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

import { logoutDashboardUser } from
  "@/app/(admin)/dashboard/actions";
import {
  updateDisplayName,
  type UpdateDisplayNameState,
} from "@/app/(admin)/dashboard/settings-actions";

import { FormLinkMenu } from "./form-link-menu";

type SettingsWorkspaceProps = Readonly<{
  displayName: string;
  email: string;
  providers: string[];
  formPublicOwnerId: string | null;
}>;

const initialNameState: UpdateDisplayNameState = {
  status: "idle",
  message: "",
};

const providerLabels: Record<string, string> = {
  email: "Email",
  google: "Google",
};

function NameSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--dash-accent)] px-4 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? (
        <LoaderCircle
          className="h-4 w-4 animate-spin"
          aria-hidden="true"
        />
      ) : null}
      {pending ? "Saving…" : "Save name"}
    </button>
  );
}

function AppearancePicker() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = [
    {
      id: "light",
      label: "Light",
      helper: "Bright workspace",
      icon: Sun,
    },
    {
      id: "dark",
      label: "Dark",
      helper: "Low-glare night view",
      icon: Moon,
    },
    {
      id: "system",
      label: "System",
      helper: "Match this device",
      icon: Monitor,
    },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => {
        const Icon = option.icon;
        const selected =
          mounted && theme === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              setTheme(option.id);
            }}
            className={[
              "rounded-2xl border px-4 py-4 text-left transition",
              selected
                ? "border-[var(--dash-border-strong)] bg-[var(--dash-accent-soft)] shadow-[var(--dash-active-shadow)]"
                : "border-[var(--dash-border)] bg-[var(--dash-surface-strong)] hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-surface-hover)]",
            ].join(" ")}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-accent)]">
              <Icon className="h-4 w-4" />
            </span>

            <p className="mt-3 text-sm font-bold">
              {option.label}
            </p>

            <p className="mt-1 text-xs text-[var(--dash-muted)]">
              {option.helper}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export function SettingsWorkspace({
  displayName,
  email,
  providers,
  formPublicOwnerId,
}: SettingsWorkspaceProps) {
  const router = useRouter();
  const [nameState, nameAction] = useActionState(
    updateDisplayName,
    initialNameState,
  );

  useEffect(() => {
    if (nameState.status === "success") {
      router.refresh();
    }
  }, [nameState, router]);

  return (
    <div className="dashboard-page-enter mx-auto w-full max-w-3xl space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-5 shadow-[var(--dash-card-shadow)] sm:px-6">
        <span
          className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-violet-500/16 blur-3xl"
          aria-hidden="true"
        />

        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--dash-accent)]">
          Account
        </p>

        <h1 className="mt-2 text-2xl font-black tracking-[-0.05em] sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--dash-muted)]">
          Update how your name appears in the dashboard, choose a theme, and manage your intake form link.
        </p>
      </section>

      <section className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[var(--dash-card-shadow)] sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] text-[var(--dash-accent)]">
            <UserRound className="h-5 w-5" />
          </span>

          <div>
            <h2 className="text-base font-bold tracking-[-0.02em]">
              Profile
            </h2>

            <p className="mt-1 text-xs text-[var(--dash-muted)]">
              This name is used for your avatar initials.
            </p>
          </div>
        </div>

        <form action={nameAction} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="settings-full-name"
              className="mb-2 block text-sm font-medium text-[var(--dash-muted)]"
            >
              Full name
            </label>

            <input
              id="settings-full-name"
              name="full_name"
              type="text"
              defaultValue={displayName}
              autoComplete="name"
              maxLength={80}
              required
              className="dashboard-input"
            />
          </div>

          <div>
            <label
              htmlFor="settings-email"
              className="mb-2 block text-sm font-medium text-[var(--dash-muted)]"
            >
              Email
            </label>

            <input
              id="settings-email"
              type="email"
              value={email}
              readOnly
              className="dashboard-input cursor-default opacity-80"
            />

            <p className="mt-2 text-xs text-[var(--dash-soft)]">
              This is the email you use to sign in.
              {providers.length > 0
                ? ` Connected with ${providers
                    .map(
                      (provider) =>
                        providerLabels[provider] ??
                        provider,
                    )
                    .join(" and ")}.`
                : ""}
            </p>
          </div>

          {nameState.message ? (
            <p
              className={[
                "text-sm",
                nameState.status === "success"
                  ? "text-emerald-500"
                  : "text-rose-400",
              ].join(" ")}
              role="status"
            >
              {nameState.status === "success" ? (
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  {nameState.message}
                </span>
              ) : (
                nameState.message
              )}
            </p>
          ) : null}

          <NameSubmitButton />
        </form>
      </section>

      <section className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[var(--dash-card-shadow)] sm:p-6">
        <h2 className="text-base font-bold tracking-[-0.02em]">
          Appearance
        </h2>

        <p className="mt-1 text-xs text-[var(--dash-muted)]">
          Choose how Intakeio looks on this device.
        </p>

        <div className="mt-5">
          <AppearancePicker />
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[var(--dash-card-shadow)] sm:p-6">
        <h2 className="text-base font-bold tracking-[-0.02em]">
          Intake form
        </h2>

        <p className="mt-1 text-xs text-[var(--dash-muted)]">
          Create once, then share the same form anywhere.
        </p>

        <div className="mt-4">
          <FormLinkMenu
            publicOwnerId={formPublicOwnerId}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[var(--dash-card-shadow)] sm:p-6">
        <h2 className="text-base font-bold tracking-[-0.02em]">
          Session
        </h2>

        <p className="mt-1 text-xs text-[var(--dash-muted)]">
          Sign out of this browser. Your contacts stay saved.
        </p>

        <form action={logoutDashboardUser} className="mt-4">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-sm font-bold text-rose-500 transition hover:bg-rose-500/15"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </section>
    </div>
  );
}
