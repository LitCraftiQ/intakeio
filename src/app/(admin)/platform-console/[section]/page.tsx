import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Building2,
  CircleCheck,
  CircleX,
  ScrollText,
  ShieldCheck,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { requireAdminSection } from "@/lib/auth/admin";

type SectionConfiguration = Readonly<{
  allowed: readonly string[];
  description: string;
  icon: LucideIcon;
  restricted: readonly string[];
  title: string;
}>;

const SECTIONS: Readonly<
  Record<string, SectionConfiguration>
> = {
  businesses: {
    title: "Businesses",
    description:
      "Manage client workspaces and platform account status.",
    icon: Building2,
    allowed: [
      "Search and inspect registered businesses",
      "Review workspace owner and membership information",
      "Review subscription and usage status",
      "Suspend or restore a workspace with a recorded reason",
      "Revoke sessions associated with a compromised workspace",
      "Add internal administrative notes",
    ],
    restricted: [
      "Silently access private workspace information",
      "Edit client submissions without an authorized support reason",
      "Permanently delete a business with one action",
      "Bypass workspace authorization",
    ],
  },

  users: {
    title: "Users",
    description:
      "Review platform accounts, memberships, and sessions.",
    icon: Users,
    allowed: [
      "Search users by verified account information",
      "Review workspace memberships",
      "Review authentication provider and last sign-in",
      "Revoke active sessions",
      "Disable or restore an account with a recorded reason",
      "Review authentication activity",
    ],
    restricted: [
      "View passwords, OTP codes, or access tokens",
      "View Google credentials",
      "Change a user's identity without verification",
      "Sign in as a user without a controlled support process",
    ],
  },

  security: {
    title: "Security",
    description:
      "Monitor suspicious activity and protect platform access.",
    icon: ShieldCheck,
    allowed: [
      "Review failed authentication attempts",
      "Review rate-limit and spam events",
      "Review suspicious IP and session activity",
      "Revoke user sessions",
      "Suspend potentially compromised accounts",
      "Review authorization failures",
    ],
    restricted: [
      "Expose cookies, access tokens, or secret keys",
      "Disable security controls without authorization",
      "Delete security history",
      "Use security data outside platform protection",
    ],
  },

  "audit-logs": {
    title: "Audit Logs",
    description:
      "Review permanent records of sensitive administrative actions.",
    icon: ScrollText,
    allowed: [
      "Filter actions by administrator",
      "Filter actions by user or workspace",
      "Review previous and updated values",
      "Review action reason and request identifier",
      "Review date, time, and IP information",
      "Export authorized compliance reports later",
    ],
    restricted: [
      "Edit audit records",
      "Delete audit records through the admin panel",
      "Hide unsuccessful admin actions",
      "Record secrets, tokens, or full sensitive payloads",
    ],
  },

  "admin-team": {
    title: "Admin Team",
    description:
      "Control platform staff access and administrative permissions.",
    icon: UserCog,
    allowed: [
      "Invite administrators through a private process",
      "Assign approved administrative roles",
      "Disable administrative access",
      "Revoke administrator sessions",
      "Review administrator activity",
      "Apply least-privilege permissions",
    ],
    restricted: [
      "Create administrators through public registration",
      "Allow support agents to create administrators",
      "Allow administrators to grant themselves new permissions",
      "Store admin roles in user-editable metadata",
    ],
  },
};

type AdminSectionPageProps = Readonly<{
  params: Promise<{
    section: string;
  }>;
}>;

export async function generateMetadata({
  params,
}: AdminSectionPageProps): Promise<Metadata> {
  const { section } = await params;
  const configuration = SECTIONS[section];

  if (!configuration) {
    return {
      title: "Administration",
    };
  }

  return {
    title: `${configuration.title} | Admin`,
    description: configuration.description,
  };
}

export function generateStaticParams() {
  return Object.keys(SECTIONS).map((section) => ({
    section,
  }));
}

export default async function AdminSectionPage({
  params,
}: AdminSectionPageProps) {
  const { section } = await params;
  const configuration = SECTIONS[section];

  if (!configuration) {
    notFound();
  }
  await requireAdminSection(section);

  const Icon = configuration.icon;

  return (
    <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
      <section>
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-violet-300/15 bg-violet-400/10 text-violet-200">
            <Icon
              className="h-6 w-6"
              aria-hidden="true"
            />
          </span>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                {configuration.title}
              </h1>

              <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-3 py-1 text-xs font-medium text-amber-100">
                UI foundation
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
              {configuration.description}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_70px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-200">
              <CircleCheck
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <div>
              <h2 className="text-base font-semibold">
                Permitted capabilities
              </h2>

              <p className="mt-0.5 text-xs text-white/35">
                Actions this section will support
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {configuration.allowed.map((capability) => (
              <div
                key={capability}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/10 p-4"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />

                <p className="text-sm leading-6 text-white/60">
                  {capability}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_70px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-400/10 text-red-200">
              <CircleX
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <div>
              <h2 className="text-base font-semibold">
                Restricted actions
              </h2>

              <p className="mt-0.5 text-xs text-white/35">
                Actions administrators must not perform
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {configuration.restricted.map(
              (restriction) => (
                <div
                  key={restriction}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/10 p-4"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-300" />

                  <p className="text-sm leading-6 text-white/60">
                    {restriction}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>
      </div>
    </div>
  );
}