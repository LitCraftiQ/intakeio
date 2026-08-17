"use client";

import {
  Building2,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  FileText,
  Filter,
  Globe2,
  Inbox,
  Mail,
  MessageCircle,
  Phone,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ContactStatus,
  ContactSubmission,
} from "@/lib/dashboard/types";

type ContactsWorkspaceProps = Readonly<{
  contacts: ContactSubmission[];
  initialQuery: string;
  initialContactId: string | null;
}>;

type StatusFilter =
  | "all"
  | ContactStatus;

type SortOption =
  | "newest"
  | "oldest";

const INITIAL_VISIBLE_COUNT = 50;
const LOAD_MORE_COUNT = 50;

const statusLabels: Record<
  ContactStatus,
  string
> = {
  pending: "Pending",
  contacted: "Contacted",
  qualified: "Qualified",
  archived: "Archived",
};

const statusVariables: Record<
  ContactStatus,
  {
    background: string;
    border: string;
    text: string;
  }
> = {
  pending: {
    background:
      "var(--dash-status-pending-bg)",
    border:
      "var(--dash-status-pending-border)",
    text:
      "var(--dash-status-pending-text)",
  },

  contacted: {
    background:
      "var(--dash-status-contacted-bg)",
    border:
      "var(--dash-status-contacted-border)",
    text:
      "var(--dash-status-contacted-text)",
  },

  qualified: {
    background:
      "var(--dash-status-qualified-bg)",
    border:
      "var(--dash-status-qualified-border)",
    text:
      "var(--dash-status-qualified-text)",
  },

  archived: {
    background:
      "var(--dash-status-archived-bg)",
    border:
      "var(--dash-status-archived-border)",
    text:
      "var(--dash-status-archived-text)",
  },
};

function formatSubmittedDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(new Date(value));
}

function formatSubmittedTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) =>
      word[0]?.toUpperCase(),
    )
    .join("");
}

