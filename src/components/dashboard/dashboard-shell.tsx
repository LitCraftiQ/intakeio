"use client";

import {
  BarChart3,
  ChevronDown,
  Download,
  FileText,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

import {
  logoutDashboardUser,
} from "@/app/(admin)/dashboard/actions";
import type {
  DashboardNotification,
} from "@/lib/dashboard/types";

import {
  DashboardNotifications,
} from "./dashboard-notifications";
import {
  DashboardThemeToggle,
} from "./dashboard-theme-toggle";
import { FormLinkMenu } from "./form-link-menu";

type DashboardShellProps = Readonly<{
  children: ReactNode;
  displayName: string;
  email: string;
  ownerUserId: string;
  formPublicOwnerId: string | null;
  notifications: DashboardNotification[];
  notificationsError: string | null;
}>;

type NavigationItem = Readonly<{
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  available: boolean;
}>;

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    available: true,
  },
  {
    label: "Contacts",
    href: "/dashboard/contacts",
    icon: UsersRound,
    available: true,
  },
  {
    label: "Proposals",
    href: "/dashboard/proposals",
    icon: FileText,
    available: true,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    available: false,
  },
  {
    label: "Exports",
    href: "/dashboard/exports",
    icon: Download,
    available: false,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    available: true,
  },
];

function getInitials(displayName: string) {
  const words = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 0) {
    return "IO";
  }

  return words
    .map((word) =>
      word[0]?.toUpperCase(),
    )
    .join("");
}

function getPageTitle(pathname: string) {
  if (
    pathname.startsWith(
      "/dashboard/contacts",
    )
  ) {
    return "Contacts";
  }

  if (
    pathname.startsWith(
      "/dashboard/proposals",
    )
  ) {
    return "Proposals";
  }

  if (
    pathname.startsWith(
      "/dashboard/analytics",
    )
  ) {
    return "Analytics";
  }

  if (
    pathname.startsWith(
      "/dashboard/exports",
    )
  ) {
    return "Exports";
  }

  if (
    pathname.startsWith(
      "/dashboard/settings",
    )
  ) {
    return "Settings";
  }

  return "Dashboard";
}

function LogoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-rose-500 transition hover:bg-rose-500/10 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? (
        <LoaderCircle
          className="h-[18px] w-[18px] animate-spin"
          aria-hidden="true"
        />
      ) : (
        <LogOut
          className="h-[18px] w-[18px]"
          aria-hidden="true"
        />
      )}

      {pending
        ? "Logging out..."
        : "Log out"}
    </button>
  );
}

