import type {
  SharePage,
  SharePageTheme,
} from "@/lib/share-pages/types";
import {
  createPhoneHref,
} from "@/lib/share-pages/validation";

import {
  PublicShareLink,
} from "./public-share-link";

const themeClasses: Record<
  SharePageTheme,
  Readonly<{
    background: string;
    avatar: string;
    glow: string;
    button: string;
  }>
> = {
  aurora: {
    background:
      "from-[#e9e7ff] via-[#eef2ff] to-[#daf7f5]",

    avatar:
      "from-[#6f63ee] via-[#886ee4] to-[#24aab7]",

    glow:
      "bg-[#7c6df2]",

    button:
      "hover:border-[#8377ec]/35 hover:bg-[#f4f2ff]",
  },

  ocean: {
    background:
      "from-[#dff4f8] via-[#eef8fb] to-[#ddf7ee]",

    avatar:
      "from-[#087ca7] via-[#1398a5] to-[#53c6b3]",

    glow:
      "bg-[#1398a5]",

    button:
      "hover:border-[#1398a5]/35 hover:bg-[#ecfbfb]",
  },

  plum: {
    background:
      "from-[#f3e6f6] via-[#fff0f4] to-[#f8e8ed]",

    avatar:
      "from-[#713a8f] via-[#9b4f88] to-[#df7e8b]",

    glow:
      "bg-[#9b4f88]",

    button:
      "hover:border-[#9b4f88]/35 hover:bg-[#fff1f7]",
  },
};

function getInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (word) =>
        word[0]?.toUpperCase(),
    )
    .join("");
}

export function PublicSharePage({
  page,
}: Readonly<{
  page: SharePage;
}>) {
  const theme =
    themeClasses[page.theme];

  return (
    <div
      className={[
        "relative flex min-h-[100svh] items-stretch justify-center overflow-x-hidden bg-gradient-to-br px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] text-[#1d2742] sm:items-center sm:px-6 sm:py-8 md:px-8 md:py-10 lg:py-12",
        theme.background,
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-[70px] sm:-left-24 sm:-top-24 sm:h-72 sm:w-72 sm:blur-[90px]",
          theme.glow,
        ].join(" ")}
      />

      <div
        className={[
          "pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full opacity-15 blur-[70px] sm:-bottom-24 sm:-right-24 sm:h-72 sm:w-72 sm:blur-[90px]",
          theme.glow,
        ].join(" ")}
      />

      <section className="relative my-auto w-full max-w-[min(100%,22.5rem)] sm:max-w-md md:max-w-lg">
        <div className="rounded-[22px] border border-white/70 bg-white/68 p-3 shadow-[0_34px_110px_-45px_rgba(47,58,99,0.38)] backdrop-blur-2xl sm:rounded-[32px] sm:p-5 md:p-6">
          <div className="rounded-[18px] border border-[#dbe2f1]/80 bg-white/78 px-4 py-6 sm:rounded-[26px] sm:px-7 sm:py-9 md:px-8 md:py-10">
            <span
              className={[
                "mx-auto grid h-16 w-16 place-items-center rounded-[18px] bg-gradient-to-br text-lg font-black text-white shadow-[0_20px_45px_-20px_rgba(58,63,116,0.65)] sm:h-20 sm:w-20 sm:rounded-[24px] sm:text-xl md:h-24 md:w-24 md:text-2xl",
                theme.avatar,
              ].join(" ")}
            >
              {getInitials(
                page.displayName,
              )}
            </span>

            <h1 className="mt-4 break-words text-center text-2xl font-black tracking-[-0.055em] sm:mt-5 sm:text-3xl md:text-4xl">
              {page.displayName}
            </h1>

            {page.introduction ? (
              <p className="mx-auto mt-2 max-w-sm text-center text-[13px] leading-5 text-[#68738c] sm:mt-3 sm:text-sm sm:leading-6">
                {page.introduction}
              </p>
            ) : null}

            <div className="mt-5 space-y-2 sm:mt-7 sm:space-y-2.5">
              {page.email ? (
                <PublicShareLink
                  href={`mailto:${page.email}`}
                  label="Email"
                  copyValue={page.email}
                  icon="Email"
                  themeClass={
                    theme.button
                  }
                />
              ) : null}

              {page.phone &&
              createPhoneHref(
                page.phone,
              ) ? (
                <PublicShareLink
                  href={createPhoneHref(
                    page.phone,
                  )}
                  label="Phone"
                  copyValue={page.phone}
                  icon="Phone"
                  themeClass={
                    theme.button
                  }
                />
              ) : null}

              {page.links.map(
                (link) => (
                  <PublicShareLink
                    key={link.id}
                    href={link.url}
                    label={
                      link.platform
                    }
                    copyValue={link.url}
                    icon={link.platform}
                    external
                    themeClass={
                      theme.button
                    }
                  />
                ),
              )}

              {!page.email &&
              !page.phone &&
              page.links.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d5ddeb] px-4 py-6 text-center text-[13px] text-[#8490a8] sm:rounded-2xl sm:px-5 sm:py-8 sm:text-sm">
                  No public details currently available.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