function normalizeWebsite(
  website: string | null,
) {
  if (!website) {
    return null;
  }

  try {
    const parsedUrl = new URL(
      website.startsWith("http://") ||
        website.startsWith("https://")
        ? website
        : `https://${website}`,
    );

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function StatusBadge({
  status,
}: Readonly<{
  status: ContactStatus;
}>) {
  const variables =
    statusVariables[status];

  const style: CSSProperties = {
    backgroundColor:
      variables.background,

    borderColor:
      variables.border,

    color: variables.text,
  };

  return (
    <span
      style={style}
      className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold"
    >
      {statusLabels[status]}
    </span>
  );
}

export function ContactsWorkspace({
  contacts,
  initialQuery,
  initialContactId,
}: ContactsWorkspaceProps) {
  const [query, setQuery] =
    useState(initialQuery);

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>("all");

  const [
    countryFilter,
    setCountryFilter,
  ] = useState("all");

  const [
    sortOption,
    setSortOption,
  ] = useState<SortOption>("newest");

  const [
    visibleCount,
    setVisibleCount,
  ] = useState(
    INITIAL_VISIBLE_COUNT,
  );

  const [
    selectedContactId,
    setSelectedContactId,
  ] = useState<string | null>(
    initialContactId,
  );

  const [
    copiedField,
    setCopiedField,
  ] = useState<string | null>(null);

  const countries = useMemo(
    () =>
      Array.from(
        new Set(
          contacts.map(
            (contact) =>
              contact.country,
          ),
        ),
      ).sort((first, second) =>
        first.localeCompare(second),
      ),
    [contacts],
  );

  const filteredContacts =
    useMemo(() => {
      const normalizedQuery = query
        .trim()
        .toLowerCase();

      const result = contacts.filter(
        (contact) => {
          const matchesQuery =
            !normalizedQuery ||
            [
              contact.fullName,
              contact.email,
              contact.phone,
              contact.telegramUsername ??
                "",
              contact.companyName,
              contact.projectTitle,
              contact.country,
              contact.budget,
            ].some((value) =>
              value
                .toLowerCase()
                .includes(
                  normalizedQuery,
                ),
            );

          const matchesStatus =
            statusFilter === "all" ||
            contact.status ===
              statusFilter;

          const matchesCountry =
            countryFilter === "all" ||
            contact.country ===
              countryFilter;

          return (
            matchesQuery &&
            matchesStatus &&
            matchesCountry
          );
        },
      );

      return [...result].sort(
        (first, second) => {
          const firstTime =
            new Date(
              first.submittedAt,
            ).getTime();

          const secondTime =
            new Date(
              second.submittedAt,
            ).getTime();

          return sortOption ===
            "newest"
            ? secondTime - firstTime
            : firstTime - secondTime;
        },
      );
    }, [
      contacts,
      countryFilter,
      query,
      sortOption,
      statusFilter,
    ]);

  const visibleContacts =
    filteredContacts.slice(
      0,
      visibleCount,
    );

  const selectedContact =
    contacts.find(
      (contact) =>
        contact.id ===
        selectedContactId,
    ) ?? null;

  const selectedWebsite =
    selectedContact
      ? normalizeWebsite(
          selectedContact.website,
        )
      : null;

  const remainingCount = Math.max(
    filteredContacts.length -
      visibleContacts.length,
    0,
  );

  const pendingCount =
    contacts.filter(
      (contact) =>
        contact.status ===
        "pending",
    ).length;

  const qualifiedCount =
    contacts.filter(
      (contact) =>
        contact.status ===
        "qualified",
    ).length;

  const hasActiveFilters =
    query.trim().length > 0 ||
    statusFilter !== "all" ||
    countryFilter !== "all" ||
    sortOption !== "newest";

  useEffect(() => {
    setVisibleCount(
      INITIAL_VISIBLE_COUNT,
    );
  }, [
    query,
    statusFilter,
    countryFilter,
    sortOption,
  ]);

  useEffect(() => {
    if (!selectedContact) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event: globalThis.KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setSelectedContactId(null);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.style.overflow =
        originalOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [selectedContact]);

  async function copyValue(
    field: string,
    value: string,
  ) {
    try {
      await navigator.clipboard.writeText(
        value,
      );

      setCopiedField(field);

      window.setTimeout(() => {
        setCopiedField(null);
      }, 1400);
    } catch {
      setCopiedField(null);
    }
  }

  function handleRowKeyDown(
    event: KeyboardEvent<HTMLElement>,
    contactId: string,
  ) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      setSelectedContactId(
        contactId,
      );
    }
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    setCountryFilter("all");
    setSortOption("newest");
  }

  return (
    <div className="dashboard-page-enter mx-auto w-full max-w-[1540px]">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--dash-border-strong)] bg-[var(--dash-accent-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--dash-accent)]">
            <Inbox
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            Private submissions
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
            Contacts
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--dash-muted)] sm:text-base">
            Review every completed client
            submission without turning your
            workspace into a crowded CRM.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <SummaryCard
            label="Total"
            value={contacts.length}
          />

          <SummaryCard
            label="Pending"
            value={pendingCount}
            status="pending"
          />

          <SummaryCard
            label="Qualified"
            value={qualifiedCount}
            status="qualified"
          />
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[var(--dash-card-shadow)]">
        <div className="border-b border-[var(--dash-border)] p-4 sm:p-5">
          <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_180px_210px_170px_auto]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--dash-soft)]"
                aria-hidden="true"
              />

              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(
                    event.target.value,
                  );
                }}
                maxLength={120}
                placeholder="Search name, email, company, project..."
                className="dashboard-input dashboard-input-search"
              />
            </div>

            <SelectField
              icon={Filter}
              label="Filter by status"
            >
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target
                      .value as StatusFilter,
                  );
                }}
                className="dashboard-input dashboard-input-select appearance-none"
              >
                <option value="all">
                  All statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="contacted">
                  Contacted
                </option>

                <option value="qualified">
                  Qualified
                </option>

                <option value="archived">
                  Archived
                </option>
              </select>
            </SelectField>

            <SelectField
              icon={Globe2}
              label="Filter by country"
            >
              <select
                value={countryFilter}
                onChange={(event) => {
                  setCountryFilter(
                    event.target.value,
                  );
                }}
                className="dashboard-input dashboard-input-select appearance-none "
              >
                <option value="all">
                  All countries
                </option>

                {countries.map(
                  (country) => (
                    <option
                      key={country}
                      value={country}
                    >
                      {country}
                    </option>
                  ),
                )}
              </select>
            </SelectField>

            <SelectField
              icon={SlidersHorizontal}
              label="Sort contacts"
            >
              <select
                value={sortOption}
                onChange={(event) => {
                  setSortOption(
                    event.target
                      .value as SortOption,
                  );
                }}
                className="dashboard-input dashboard-input-select appearance-none "
              >
                <option value="newest">
                  Newest first
                </option>

                <option value="oldest">
                  Oldest first
                </option>
              </select>
            </SelectField>

            <button
              type="button"
              disabled={
                !hasActiveFilters
              }
              onClick={clearFilters}
              className="h-11 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-4 text-sm font-bold text-[var(--dash-muted)] transition hover:border-[var(--dash-border-strong)] hover:text-[var(--dash-text)] disabled:cursor-not-allowed disabled:opacity-35"
            >
              Clear
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[var(--dash-muted)]">
              Showing{" "}
              <strong className="font-bold text-[var(--dash-text)]">
                {
                  visibleContacts.length
                }
              </strong>{" "}
              of{" "}
              <strong className="font-bold text-[var(--dash-text)]">
                {
                  filteredContacts.length
                }
              </strong>{" "}
              matching contacts
            </p>

            <p className="text-xs text-[var(--dash-soft)]">
              Select a submission to view
              all information
            </p>
          </div>
        </div>

        {visibleContacts.length === 0 ? (
          <div className="grid min-h-[400px] place-items-center px-5 py-16 text-center">
            <div className="max-w-sm">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] text-[var(--dash-soft)]">
                <Search
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </span>

              <h2 className="mt-5 text-lg font-bold">
                No matching contacts
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--dash-muted)]">
                Adjust your search or
                filters to find another
                submission.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 min-h-10 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-4 text-sm font-bold text-[var(--dash-muted)]"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[var(--dash-border)] lg:hidden">
              {visibleContacts.map(
                (contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => {
                      setSelectedContactId(
                        contact.id,
                      );
                    }}
                    className="block w-full px-4 py-4 text-left transition hover:bg-[var(--dash-surface-hover)] sm:px-5"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={
                          contact.fullName
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">
                              {
                                contact.fullName
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-[var(--dash-muted)]">
                              {contact.email}
                            </p>
                          </div>

                          <StatusBadge
                            status={
                              contact.status
                            }
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <MobileValue
                            label="Project"
                            value={
                              contact.projectTitle
                            }
                          />

                          <MobileValue
                            label="Budget"
                            value={
                              contact.budget
                            }
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--dash-soft)]">
                          <span className="truncate">
                            {
                              contact.companyName
                            }
                          </span>

                          <span className="shrink-0">
                            {formatSubmittedDate(
                              contact.submittedAt,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ),
              )}
            </div>

            <div className="hidden max-h-[690px] overflow-auto lg:block">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-[var(--dash-popover)] backdrop-blur-xl">
                  <tr className="border-b border-[var(--dash-border)]">
                    {[
                      "Contact",
                      "Company",
                      "Project",
                      "Budget",
                      "Preferred",
                      "Status",
                      "Submitted",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="whitespace-nowrap px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--dash-soft)]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--dash-border)]">
                  {visibleContacts.map(
                    (contact) => (
                      <tr
                        key={contact.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedContactId(
                            contact.id,
                          );
                        }}
                        onKeyDown={(
                          event,
                        ) => {
                          handleRowKeyDown(
                            event,
                            contact.id,
                          );
                        }}
                        className="group cursor-pointer outline-none transition hover:bg-[var(--dash-surface-hover)] focus-visible:bg-[var(--dash-accent-soft)]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-[220px] items-center gap-3">
                            <Avatar
                              name={
                                contact.fullName
                              }
                              compact
                            />

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold group-hover:text-[var(--dash-accent)]">
                                {
                                  contact.fullName
                                }
                              </p>

                              <p className="mt-1 truncate text-xs text-[var(--dash-muted)]">
                                {
                                  contact.email
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-[190px] px-5 py-4">
                          <p className="truncate text-sm font-medium text-[var(--dash-muted)]">
                            {
                              contact.companyName
                            }
                          </p>

                          <p className="mt-1 truncate text-xs text-[var(--dash-soft)]">
                            {contact.country}
                          </p>
                        </td>

                        <td className="max-w-[230px] px-5 py-4">
                          <p className="truncate text-sm font-medium text-[var(--dash-muted)]">
                            {
                              contact.projectTitle
                            }
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-[var(--dash-muted)]">
                          {contact.budget}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-[var(--dash-muted)]">
                          {
                            contact.preferredContactMethod
                          }
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              contact.status
                            }
                          />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="text-xs font-medium text-[var(--dash-muted)]">
                            {formatSubmittedDate(
                              contact.submittedAt,
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-[var(--dash-soft)]">
                            {formatSubmittedTime(
                              contact.submittedAt,
                            )}
                          </p>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--dash-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-[var(--dash-muted)]">
                {remainingCount > 0
                  ? `${remainingCount} more contacts available`
                  : "All matching contacts are visible"}
              </p>

              {remainingCount > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setVisibleCount(
                      (current) =>
                        current +
                        LOAD_MORE_COUNT,
                    );
                  }}
                  className="min-h-10 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-5 text-sm font-bold text-[var(--dash-muted)] transition hover:border-[var(--dash-border-strong)] hover:text-[var(--dash-text)]"
                >
                  Load next{" "}
                  {Math.min(
                    LOAD_MORE_COUNT,
                    remainingCount,
                  )}
                </button>
              ) : null}
            </div>
          </>
        )}
      </section>

      {selectedContact ? (
        <div
          className="fixed inset-0 z-[70]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-drawer-title"
        >
          <button
            type="button"
            aria-label="Close contact details"
            onClick={() => {
              setSelectedContactId(null);
            }}
            className="absolute inset-0 bg-[var(--dash-overlay)] backdrop-blur-sm"
          />

          <aside className="dashboard-drawer-enter absolute inset-y-0 right-0 flex w-full max-w-[620px] flex-col border-l border-[var(--dash-border)] bg-[var(--dash-popover)] text-[var(--dash-text)] shadow-[var(--dash-popover-shadow)]">
            <header className="flex items-start gap-4 border-b border-[var(--dash-border)] px-5 py-5 sm:px-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[var(--dash-border)] bg-gradient-to-br from-violet-500/25 to-cyan-400/15 text-sm font-black text-[var(--dash-accent)]">
                {getInitials(
                  selectedContact.fullName,
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="contact-drawer-title"
                    className="truncate text-xl font-black tracking-[-0.035em]"
                  >
                    {
                      selectedContact.fullName
                    }
                  </h2>

                  <StatusBadge
                    status={
                      selectedContact.status
                    }
                  />
                </div>

                <p className="mt-1 truncate text-sm text-[var(--dash-muted)]">
                  {
                    selectedContact.companyName
                  }
                </p>
              </div>

              <button
                type="button"
                aria-label="Close contact details"
                onClick={() => {
                  setSelectedContactId(null);
                }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-muted)] transition hover:bg-[var(--dash-surface-hover)] hover:text-[var(--dash-text)]"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <section className="grid grid-cols-2 gap-3">
                <CopyButton
                  copied={
                    copiedField === "email"
                  }
                  copiedLabel="Email copied"
                  label="Copy email"
                  onClick={() => {
                    void copyValue(
                      "email",
                      selectedContact.email,
                    );
                  }}
                />

                <CopyButton
                  copied={
                    copiedField === "phone"
                  }
                  copiedLabel="Phone copied"
                  label="Copy phone"
                  onClick={() => {
                    void copyValue(
                      "phone",
                      selectedContact.phone,
                    );
                  }}
                />
              </section>

              <DrawerSection
                title="Contact information"
                icon={UserRound}
                className="mt-5"
              >
                <DetailRow
                  icon={Mail}
                  label="Email address"
                  value={
                    selectedContact.email
                  }
                />

                <DetailRow
                  icon={Phone}
                  label="Phone number"
                  value={
                    selectedContact.phone ||
                    "Not provided"
                  }
                />

                <DetailRow
                  icon={MessageCircle}
                  label="Telegram"
                  value={
                    selectedContact.telegramUsername ??
                    "Not provided"
                  }
                />

                <DetailRow
                  icon={Building2}
                  label="Company"
                  value={
                    selectedContact.companyName ||
                    "Not provided"
                  }
                />

                <DetailRow
                  icon={Globe2}
                  label="Country"
                  value={
                    selectedContact.country ||
                    "Not provided"
                  }
                />

                <div className="flex items-start gap-3">
                  <DetailIcon
                    icon={ExternalLink}
                  />

                  <div className="min-w-0 flex-1">
                    <DetailLabel>
                      Website
                    </DetailLabel>

                    {selectedWebsite ? (
                      <a
                        href={selectedWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm font-bold text-[var(--dash-accent)]"
                      >
                        <span className="truncate">
                          {
                            selectedContact.website
                          }
                        </span>

                        <ExternalLink
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-[var(--dash-muted)]">
                        Not provided
                      </p>
                    )}
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection
                title="Project information"
                icon={FileText}
                className="mt-4"
              >
                <div>
                  <DetailLabel>
                    Project title
                  </DetailLabel>

                  <p className="mt-1.5 text-base font-bold">
                    {selectedContact.projectTitle ||
                      "Not provided"}
                  </p>
                </div>

                <div>
                  <DetailLabel>
                    Description
                  </DetailLabel>

                  <p className="mt-2 text-sm leading-7 text-[var(--dash-muted)]">
                    {selectedContact.projectDescription ||
                      "Not provided"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InformationBox
                    label="Budget"
                    value={
                      selectedContact.budget ||
                      "Not provided"
                    }
                  />

                  <InformationBox
                    label="Contact method"
                    value={
                      selectedContact.preferredContactMethod ||
                      "Not provided"
                    }
                  />
                </div>

                <InformationBox
                  label="Preferred meeting time"
                  value={
                    selectedContact.preferredMeetingTime ||
                    "Not provided"
                  }
                />

                <div>
                  <DetailLabel>
                    Additional information
                  </DetailLabel>

                  <p className="mt-2 text-sm leading-7 text-[var(--dash-muted)]">
                    {selectedContact.additionalInformation ||
                      "Not provided"}
                  </p>
                </div>
              </DrawerSection>

              <section className="mt-4 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 sm:p-5">
                <h3 className="text-sm font-bold">
                  Private notes
                </h3>

                <p className="mt-3 text-sm leading-7 text-[var(--dash-muted)]">
                  {selectedContact.privateNotes ??
                    "No private notes have been added for this submission."}
                </p>
              </section>

              <section className="mt-4 flex flex-col gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 text-xs text-[var(--dash-muted)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <span>
                  Submission received
                </span>

                <span className="font-bold text-[var(--dash-text)]">
                  {formatSubmittedDate(
                    selectedContact.submittedAt,
                  )}{" "}
                  at{" "}
                  {formatSubmittedTime(
                    selectedContact.submittedAt,
                  )}
                </span>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

type SummaryCardProps = Readonly<{
  label: string;
  value: number;
  status?: ContactStatus;
}>;

function SummaryCard({
  label,
  value,
  status,
}: SummaryCardProps) {
  const style: CSSProperties | undefined =
    status
      ? {
          backgroundColor:
            statusVariables[status]
              .background,

          borderColor:
            statusVariables[status]
              .border,

          color:
            statusVariables[status].text,
        }
      : undefined;

  return (
    <div
      style={style}
      className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-3 shadow-[var(--dash-card-shadow)] sm:px-4"
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] opacity-70">
        {label}
      </p>

      <p className="mt-1 text-xl font-black tracking-[-0.04em]">
        {value}
      </p>
    </div>
  );
}

type SelectFieldProps = Readonly<{
    icon: LucideIcon;
    label: string;
    children: ReactNode;
}>;
  
function SelectField({
    icon: Icon,
    label,
    children,
}: SelectFieldProps) {
    return (
      <label className="relative block">
        <span className="sr-only">
          {label}
        </span>
  
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--dash-soft)]"
          aria-hidden="true"
        />
  
        {children}
  
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--dash-soft)]"
          aria-hidden="true"
        />
      </label>
    );
}

function Avatar({
  name,
  compact = false,
}: Readonly<{
  name: string;
  compact?: boolean;
}>) {
  return (
    <span
      className={[
        "grid shrink-0 place-items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] font-black text-[var(--dash-muted)]",
        compact
          ? "h-9 w-9 text-[10px]"
          : "h-11 w-11 text-xs",
      ].join(" ")}
    >
      {getInitials(name)}
    </span>
  );
}

function MobileValue({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--dash-soft)]">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-medium text-[var(--dash-muted)]">
        {value}
      </p>
    </div>
  );
}

