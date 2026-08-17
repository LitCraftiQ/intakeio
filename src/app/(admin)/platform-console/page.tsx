import {
    Activity,
    Building2,
    Database,
    FileText,
    LockKeyhole,
    ShieldAlert,
    ShieldCheck,
    Users,
    type LucideIcon,
  } from "lucide-react";
  
  type MetricCard = Readonly<{
    description: string;
    icon: LucideIcon;
    label: string;
  }>;
  
  const METRICS: readonly MetricCard[] = [
    {
      description: "Registered client workspaces",
      icon: Building2,
      label: "Businesses",
    },
    {
      description: "Platform account holders",
      icon: Users,
      label: "Users",
    },
    {
      description: "Published intake forms",
      icon: FileText,
      label: "Forms",
    },
    {
      description: "Received client intakes",
      icon: Database,
      label: "Submissions",
    },
  ];
  
  const READINESS_ITEMS = [
    {
      description:
        "Google and email OTP authentication",
      label: "Passwordless authentication",
      status: "Not connected",
    },
    {
      description:
        "Platform-owner and staff permissions",
      label: "Admin role authorization",
      status: "Not connected",
    },
    {
      description:
        "Business and membership separation",
      label: "Workspace isolation",
      status: "Planned",
    },
    {
      description:
        "Database-level ownership policies",
      label: "Row Level Security",
      status: "Planned",
    },
    {
      description:
        "Permanent sensitive-action history",
      label: "Audit logging",
      status: "Planned",
    },
  ] as const;
  
  export default function AdminOverviewPage() {
    return (
      <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <section>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                Platform overview
              </p>
  
              <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                Administration dashboard
              </h1>
  
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
                Monitor platform readiness, businesses,
                users, security events, and administrative
                activity.
              </p>
            </div>
  
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-3 py-2 text-xs font-medium text-amber-100">
              <Activity
                className="h-4 w-4"
                aria-hidden="true"
              />
  
              Live data not connected
            </div>
          </div>
  
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {METRICS.map((metric) => {
              const Icon = metric.icon;
  
              return (
                <article
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_70px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-violet-300/15 bg-violet-400/10 text-violet-200">
                      <Icon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </span>
  
                    <span className="text-3xl font-bold text-white/30">
                      —
                    </span>
                  </div>
  
                  <h2 className="mt-5 text-sm font-semibold">
                    {metric.label}
                  </h2>
  
                  <p className="mt-1 text-xs leading-5 text-white/35">
                    {metric.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
  
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] shadow-[0_24px_70px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div className="border-b border-white/10 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-200">
                  <ShieldCheck
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </span>
  
                <div>
                  <h2 className="text-base font-semibold">
                    Platform readiness
                  </h2>
  
                  <p className="mt-0.5 text-xs text-white/35">
                    Security and infrastructure status
                  </p>
                </div>
              </div>
            </div>
  
            <div className="divide-y divide-white/10">
              {READINESS_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center sm:p-6"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {item.label}
                    </p>
  
                    <p className="mt-1 text-xs leading-5 text-white/35">
                      {item.description}
                    </p>
                  </div>
  
                  <span
                    className={`w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                      item.status === "Planned"
                        ? "border-cyan-300/15 bg-cyan-400/[0.07] text-cyan-100"
                        : "border-amber-300/15 bg-amber-300/[0.06] text-amber-100"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
  
          <div className="grid gap-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_70px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-400/10 text-red-200">
                  <ShieldAlert
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </span>
  
                <div>
                  <h2 className="text-base font-semibold">
                    Security snapshot
                  </h2>
  
                  <p className="mt-0.5 text-xs text-white/35">
                    No security source connected
                  </p>
                </div>
              </div>
  
              <div className="mt-6 grid min-h-32 place-items-center rounded-xl border border-dashed border-white/10 bg-black/10 px-5 text-center">
                <div>
                  <LockKeyhole
                    className="mx-auto h-6 w-6 text-white/20"
                    aria-hidden="true"
                  />
  
                  <p className="mt-3 text-sm font-medium text-white/55">
                    No live security events
                  </p>
  
                  <p className="mt-1 text-xs leading-5 text-white/30">
                    Authentication and rate-limit events
                    will appear here later.
                  </p>
                </div>
              </div>
            </section>
  
            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_70px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-400/10 text-violet-200">
                  <Activity
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </span>
  
                <div>
                  <h2 className="text-base font-semibold">
                    Recent activity
                  </h2>
  
                  <p className="mt-0.5 text-xs text-white/35">
                    Administrative actions
                  </p>
                </div>
              </div>
  
              <div className="mt-6 grid min-h-32 place-items-center rounded-xl border border-dashed border-white/10 bg-black/10 px-5 text-center">
                <div>
                  <p className="text-sm font-medium text-white/55">
                    No activity recorded
                  </p>
  
                  <p className="mt-1 text-xs leading-5 text-white/30">
                    Verified admin actions will appear
                    after audit logging is connected.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }