"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ExternalLink,
  LayoutDashboard,
  Menu,
  ScrollText,
  ShieldCheck,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  canAccessAdminSection,
  type AdminRole,
  type AdminSection,
} from "@/lib/auth/admin-policy";

type AdminShellProps = Readonly<{
  admin: Readonly<{
    role: AdminRole;
    roleLabel: string;
    displayName: string;
    email: string | null;
    initials: string;
  }>;

  children: ReactNode;
}>;

type NavigationItem = Readonly<{
  href: string;
  icon: LucideIcon;
  label: string;
  section: AdminSection;
}>;

const NAVIGATION: readonly NavigationItem[] = [
  {
    href: "/platform-console",
    icon: LayoutDashboard,
    label: "Overview",
    section: "overview",
  },
  {
    href: "/platform-console/businesses",
    icon: Building2,
    label: "Businesses",
    section: "businesses",
  },
  {
    href: "/platform-console/users",
    icon: Users,
    label: "Users",
    section: "users",
  },
  {
    href: "/platform-console/security",
    icon: ShieldCheck,
    label: "Security",
    section: "security",
  },
  {
    href: "/platform-console/audit-logs",
    icon: ScrollText,
    label: "Audit Logs",
    section: "audit-logs",
  },
  {
    href: "/platform-console/platform-console-team",
    icon: UserCog,
    label: "Admin Team",
    section: "admin-team",
  },
];

const PAGE_TITLES: Readonly<
  Record<string, string>
> = {
  "/platform-console": "Overview",
  "/platform-console/businesses":
    "Businesses",
  "/platform-console/users": "Users",
  "/platform-console/security":
    "Security",
  "/platform-console/audit-logs":
    "Audit Logs",
  "/platform-console/admin-team":
    "Admin Team",
};

function isCurrentRoute(
  pathname: string,
  href: string,
) {
  if (href === "/platform-console") {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export function AdminShell({
  admin,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [mobileNavigationOpen, setMobileNavigationOpen] =
    useState(false);

  const pageTitle =
    PAGE_TITLES[pathname] ?? "Administration";

  const visibleNavigation =
    NAVIGATION.filter((item) =>
      canAccessAdminSection(
        admin.role,
        item.section,
      ),
    );  

  useEffect(() => {
    setMobileNavigationOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavigationOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileNavigationOpen]);

  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-[#070914] text-white">
      <button
        type="button"
        aria-label="Close admin navigation"
        className={`fixed inset-0 z-40 bg-black/65 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileNavigationOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => {
          setMobileNavigationOpen(false);
        }}
      />

      <aside
        id="admin-navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-white/10 bg-[#0b0d1b]/95 shadow-2xl backdrop-blur-2xl transition-transform duration-300 lg:w-72 lg:translate-x-0 ${
          mobileNavigationOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/platform-console"
            className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-[0_12px_30px_-12px_rgba(124,92,255,0.9)]">
              <ShieldCheck
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <span className="min-w-0">
              <strong className="block truncate text-sm font-semibold">
                Control Center
              </strong>

              <span className="block truncate text-xs text-white/40">
                Platform administration
              </span>
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close navigation"
            className="grid h-11 w-11 place-items-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 lg:hidden"
            onClick={() => {
              setMobileNavigationOpen(false);
            }}
          >
            <X
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>

        <nav
          aria-label="Admin navigation"
          className="flex-1 overflow-y-auto px-3 py-5"
        >
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
            Platform
          </p>

          <div className="space-y-1">
            {visibleNavigation.map((item) => {
              const current = isCurrentRoute(
                pathname,
                item.href,
              );

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    current ? "page" : undefined
                  }
                  className={`group flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
                    current
                      ? "bg-violet-400/15 text-white shadow-[inset_0_0_0_1px_rgba(167,139,250,0.18)]"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition ${
                      current
                        ? "bg-violet-400/15 text-violet-200"
                        : "bg-white/[0.04] text-white/45 group-hover:text-white/80"
                    }`}
                  >
                    <Icon
                      className="h-[18px] w-[18px]"
                      aria-hidden="true"
                    />
                  </span>

                  <span className="truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4">
            <p className="text-xs font-semibold text-amber-100">
              Preview mode
            </p>

            <p className="mt-1.5 text-xs leading-5 text-white/40">
              Admin permissions and live platform
              data are not connected yet.
            </p>
          </div>

          <Link
            href="/"
            className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            Return to website

            <ExternalLink
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-72">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-white/10 bg-[#070914]/80 px-4 backdrop-blur-2xl sm:px-6 lg:min-h-20 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open admin navigation"
              aria-controls="admin-navigation"
              aria-expanded={mobileNavigationOpen}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 lg:hidden"
              onClick={() => {
                setMobileNavigationOpen(true);
              }}
            >
              <Menu
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold sm:text-base">
                {pageTitle}
              </p>

              <p className="hidden truncate text-xs text-white/35 sm:block">
                Platform administration
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-3 py-1.5 text-xs font-medium text-amber-100 sm:inline-flex">
              Preview only
            </span>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 pr-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 text-xs font-bold">
                {admin.initials}
              </span>

              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-36 truncate text-xs font-medium text-white/70">
                  {admin.displayName}
                </span>

                <span className="block max-w-36 truncate text-[10px] text-white/35">
                  {admin.roleLabel}
                </span>
              </span>
            </div>
          </div>
        </header>

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}