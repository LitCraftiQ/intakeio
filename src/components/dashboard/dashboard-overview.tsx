import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Globe2,
    Inbox,
    UsersRound,
  } from "lucide-react";
  import type { LucideIcon } from "lucide-react";
  import Link from "next/link";
  
  import type {
    ContactStatus,
    ContactSubmission,
  } from "@/lib/dashboard/types";
  
  import {
    SharePageStudio,
  } from "./share-page-studio";
  import {
    SubmissionActivityChart,
  } from "./submission-activity-chart";
  
  type DashboardOverviewProps = Readonly<{
    contacts: ContactSubmission[];
  }>;
  
  type MetricCardProps = Readonly<{
    label: string;
    value: number;
    helper: string;
    icon: LucideIcon;
    accentClassName: string;
  }>;
  
  const statusLabels: Record<
    ContactStatus,
    string
  > = {
    pending: "Pending",
    contacted: "Contacted",
    qualified: "Qualified",
    archived: "Archived",
  };
  
  const statusClasses: Record<
    ContactStatus,
    string
  > = {
    pending:
      "border-amber-400/20 bg-amber-400/10 text-amber-600",
    contacted:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-600",
    qualified:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    archived:
      "border-[var(--dash-border)] bg-[var(--dash-surface-strong)] text-[var(--dash-muted)]",
  };
  
  function startOfCurrentDay(now: Date) {
    const result = new Date(now);
  
    result.setHours(0, 0, 0, 0);
  
    return result;
  }
  
  function formatSubmissionTime(
    value: string,
  ) {
    const date = new Date(value);
    const now = new Date();
  
    const elapsedMinutes = Math.floor(
      (now.getTime() - date.getTime()) /
        60_000,
    );
  
    if (elapsedMinutes < 1) {
      return "Just now";
    }
  
    if (elapsedMinutes < 60) {
      return `${elapsedMinutes}m ago`;
    }
  
    const elapsedHours = Math.floor(
      elapsedMinutes / 60,
    );
  
    if (elapsedHours < 24) {
      return `${elapsedHours}h ago`;
    }
  
    const elapsedDays = Math.floor(
      elapsedHours / 24,
    );
  
    if (elapsedDays < 7) {
      return `${elapsedDays}d ago`;
    }
  
    return new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short",
        day: "numeric",
      },
    ).format(date);
  }
  
  function MetricCard({
    label,
    value,
    helper,
    icon: Icon,
    accentClassName,
  }: MetricCardProps) {
    return (
        <article className="group relative min-w-0 overflow-hidden bg-[var(--dash-surface)] px-3 py-3 transition duration-200 hover:bg-[var(--dash-surface-hover)] sm:px-3.5 sm:py-3.5">
        <span
          className={[
            "pointer-events-none absolute -right-7 -top-7 h-20 w-20 rounded-full opacity-70 blur-2xl transition duration-300 group-hover:scale-125 group-hover:opacity-100",
            accentClassName,
          ].join(" ")}
          aria-hidden="true"
        />
  
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--dash-muted)]">
              {label}
            </p>
  
            <p className="mt-1.5 text-2xl font-black leading-none tracking-[-0.055em] text-[var(--dash-text)]">
              {value.toLocaleString()}
            </p>
          </div>
  
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] text-[var(--dash-muted)] transition duration-200 group-hover:border-[var(--dash-border-strong)] group-hover:text-[var(--dash-accent)]">
            <Icon
              className="h-4 w-4"
              aria-hidden="true"
            />
          </span>
        </div>
  
        <div className="relative mt-2.5 flex items-center gap-2">
          <span
            className="h-px min-w-5 flex-1 bg-[var(--dash-border)]"
            aria-hidden="true"
          />
  
          <p className="whitespace-nowrap text-[10px] font-medium text-[var(--dash-soft)]">
            {helper}
          </p>
        </div>
      </article>
    );
  }
  
  export function DashboardOverview({
    contacts,
  }: DashboardOverviewProps) {
    const now = new Date();
  
    const todayStart =
      startOfCurrentDay(now).getTime();
  
    const weekStart =
      now.getTime() -
      7 * 24 * 60 * 60 * 1000;
  
    const newToday = contacts.filter(
      (contact) =>
        new Date(
          contact.submittedAt,
        ).getTime() >= todayStart,
    ).length;
  
    const thisWeek = contacts.filter(
      (contact) =>
        new Date(
          contact.submittedAt,
        ).getTime() >= weekStart,
    ).length;
  
    const contacted = contacts.filter(
      (contact) =>
        contact.status === "contacted",
    ).length;
  
    const pending = contacts.filter(
      (contact) =>
        contact.status === "pending",
    ).length;

    const qualified = contacts.filter(
      (contact) =>
        contact.status === "qualified",
    ).length;

    const archived = contacts.filter(
      (contact) =>
        contact.status === "archived",
    ).length;
  
    const countries = new Set(
      contacts
        .map(
          (contact) => contact.country,
        )
        .filter(Boolean),
    ).size;
  
    const metrics: MetricCardProps[] = [
      {
        label: "Total contacts",
        value: contacts.length,
        helper: "All private submissions",
        icon: UsersRound,
        accentClassName:
          "bg-violet-500/25",
      },
      {
        label: "New today",
        value: newToday,
        helper: "Received since midnight",
        icon: Inbox,
        accentClassName:
          "bg-cyan-400/25",
      },
      {
        label: "This week",
        value: thisWeek,
        helper: "Last seven days",
        icon: CalendarDays,
        accentClassName:
          "bg-indigo-400/25",
      },
      {
        label: "Countries",
        value: countries,
        helper: "Submission locations",
        icon: Globe2,
        accentClassName:
          "bg-sky-400/25",
      },
      {
        label: "Contacted",
        value: contacted,
        helper: "Follow-up started",
        icon: CheckCircle2,
        accentClassName:
          "bg-emerald-400/25",
      },
      {
        label: "Pending",
        value: pending,
        helper: "Waiting for review",
        icon: Clock3,
        accentClassName:
          "bg-amber-400/25",
      },
    ];
  
    const recentContacts =
      contacts.slice(0, 6);
  
    const activity = Array.from(
      {
        length: 14,
      },
      (_, index) => {
        const date = new Date(now);

        date.setDate(
          now.getDate() - (13 - index),
        );

        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(date);
        dayEnd.setHours(
          23,
          59,
          59,
          999,
        );

        const dayContacts = contacts.filter(
          (contact) => {
            const submittedAt = new Date(
              contact.submittedAt,
            ).getTime();

            return (
              submittedAt >=
                dayStart.getTime() &&
              submittedAt <=
                dayEnd.getTime()
            );
          },
        );

        const lastSubmittedAt =
          dayContacts.reduce<string | null>(
            (latest, contact) => {
              if (
                !latest ||
                contact.submittedAt > latest
              ) {
                return contact.submittedAt;
              }

              return latest;
            },
            null,
          );

        return {
          label: new Intl.DateTimeFormat(
            "en-US",
            {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            },
          ).format(date),
          tick: new Intl.DateTimeFormat(
            "en-US",
            {
              month: "short",
              day: "numeric",
            },
          ).format(date),
          weekday: new Intl.DateTimeFormat(
            "en-US",
            {
              weekday: "short",
            },
          ).format(date),
          lastSubmittedAt,
          count: dayContacts.length,
        };
      },
    );
  
    return (
      <div className="dashboard-page-enter mx-auto w-full max-w-[1540px]">
        <section className="relative overflow-hidden rounded-[30px] border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[var(--dash-card-shadow)]">
            <span
                className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full bg-violet-500/15 blur-[90px]"
                aria-hidden="true"
            />

            <span
                className="pointer-events-none absolute -right-28 top-0 h-72 w-72 rounded-full bg-cyan-400/15 blur-[90px]"
                aria-hidden="true"
            />

            <span
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--dash-accent)] to-transparent opacity-55"
                aria-hidden="true"
            />

            <div className="relative flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span
                className="pointer-events-none absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-gradient-to-b from-violet-500 to-cyan-400"
                aria-hidden="true"
            />

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--dash-accent)]">
                    <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40 motion-reduce:animate-none" />

                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>

                    Live workspace
                </div>

                <span
                    className="h-3 w-px bg-[var(--dash-border)]"
                    aria-hidden="true"
                />

                <h1 className="text-xl font-black leading-none tracking-[-0.05em] text-[var(--dash-text)] sm:text-2xl">
                    Submission overview
                </h1>
                </div>

                <p className="mt-1.5 truncate text-[11px] text-[var(--dash-muted)] sm:text-xs">
                A calm view of your client requests, share pages, and contact activity.
                </p>
            </div>

            <Link
                href="/dashboard/contacts"
                className="group inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-3 text-[10px] font-bold text-[var(--dash-text)] transition hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-surface-hover)] sm:self-auto"
            >
                View all contacts

                <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
                />
            </Link>
            </div>

            <div className="relative border-t border-[var(--dash-border)] bg-[var(--dash-surface-strong)]/30 p-1.5 sm:p-2">
            <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-border)]">
                <div className="grid grid-cols-2 gap-px md:grid-cols-3 xl:grid-cols-6">
                {metrics.map((metric) => (
                    <MetricCard
                    key={metric.label}
                    {...metric}
                    />
                ))}
                </div>
            </div>
            </div>
        </section>
        {/* <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--dash-border-strong)] bg-[var(--dash-accent-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--dash-accent)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.85)]" />
  
              Live workspace
            </div>
  
            <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
              Submission overview
            </h1>
  
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--dash-muted)] sm:text-base">
              A calm view of your client
              requests, share pages, and contact
              activity.
            </p>
          </div>
  
          <Link
            href="/dashboard/contacts"
            className="group inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 text-sm font-bold text-[var(--dash-muted)] transition hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-surface-hover)] hover:text-[var(--dash-text)] sm:self-auto"
          >
            View all contacts
  
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </section>
  
        <section className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              {...metric}
            />
          ))}
        </section> */}
  
        <SharePageStudio />
  
        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
          <article className="overflow-hidden rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[var(--dash-card-shadow)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--dash-border)] px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-base font-bold tracking-[-0.02em]">
                  Recent contacts
                </h2>
  
                <p className="mt-1 text-xs text-[var(--dash-muted)]">
                  Your latest client
                  submissions
                </p>
              </div>
  
              <span className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-2.5 py-1 text-xs font-bold text-[var(--dash-muted)]">
                Latest 6
              </span>
            </div>
  
            <div className="divide-y divide-[var(--dash-border)]">
              {recentContacts.length === 0 ? (
                <p className="px-5 py-10 text-sm text-[var(--dash-muted)] sm:px-6">
                  No contacts yet. Create your
                  form link from the account menu
                  and send it to a client.
                </p>
              ) : (
                recentContacts.map(
                (contact) => (
                  <Link
                    key={contact.id}
                    href={`/dashboard/contacts?contact=${encodeURIComponent(
                      contact.id,
                    )}`}
                    className="group grid gap-3 px-5 py-4 transition hover:bg-[var(--dash-surface-hover)] sm:grid-cols-[minmax(0,1.3fr)_minmax(150px,0.8fr)_auto] sm:items-center sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] text-xs font-black text-[var(--dash-muted)]">
                        {contact.fullName
                          .split(" ")
                          .slice(0, 2)
                          .map(
                            (part) =>
                              part[0],
                          )
                          .join("")}
                      </span>
  
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold transition group-hover:text-[var(--dash-accent)]">
                          {contact.fullName}
                        </p>
  
                        <p className="mt-1 truncate text-xs text-[var(--dash-muted)]">
                          {contact.email}
                        </p>
                      </div>
                    </div>
  
                    <div className="min-w-0 pl-[52px] sm:pl-0">
                      <p className="truncate text-sm font-semibold text-[var(--dash-muted)]">
                        {contact.projectTitle}
                      </p>
  
                      <p className="mt-1 truncate text-xs text-[var(--dash-soft)]">
                        {contact.companyName}
                      </p>
                    </div>
  
                    <div className="flex items-center justify-between gap-3 pl-[52px] sm:justify-end sm:pl-0">
                      <span
                        className={[
                          "rounded-full border px-2.5 py-1 text-[10px] font-bold",
                          statusClasses[
                            contact.status
                          ],
                        ].join(" ")}
                      >
                        {
                          statusLabels[
                            contact.status
                          ]
                        }
                      </span>
  
                      <span className="whitespace-nowrap text-xs text-[var(--dash-soft)]">
                        {formatSubmissionTime(
                          contact.submittedAt,
                        )}
                      </span>
                    </div>
                  </Link>
                ),
              )
              )}
            </div>
  
            <div className="border-t border-[var(--dash-border)] px-5 py-4 sm:px-6">
              <Link
                href="/dashboard/contacts"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-bold text-[var(--dash-accent)] transition hover:brightness-110"
              >
                Open contacts workspace
  
                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </article>
  
          <SubmissionActivityChart
            activity={activity}
            thisWeek={thisWeek}
            statusMix={[
              {
                status: "pending",
                label: "Pending",
                count: pending,
              },
              {
                status: "contacted",
                label: "Contacted",
                count: contacted,
              },
              {
                status: "qualified",
                label: "Qualified",
                count: qualified,
              },
              {
                status: "archived",
                label: "Archived",
                count: archived,
              },
            ]}
          />
        </section>
      </div>
    );
  }