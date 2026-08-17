"use client";

import {
  Check,
  ChevronDown,
  Copy,
  Globe2,
  Link2,
  Mail,
  MessageCircle,
  Music2,
  Pencil,
  Phone,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa6";
import {
  type ElementType,
  type ReactNode,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  deleteSharePageAction,
  saveSharePageAction,
} from "@/app/(admin)/dashboard/share-page-actions";
import {
  PublicShareLink,
  type ShareLinkIconName,
} from "@/components/share-pages/public-share-link";
import type {
  ShareLinkPlatform,
  SharePage,
  SharePageInput,
  SharePageStatus,
  SharePageTheme,
} from "@/lib/share-pages/types";
import {
  createPhoneHref,
  normalizeShareLinkUrl,
  sanitizePhoneInput,
  whatsAppNumberHint,
} from "@/lib/share-pages/validation";

type OptionalField =
  | "internalName"
  | "introduction";

type DraftLink = {
  id: string;
  platform: ShareLinkPlatform;
  url: string;
};

type Draft = {
  id: string | null;

  displayName: string;
  slug: string;

  email: string;
  phone: string;

  internalName: string;
  introduction: string;

  optionalFields: OptionalField[];

  status: SharePageStatus;
  theme: SharePageTheme;

  links: DraftLink[];
};

type PlatformOption = Readonly<{
  value: ShareLinkPlatform;
  icon: ElementType;
}>;

type PreviewLink = Readonly<{
  id: string;
  label: string;
  href: string;
  copyValue: string;
  icon: ShareLinkIconName;
}>;

type SharePageStudioClientProps =
  Readonly<{
    initialPages: SharePage[];
    loadError?: string | null;
    publicUserId: string;
    appUrl: string;
  }>;

const platformOptions: PlatformOption[] = [
  {
    value: "Instagram",
    icon: FaInstagram,
  },
  {
    value: "Facebook",
    icon: FaFacebookF,
  },
  {
    value: "LinkedIn",
    icon: FaLinkedin,
  },
  {
    value: "TikTok",
    icon: Music2,
  },
  {
    value: "YouTube",
    icon: FaYoutube,
  },
  {
    value: "Telegram",
    icon: Send,
  },
  {
    value: "WhatsApp",
    icon: MessageCircle,
  },
  {
    value: "Website",
    icon: Globe2,
  },
  {
    value: "Custom",
    icon: Link2,
  },
];

const previewThemeClasses: Record<
  SharePageTheme,
  string
> = {
  aurora:
    "from-[#7468ff] via-[#8f6ee8] to-[#30b9c4]",

  ocean:
    "from-[#087ca7] via-[#1398a5] to-[#53c6b3]",

  plum:
    "from-[#713a8f] via-[#9b4f88] to-[#df7e8b]",
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function createEmptyDraft(): Draft {
  return {
    id: null,

    displayName: "",
    slug: "",

    email: "",
    phone: "",

    internalName: "",
    introduction: "",

    optionalFields: [],

    status: "draft",
    theme: "aurora",

    links: [],
  };
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function toDraft(page: SharePage): Draft {
  const optionalFields: OptionalField[] = [];

  if (page.internalName !== null) {
    optionalFields.push(
      "internalName",
    );
  }

  if (page.introduction !== null) {
    optionalFields.push(
      "introduction",
    );
  }

  return {
    id: page.id,

    displayName:
      page.displayName,

    slug: page.slug,

    email:
      page.email ?? "",

    phone:
      page.phone ?? "",

    internalName:
      page.internalName ?? "",

    introduction:
      page.introduction ?? "",

    optionalFields,

    status: page.status,
    theme: page.theme,

    links: page.links.map(
      (link) => ({
        id: link.id,
        platform:
          link.platform,
        url: link.url,
      }),
    ),
  };
}

function getInitials(value: string) {
  const initials = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (word) =>
        word[0]?.toUpperCase(),
    )
    .join("");

  return initials || "SP";
}

function getPlatformIcon(
  platform: ShareLinkPlatform,
) {
  return (
    platformOptions.find(
      (option) =>
        option.value === platform,
    )?.icon ?? Link2
  );
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  ).format(new Date(value));
}

export function SharePageStudioClient({
    initialPages,
    loadError = null,
    publicUserId,
    appUrl,
  }: SharePageStudioClientProps) {
  const [
    pages,
    setPages,
  ] = useState(initialPages);

  const [
    draft,
    setDraft,
  ] = useState<Draft>(
    createEmptyDraft,
  );

  const [
    expandedPageId,
    setExpandedPageId,
  ] = useState<string | null>(
    null,
  );

  const [
    copiedPageId,
    setCopiedPageId,
  ] = useState<string | null>(
    null,
  );

  const [
    deleteCandidateId,
    setDeleteCandidateId,
  ] = useState<string | null>(
    null,
  );

  const [
    message,
    setMessage,
  ] = useState(loadError ?? "");

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const normalizedAppUrl =
    appUrl.replace(/\/+$/, "");

  const publicUrl = useMemo(
    () =>
      `${normalizedAppUrl}/${publicUserId}/${
        draft.slug || "your-page"
      }`,
    [
      draft.slug,
      normalizedAppUrl,
      publicUserId,
    ],
  );

  const previewLinks =
    useMemo<PreviewLink[]>(() => {
      const result: PreviewLink[] = [];

      if (draft.email.trim()) {
        result.push({
          id: "preview-email",
          label: "Email",
          href: `mailto:${draft.email.trim()}`,
          copyValue: draft.email.trim(),
          icon: "Email",
        });
      }

      if (draft.phone.trim()) {
        result.push({
          id: "preview-phone",
          label: "Phone",
          href: createPhoneHref(
            draft.phone,
          ),
          copyValue: draft.phone.trim(),
          icon: "Phone",
        });
      }

      draft.links.forEach(
        (link) => {
          if (!link.url.trim()) {
            return;
          }

          const href =
            normalizeShareLinkUrl(
              link.platform,
              link.url,
            );

          result.push({
            id: link.id,
            label: link.platform,
            href,
            copyValue: href,
            icon: link.platform,
          });
        },
      );

      return result;
    }, [draft]);

  function updateDraft<
    Key extends keyof Draft,
  >(
    key: Key,
    value: Draft[Key],
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage("");
  }

  function clearFields() {
    setDraft(createEmptyDraft());
    setExpandedPageId(null);
    setDeleteCandidateId(null);
    setMessage("");
  }

  function addOptionalField(
    field: OptionalField,
  ) {
    if (
      draft.optionalFields.includes(
        field,
      )
    ) {
      return;
    }

    updateDraft(
      "optionalFields",
      [
        ...draft.optionalFields,
        field,
      ],
    );
  }

  function removeOptionalField(
    field: OptionalField,
  ) {
    setDraft((current) => ({
      ...current,

      internalName:
        field === "internalName"
          ? ""
          : current.internalName,

      introduction:
        field === "introduction"
          ? ""
          : current.introduction,

      optionalFields:
        current.optionalFields.filter(
          (value) =>
            value !== field,
        ),
    }));
  }

  function addSocialLink() {
    if (draft.links.length >= 12) {
      setMessage(
        "A Share Page can contain up to 12 links.",
      );

      return;
    }

    updateDraft("links", [
      ...draft.links,
      {
        id: createId("link"),
        platform: "Instagram",
        url: "",
      },
    ]);
  }

  function updateSocialLink(
    id: string,
    changes: Partial<DraftLink>,
  ) {
    updateDraft(
      "links",
      draft.links.map((link) =>
        link.id === id
          ? {
              ...link,
              ...changes,
            }
          : link,
      ),
    );
  }

  function removeSocialLink(
    id: string,
  ) {
    updateDraft(
      "links",
      draft.links.filter(
        (link) => link.id !== id,
      ),
    );
  }

  function editPage(
    page: SharePage,
  ) {
    setDraft(toDraft(page));
    setExpandedPageId(page.id);
    setDeleteCandidateId(null);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function savePage() {
    const input: SharePageInput = {
      id: draft.id,

      displayName:
        draft.displayName,

      slug:
        normalizeSlug(draft.slug),

      email: draft.email,
      phone: draft.phone,

      internalName:
        draft.optionalFields.includes(
          "internalName",
        )
          ? draft.internalName
          : "",

      introduction:
        draft.optionalFields.includes(
          "introduction",
        )
          ? draft.introduction
          : "",

      status: draft.status,
      theme: draft.theme,

      links: draft.links
        .filter(
          (link) =>
            link.url.trim().length >
            0,
        )
        .map((link) => ({
          platform:
            link.platform,

          url: normalizeShareLinkUrl(
            link.platform,
            link.url,
          ),
        })),
    };

    startTransition(async () => {
      const result =
        await saveSharePageAction(
          input,
        );

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      setPages((current) => {
        const exists =
          current.some(
            (page) =>
              page.id ===
              result.page.id,
          );

        if (exists) {
          return current
            .map((page) =>
              page.id ===
              result.page.id
                ? result.page
                : page,
            )
            .sort(
              (first, second) =>
                new Date(
                  second.updatedAt,
                ).getTime() -
                new Date(
                  first.updatedAt,
                ).getTime(),
            );
        }

        return [
          result.page,
          ...current,
        ];
      });

      setDraft(
        toDraft(result.page),
      );

      setExpandedPageId(
        result.page.id,
      );

      setMessage(
        "Share Page saved.",
      );
    });
  }

  function deletePage(
    page: SharePage,
  ) {
    startTransition(async () => {
      const result =
        await deleteSharePageAction(
          page.id,
        );

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      setPages((current) =>
        current.filter(
          (item) =>
            item.id !== result.id,
        ),
      );

      if (
        draft.id === result.id
      ) {
        setDraft(
          createEmptyDraft(),
        );
      }

      setExpandedPageId(null);
      setDeleteCandidateId(null);

      setMessage(
        "Share Page permanently deleted. Its public link is no longer available.",
      );
    });
  }

  async function copyPublicLink(
    page: SharePage,
  ) {
    try {
        await navigator.clipboard.writeText(
          `${window.location.origin}/${publicUserId}/${page.slug}`,
        );

      setCopiedPageId(page.id);

      window.setTimeout(() => {
        setCopiedPageId(null);
      }, 1400);
    } catch {
      setCopiedPageId(null);
    }
  }

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[var(--dash-card-shadow)]">
      <header className="flex items-center justify-between gap-4 border-b border-[var(--dash-border)] px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-accent)]">
            <Sparkles
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            Share Page Studio
          </div>

          <h2 className="mt-1 truncate text-base font-bold tracking-[-0.03em]">
            Create a share page
          </h2>
        </div>

        <button
          type="button"
          onClick={clearFields}
          disabled={isPending}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-2.5 text-[10px] font-bold text-[var(--dash-muted)] transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-500 disabled:opacity-50"
        >
          <Trash2
            className="h-3 w-3"
            aria-hidden="true"
          />

          Clear
        </button>
      </header>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_270px]">
        <div className="border-b border-[var(--dash-border)] p-4 xl:border-b-0 xl:border-r">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Public display name"
              icon={UserRound}
            >
              <input
                type="text"
                value={draft.displayName}
                onChange={(event) => {
                  updateDraft(
                    "displayName",
                    event.target.value.slice(
                      0,
                      80,
                    ),
                  );
                }}
                maxLength={80}
                placeholder="Your name or company"
                className="dashboard-input"
              />
            </Field>

            <Field
            label="Public URL"
            icon={Globe2}
            >
            <input
                type="text"
                value={draft.slug}
                onChange={(event) => {
                updateDraft(
                    "slug",
                    normalizeSlug(
                    event.target.value,
                    ),
                );
                }}
                maxLength={60}
                placeholder="demrick"
                className="dashboard-input"
            />

            <p className="mt-1.5 break-all text-[8px] leading-4 text-[var(--dash-soft)]">
                {publicUrl}
            </p>
            </Field>

            <Field
              label="Email"
              icon={Mail}
            >
              <input
                type="email"
                value={draft.email}
                onChange={(event) => {
                  updateDraft(
                    "email",
                    event.target.value.slice(
                      0,
                      320,
                    ),
                  );
                }}
                maxLength={320}
                placeholder=""
                className="dashboard-input"
              />
            </Field>

            <Field
              label="Phone"
              icon={Phone}
            >
              <input
                type="tel"
                inputMode="tel"
                value={draft.phone}
                onChange={(event) => {
                  updateDraft(
                    "phone",
                    sanitizePhoneInput(
                      event.target.value,
                    ),
                  );
                }}
                maxLength={16}
                className="dashboard-input"
              />
            </Field>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold text-[var(--dash-muted)]">
              Optional:
            </span>

            {!draft.optionalFields.includes(
              "internalName",
            ) ? (
              <SmallAddButton
                label="Internal page name"
                onClick={() => {
                  addOptionalField(
                    "internalName",
                  );
                }}
              />
            ) : null}

            {!draft.optionalFields.includes(
              "introduction",
            ) ? (
              <SmallAddButton
                label="Short introduction"
                onClick={() => {
                  addOptionalField(
                    "introduction",
                  );
                }}
              />
            ) : null}
          </div>

          {draft.optionalFields.includes(
            "internalName",
          ) ? (
            <OptionalFieldRow
              label="Internal page name"
              onRemove={() => {
                removeOptionalField(
                  "internalName",
                );
              }}
            >
              <input
                type="text"
                value={draft.internalName}
                onChange={(event) => {
                  updateDraft(
                    "internalName",
                    event.target.value.slice(
                      0,
                      80,
                    ),
                  );
                }}
                maxLength={80}
                placeholder="Only visible to you"
                className="dashboard-input"
              />
            </OptionalFieldRow>
          ) : null}

          {draft.optionalFields.includes(
            "introduction",
          ) ? (
            <OptionalFieldRow
              label="Short introduction"
              onRemove={() => {
                removeOptionalField(
                  "introduction",
                );
              }}
            >
              <textarea
                value={draft.introduction}
                onChange={(event) => {
                  updateDraft(
                    "introduction",
                    event.target.value.slice(
                      0,
                      180,
                    ),
                  );
                }}
                maxLength={180}
                rows={2}
                placeholder="Optional public introduction"
                className="dashboard-input min-h-[68px] resize-none py-2.5"
              />
            </OptionalFieldRow>
          ) : null}

          <div className="mt-4 border-t border-[var(--dash-border)] pt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold">
                  Additional social links
                </h3>

                <p className="text-[9px] text-[var(--dash-muted)]">
                  Add only the platforms you need.
                </p>
              </div>

              <button
                type="button"
                onClick={addSocialLink}
                disabled={
                  isPending ||
                  draft.links.length >= 12
                }
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-2.5 text-[10px] font-bold disabled:opacity-40"
              >
                <Plus className="h-3 w-3" />
                Add link
              </button>
            </div>

            {draft.links.length > 0 ? (
              <>
              <div className="dashboard-scrollbar mt-3 max-h-[138px] space-y-2 overflow-y-auto pr-1">
                {draft.links.map(
                  (link) => (
                    <div
                      key={link.id}
                      className="grid gap-2 sm:grid-cols-[135px_minmax(0,1fr)_38px]"
                    >
                      <div className="relative">
                        <select
                          value={
                            link.platform
                          }
                          onChange={(
                            event,
                          ) => {
                            updateSocialLink(
                              link.id,
                              {
                                platform:
                                  event.target
                                    .value as ShareLinkPlatform,
                              },
                            );
                          }}
                          className="dashboard-input appearance-none pr-8"
                        >
                          {platformOptions.map(
                            (option) => (
                              <option
                                key={
                                  option.value
                                }
                                value={
                                  option.value
                                }
                              >
                                {
                                  option.value
                                }
                              </option>
                            ),
                          )}
                        </select>

                        <ChevronDown
                          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--dash-soft)]"
                          aria-hidden="true"
                        />
                      </div>

                      <input
                        type="text"
                        inputMode={
                          link.platform ===
                          "WhatsApp"
                            ? "tel"
                            : "url"
                        }
                        value={link.url}
                        onChange={(
                          event,
                        ) => {
                          updateSocialLink(
                            link.id,
                            {
                              url:
                                event.target.value.slice(
                                  0,
                                  500,
                                ),
                            },
                          );
                        }}
                        maxLength={500}
                        placeholder={
                          link.platform ===
                          "WhatsApp"
                            ? "447911123456 or +44 7911 123456"
                            : ""
                        }
                        className="dashboard-input"
                      />

                      <button
                        type="button"
                        aria-label={`Remove ${link.platform}`}
                        onClick={() => {
                          removeSocialLink(
                            link.id,
                          );
                        }}
                        className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-soft)] hover:bg-rose-400/10 hover:text-rose-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ),
                )}
              </div>

              {draft.links.some(
                (link) =>
                  link.platform ===
                  "WhatsApp",
              ) ? (
                <p className="mt-2 rounded-lg border border-[var(--dash-accent)]/20 bg-[var(--dash-accent-soft)] px-3 py-2 text-[10px] leading-4 text-[var(--dash-accent)]">
                  {whatsAppNumberHint}
                </p>
              ) : null}
              </>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-[var(--dash-border)] py-2.5 text-center text-[9px] text-[var(--dash-muted)]">
                No social links added.
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_150px] sm:items-end">
            <div>
              <p className="text-[9px] font-bold text-[var(--dash-muted)]">
                Style
              </p>

              <div className="mt-1 grid grid-cols-3 gap-1.5">
                {(
                  [
                    "aurora",
                    "ocean",
                    "plum",
                  ] as const
                ).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => {
                      updateDraft(
                        "theme",
                        theme,
                      );
                    }}
                    className={[
                      "rounded-lg border p-1.5",
                      draft.theme === theme
                        ? "border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]"
                        : "border-[var(--dash-border)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "block h-4 rounded bg-gradient-to-r",
                        previewThemeClasses[
                          theme
                        ],
                      ].join(" ")}
                    />

                    <span className="mt-1 block text-[7px] font-bold capitalize text-[var(--dash-muted)]">
                      {theme}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <label>
              <span className="mb-1 block text-[9px] font-bold text-[var(--dash-muted)]">
                Status
              </span>

              <div className="relative">
                <select
                  value={draft.status}
                  onChange={(event) => {
                    updateDraft(
                      "status",
                      event.target
                        .value as SharePageStatus,
                    );
                  }}
                  className="dashboard-input appearance-none pr-8"
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>
                </select>

                <ChevronDown
                  className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--dash-soft)]"
                  aria-hidden="true"
                />
              </div>
            </label>

            <button
              type="button"
              onClick={savePage}
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--dash-accent)] px-3 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-60"
            >
              <Save className="h-4 w-4" />

              {isPending
                ? "Saving..."
                : draft.id
                  ? "Save changes"
                  : "Save page"}
            </button>
          </div>

          {message ? (
            <p
              role="status"
              className={[
                "mt-3 rounded-lg border px-3 py-2 text-[10px]",
                message.includes(
                  "saved",
                ) ||
                message.includes(
                  "deleted",
                )
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600"
                  : "border-rose-400/20 bg-rose-400/10 text-rose-500",
              ].join(" ")}
            >
              {message}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-center bg-[var(--dash-preview-area)] p-3">
          <div className="w-full max-w-[230px]">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[var(--dash-soft)]">
                Preview
              </p>

              <span className="rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-1.5 py-0.5 text-[7px] font-bold capitalize text-[var(--dash-muted)]">
                {draft.status}
              </span>
            </div>

            <div
              className={[
                "relative overflow-hidden rounded-[22px] bg-gradient-to-br p-px shadow-xl",
                previewThemeClasses[
                  draft.theme
                ],
              ].join(" ")}
            >
              <div className="min-h-[285px] rounded-[21px] bg-[#f5f6ff]/95 px-3 py-4 text-[#1b2140]">
                <span
                  className={[
                    "mx-auto grid h-12 w-12 place-items-center rounded-[15px] bg-gradient-to-br text-sm font-black text-white",
                    previewThemeClasses[
                      draft.theme
                    ],
                  ].join(" ")}
                >
                  {getInitials(
                    draft.displayName,
                  )}
                </span>

                <h3 className="mt-2.5 truncate text-center text-base font-black">
                  {draft.displayName ||
                    "Your public name"}
                </h3>

                {draft.optionalFields.includes(
                  "introduction",
                ) &&
                draft.introduction.trim() ? (
                  <p className="mt-1 line-clamp-2 text-center text-[9px] leading-4 text-[#6f7893]">
                    {draft.introduction}
                  </p>
                ) : null}

                <div className="mt-3 space-y-1.5">
                  {previewLinks
                    .slice(0, 5)
                    .map((link) => (
                      <PublicShareLink
                        key={link.id}
                        href={link.href}
                        label={link.label}
                        copyValue={
                          link.copyValue
                        }
                        icon={link.icon}
                        external={
                          link.id !==
                            "preview-email" &&
                          link.id !==
                            "preview-phone"
                        }
                        compact
                      />
                    ))}

                  {previewLinks.length ===
                  0 ? (
                    <div className="rounded-lg border border-dashed border-[#cfd6e9] px-3 py-4 text-center text-[9px] text-[#8a93ab]">
                      Add contact or social links.
                    </div>
                  ) : null}
                </div>

                <p className="mt-3 truncate text-center text-[7px] font-bold uppercase tracking-[0.08em] text-[#a0a8bc]">
                  {publicUrl}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--dash-border)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold">
              Your Share Pages
            </h3>

            <p className="text-[8px] text-[var(--dash-muted)]">
              Select a page to manage it.
            </p>
          </div>

          <span className="rounded-md border border-[var(--dash-border)] px-2 py-0.5 text-[8px] font-bold text-[var(--dash-muted)]">
            {pages.length}
          </span>
        </div>

        <div className="dashboard-scrollbar mt-2 max-h-[150px] space-y-1.5 overflow-y-auto pr-1">
          {pages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--dash-border)] py-4 text-center text-[9px] text-[var(--dash-muted)]">
              {loadError
                ? "Share Pages could not be loaded."
                : "Your saved pages will appear here."}
            </div>
          ) : null}

          {pages.map((page) => {
            const expanded =
              expandedPageId === page.id;

            const deleting =
              deleteCandidateId === page.id;

            return (
              <article
                key={page.id}
                className="overflow-hidden rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-strong)]"
              >
                <button
                  type="button"
                  onClick={() => {
                    setExpandedPageId(
                      expanded
                        ? null
                        : page.id,
                    );

                    setDeleteCandidateId(
                      null,
                    );
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-2 text-left"
                >
                  <span
                    className={[
                      "grid h-7 w-7 shrink-0 place-items-center rounded-md bg-gradient-to-br text-[8px] font-black text-white",
                      previewThemeClasses[
                        page.theme
                      ],
                    ].join(" ")}
                  >
                    {getInitials(
                      page.displayName,
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[10px] font-bold">
                        {page.internalName ||
                          page.displayName}
                      </p>

                      <span className="rounded-full border border-[var(--dash-border)] px-1.5 py-0.5 text-[6px] font-bold uppercase text-[var(--dash-muted)]">
                        {page.status}
                      </span>
                    </div>

                    <p className="truncate text-[8px] text-[var(--dash-muted)]">
                      /{publicUserId}/{page.slug}
                    </p>
                  </div>

                  <span className="hidden text-[7px] text-[var(--dash-soft)] sm:block">
                    {formatUpdatedAt(
                      page.updatedAt,
                    )}
                  </span>

                  <ChevronDown
                    className={[
                      "h-3 w-3 text-[var(--dash-soft)] transition-transform",
                      expanded
                        ? "rotate-180"
                        : "",
                    ].join(" ")}
                  />
                </button>

                {expanded ? (
                  <div className="border-t border-[var(--dash-border)] px-2.5 py-2">
                    {deleting ? (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[9px] font-semibold text-rose-500">
                          Delete permanently?
                        </p>

                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteCandidateId(
                                null,
                              );
                            }}
                            className="h-7 rounded-md border border-[var(--dash-border)] px-2 text-[8px] font-bold"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              deletePage(
                                page,
                              );
                            }}
                            disabled={
                              isPending
                            }
                            className="h-7 rounded-md bg-rose-500 px-2 text-[8px] font-bold text-white disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1">
                          {page.links
                            .slice(0, 4)
                            .map((link) => (
                              <span
                                key={link.id}
                                className="rounded border border-[var(--dash-border)] px-1.5 py-0.5 text-[7px] font-bold text-[var(--dash-muted)]"
                              >
                                {link.platform}
                              </span>
                            ))}
                        </div>

                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              void copyPublicLink(
                                page,
                              );
                            }}
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-[var(--dash-border)] px-2 text-[8px] font-bold"
                          >
                            {copiedPageId ===
                            page.id ? (
                              <Check className="h-2.5 w-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-2.5 w-2.5" />
                            )}

                            Copy
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              editPage(page);
                            }}
                            className="inline-flex h-7 items-center gap-1 rounded-md bg-[var(--dash-accent)] px-2 text-[8px] font-bold text-white"
                          >
                            <Pencil className="h-2.5 w-2.5" />
                            Edit
                          </button>

                          <button
                            type="button"
                            aria-label="Delete Share Page"
                            onClick={() => {
                              setDeleteCandidateId(
                                page.id,
                              );
                            }}
                            className="grid h-7 w-7 place-items-center rounded-md border border-rose-400/20 text-rose-500"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: Readonly<{
  label: string;
  icon: LucideIcon;
  children: ReactNode;
}>) {
  return (
    <label>
      <span className="mb-1 flex items-center gap-1.5 text-[9px] font-bold text-[var(--dash-muted)]">
        <Icon className="h-3 w-3 text-[var(--dash-accent)]" />
        {label}
      </span>

      {children}
    </label>
  );
}

function SmallAddButton({
  label,
  onClick,
}: Readonly<{
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-7 items-center gap-1 rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-2 text-[8px] font-bold text-[var(--dash-muted)]"
    >
      <Plus className="h-2.5 w-2.5" />
      {label}
    </button>
  );
}

function OptionalFieldRow({
  label,
  children,
  onRemove,
}: Readonly<{
  label: string;
  children: ReactNode;
  onRemove: () => void;
}>) {
  return (
    <div className="mt-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] p-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[9px] font-bold text-[var(--dash-muted)]">
          {label}
        </p>

        <button
          type="button"
          onClick={onRemove}
          className="grid h-5 w-5 place-items-center rounded text-[var(--dash-soft)] hover:text-rose-500"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {children}
    </div>
  );
}