function CopyButton({
  copied,
  copiedLabel,
  label,
  onClick,
}: Readonly<{
  copied: boolean;
  copiedLabel: string;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-sm font-bold text-[var(--dash-muted)] transition hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-surface-hover)] hover:text-[var(--dash-text)]"
    >
      {copied ? (
        <Check
          className="h-4 w-4 text-emerald-500"
          aria-hidden="true"
        />
      ) : (
        <Copy
          className="h-4 w-4"
          aria-hidden="true"
        />
      )}

      {copied ? copiedLabel : label}
    </button>
  );
}

type DrawerSectionProps = Readonly<{
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}>;

function DrawerSection({
  title,
  icon: Icon,
  children,
  className = "",
}: DrawerSectionProps) {
  return (
    <section
      className={[
        "rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 sm:p-5",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <Icon
          className="h-[18px] w-[18px] text-[var(--dash-accent)]"
          aria-hidden="true"
        />

        <h3 className="text-sm font-bold">
          {title}
        </h3>
      </div>

      <div className="mt-5 space-y-4">
        {children}
      </div>
    </section>
  );
}

function DetailIcon({
  icon: Icon,
}: Readonly<{
  icon: LucideIcon;
}>) {
  return (
    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--dash-surface-strong)] text-[var(--dash-muted)]">
      <Icon
        className="h-4 w-4"
        aria-hidden="true"
      />
    </span>
  );
}

function DetailLabel({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--dash-soft)]">
      {children}
    </p>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: Readonly<{
  icon: LucideIcon;
  label: string;
  value: string;
}>) {
  return (
    <div className="flex items-start gap-3">
      <DetailIcon icon={icon} />

      <div className="min-w-0 flex-1">
        <DetailLabel>
          {label}
        </DetailLabel>

        <p className="mt-1 break-words text-sm text-[var(--dash-muted)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function InformationBox({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] p-3.5">
      <DetailLabel>
        {label}
      </DetailLabel>

      <p className="mt-1.5 text-sm font-bold text-[var(--dash-text)]">
        {value}
      </p>
    </div>
  );
}