export function DashboardShell({
  children,
  displayName,
  email,
  ownerUserId,
  formPublicOwnerId,
  notifications,
  notificationsError,
}: DashboardShellProps) {
  const pathname = usePathname();

  const [
    mobileNavigationOpen,
    setMobileNavigationOpen,
  ] = useState(false);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const menuAreaRef =
    useRef<HTMLDivElement>(null);

  const initials =
    getInitials(displayName);

  const pageTitle =
    getPageTitle(pathname);

  useEffect(() => {
    setMobileNavigationOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(
      event: PointerEvent,
    ) {
      if (
        menuAreaRef.current &&
        !menuAreaRef.current.contains(
          event.target as Node,
        )
      ) {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
    };
  }, []);

  useEffect(() => {
    if (!mobileNavigationOpen) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [mobileNavigationOpen]);

  function renderNavigation() {
    return (
      <nav
        aria-label="Dashboard navigation"
        className="mt-8 space-y-1.5"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(
                  item.href,
                );

          if (!item.available) {
            return (
              <div
                key={item.href}
                aria-disabled="true"
                className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-[var(--dash-soft)]"
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  aria-hidden="true"
                />

                <span>{item.label}</span>

                <span className="ml-auto rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                active
                  ? "page"
                  : undefined
              }
              className={[
                "group relative flex min-h-11 items-center gap-3 overflow-hidden rounded-xl px-3.5 text-sm font-semibold transition",
                active
                  ? "bg-[var(--dash-active)] text-[var(--dash-text)] shadow-[var(--dash-active-shadow)]"
                  : "text-[var(--dash-muted)] hover:bg-[var(--dash-surface-hover)] hover:text-[var(--dash-text)]",
              ].join(" ")}
            >
              {active ? (
                <span
                  className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[var(--dash-accent)]"
                  aria-hidden="true"
                />
              ) : null}

              <Icon
                className={[
                  "h-[18px] w-[18px] transition",
                  active
                    ? "text-[var(--dash-accent)]"
                    : "text-[var(--dash-soft)] group-hover:text-[var(--dash-muted)]",
                ].join(" ")}
                aria-hidden="true"
              />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="dashboard-grid-bg min-h-[100svh] overflow-x-hidden text-[var(--dash-text)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-[var(--dash-border)] bg-[var(--dash-sidebar)] px-5 py-6 backdrop-blur-2xl lg:flex lg:flex-col">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--dash-ring)]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--dash-border-strong)] bg-gradient-to-br from-violet-500/25 to-cyan-400/15 text-[var(--dash-accent)] shadow-[0_14px_40px_-20px_rgba(95,76,230,0.65)]">
            <Inbox
              className="h-5 w-5"
              aria-hidden="true"
            />
          </span>

          <span>
            <span className="block text-[17px] font-bold tracking-[-0.03em]">
              Intakeio
            </span>

            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--dash-soft)]">
              Private submissions
            </span>
          </span>
        </Link>

        {renderNavigation()}

        <div className="mt-auto rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 shadow-[var(--dash-card-shadow)]">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--dash-accent)]">
            <Sparkles
              className="h-4 w-4"
              aria-hidden="true"
            />

            Workspace
          </div>

          <p className="mt-3 text-sm font-semibold">
            Your submissions stay private
          </p>

          <p className="mt-1.5 text-xs leading-5 text-[var(--dash-muted)]">
            Review contact information and
            project requests from one secure
            workspace.
          </p>
        </div>
      </aside>

      {mobileNavigationOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-sm"
            onClick={() => {
              setMobileNavigationOpen(
                false,
              );
            }}
          />

          <aside className="dashboard-drawer-enter relative flex h-full w-[min(86vw,310px)] flex-col border-r border-[var(--dash-border)] bg-[var(--dash-sidebar)] px-5 py-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="flex items-center gap-3"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--dash-border-strong)] bg-violet-500/15 text-[var(--dash-accent)]">
                  <Inbox
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </span>

                <span className="text-lg font-bold tracking-[-0.03em]">
                  Intakeio
                </span>
              </Link>

              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => {
                  setMobileNavigationOpen(
                    false,
                  );
                }}
                className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-muted)]"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            {renderNavigation()}

            <div className="mt-auto border-t border-[var(--dash-border)] pt-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
                  {initials}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {displayName}
                  </p>

                  <p className="truncate text-xs text-[var(--dash-muted)]">
                    {email}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="min-w-0 lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b border-[var(--dash-border)] bg-[var(--dash-header)] backdrop-blur-2xl">
          <div className="flex h-[72px] min-w-0 items-center gap-3 px-4 sm:px-6 xl:px-8">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => {
                setMobileNavigationOpen(
                  true,
                );
              }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-muted)] lg:hidden"
            >
              <Menu
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold sm:text-base">
                {pageTitle}
              </p>

              <p className="hidden text-xs text-[var(--dash-muted)] sm:block">
                Private client submission
                workspace
              </p>
            </div>

            <form
              action="/dashboard/contacts"
              method="get"
              role="search"
              className="ml-auto hidden w-full max-w-[380px] md:block"
            >
              <label
                htmlFor="dashboard-global-search"
                className="sr-only"
              >
                Search contacts
              </label>

              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--dash-soft)]"
                  aria-hidden="true"
                />

                <input
                  id="dashboard-global-search"
                  name="q"
                  type="search"
                  maxLength={120}
                  placeholder="Search contacts..."
                  className="h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] pl-11 pr-16 text-sm text-[var(--dash-text)] outline-none transition placeholder:text-[var(--dash-soft)] focus:border-[var(--dash-accent)] focus:ring-4 focus:ring-[var(--dash-ring)]"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--dash-soft)]">
                  Enter
                </span>
              </div>
            </form>

            <div
              ref={menuAreaRef}
              className="relative flex shrink-0 items-center gap-2"
            >
              <DashboardThemeToggle />

              <DashboardNotifications
                notifications={
                  notifications
                }
                errorMessage={
                  notificationsError
                }
                ownerUserId={ownerUserId}
                open={notificationsOpen}
                onOpenChange={(nextOpen) => {
                  setNotificationsOpen(
                    nextOpen,
                  );

                  if (nextOpen) {
                    setProfileOpen(false);
                  }
                }}
              />

              <button
                type="button"
                aria-label="Open account menu"
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen(
                    (current) => !current,
                  );

                  setNotificationsOpen(false);
                }}
                className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-1.5 pr-2.5 transition hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-surface-hover)]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                  {initials}
                </span>

                <span className="hidden max-w-32 truncate text-sm font-semibold xl:block">
                  {displayName}
                </span>

                <ChevronDown
                  className="hidden h-4 w-4 text-[var(--dash-soft)] sm:block"
                  aria-hidden="true"
                />
              </button>

              {profileOpen ? (
                <div className="absolute right-0 top-14 w-[min(92vw,340px)] rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-popover)] p-3 shadow-[var(--dash-popover-shadow)]">
                  <div className="rounded-xl bg-[var(--dash-surface)] p-3">
                    <p className="truncate text-sm font-bold">
                      {displayName}
                    </p>

                    <p className="mt-1 truncate text-xs text-[var(--dash-muted)]">
                      {email}
                    </p>
                  </div>

                  <div className="my-2 h-px bg-[var(--dash-border)]" />

                  <FormLinkMenu
                    publicOwnerId={
                      formPublicOwnerId
                    }
                  />

                  <div className="my-2 h-px bg-[var(--dash-border)]" />

                  <Link
                    href="/dashboard/settings"
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[var(--dash-muted)] transition hover:bg-[var(--dash-surface-hover)] hover:text-[var(--dash-text)]"
                  >
                    <Settings
                      className="h-[18px] w-[18px]"
                      aria-hidden="true"
                    />
                    Settings
                  </Link>

                  <div className="my-2 h-px bg-[var(--dash-border)]" />

                  <form
                    action={
                      logoutDashboardUser
                    }
                  >
                    <LogoutSubmitButton />
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}