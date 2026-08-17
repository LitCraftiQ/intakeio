"use client";

import {
  ShieldCheck,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  verifySharePageAccessAction,
} from "@/app/(web)/[publicUserId]/[slug]/actions";
import type {
  SharePageTheme,
} from "@/lib/share-pages/types";

import {
  GoBackButton,
} from "./go-back-button";

const themeClasses: Record<
  SharePageTheme,
  Readonly<{
    background: string;
    avatar: string;
    glow: string;
  }>
> = {
  aurora: {
    background:
      "from-[#e9e7ff] via-[#eef2ff] to-[#daf7f5]",
    avatar:
      "from-[#6f63ee] via-[#886ee4] to-[#24aab7]",
    glow: "bg-[#7c6df2]",
  },
  ocean: {
    background:
      "from-[#dff4f8] via-[#eef8fb] to-[#ddf7ee]",
    avatar:
      "from-[#087ca7] via-[#1398a5] to-[#53c6b3]",
    glow: "bg-[#1398a5]",
  },
  plum: {
    background:
      "from-[#f3e6f6] via-[#fff0f4] to-[#f8e8ed]",
    avatar:
      "from-[#713a8f] via-[#9b4f88] to-[#df7e8b]",
    glow: "bg-[#9b4f88]",
  },
};

type Grecaptcha = {
  ready: (callback: () => void) => void;
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => number;
  getResponse: (widgetId?: number) => string;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

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

function loadRecaptchaScript() {
  if (window.grecaptcha?.ready) {
    return Promise.resolve();
  }

  return new Promise<void>(
    (resolve, reject) => {
      const existing =
        document.querySelector(
          "script[data-share-recaptcha]",
        );

      if (existing) {
        existing.addEventListener(
          "load",
          () => {
            resolve();
          },
        );
        existing.addEventListener(
          "error",
          () => {
            reject(
              new Error(
                "Failed to load reCAPTCHA.",
              ),
            );
          },
        );
        return;
      }

      const script =
        document.createElement(
          "script",
        );

      script.src =
        "https://www.google.com/recaptcha/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.shareRecaptcha =
        "true";
      script.onload = () => {
        resolve();
      };
      script.onerror = () => {
        reject(
          new Error(
            "Failed to load reCAPTCHA.",
          ),
        );
      };

      document.head.appendChild(
        script,
      );
    },
  );
}

export function SharePageGate({
  publicUserId,
  slug,
  displayName,
  theme,
  siteKey,
}: Readonly<{
  publicUserId: string;
  slug: string;
  displayName: string;
  theme: SharePageTheme;
  siteKey: string;
}>) {
  const widgetRef =
    useRef<HTMLDivElement | null>(
      null,
    );
  const widgetIdRef = useRef<
    number | null
  >(null);
  const router = useRouter();

  const [token, setToken] =
    useState("");
  const [message, setMessage] =
    useState("");
  const [isPending, setIsPending] =
    useState(false);

  const colors = themeClasses[theme];

  useEffect(() => {
    let cancelled = false;

    if (!siteKey || !widgetRef.current) {
      return;
    }

    void loadRecaptchaScript()
      .then(() => {
        if (
          cancelled ||
          !widgetRef.current ||
          !window.grecaptcha
        ) {
          return;
        }

        window.grecaptcha.ready(() => {
          if (
            cancelled ||
            !widgetRef.current ||
            !window.grecaptcha ||
            widgetIdRef.current !== null
          ) {
            return;
          }

          widgetIdRef.current =
            window.grecaptcha.render(
              widgetRef.current,
              {
                sitekey: siteKey,
                callback: (value) => {
                  setToken(value);
                  setMessage("");
                },
                "expired-callback":
                  () => {
                    setToken("");
                  },
                "error-callback":
                  () => {
                    setToken("");
                    setMessage(
                      "reCAPTCHA could not load. Refresh and try again.",
                    );
                  },
              },
            );
        });
      })
      .catch(() => {
        if (!cancelled) {
          setMessage(
            "reCAPTCHA could not load. Refresh and try again.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  async function continueToPage() {
    const responseToken =
      token ||
      window.grecaptcha?.getResponse(
        widgetIdRef.current ??
          undefined,
      ) ||
      "";

    if (!responseToken) {
      setMessage(
        "Complete the reCAPTCHA check to continue.",
      );
      return;
    }

    setIsPending(true);
    setMessage("");

    try {
      const result =
        await verifySharePageAccessAction(
          {
            publicUserId,
            slug,
            token: responseToken,
          },
        );

      if (result.ok) {
        router.refresh();
        return;
      }

      setMessage(result.message);
      window.grecaptcha?.reset(
        widgetIdRef.current ??
          undefined,
      );
      setToken("");
    } catch {
      setMessage(
        "Unable to verify right now. Try again.",
      );
      window.grecaptcha?.reset(
        widgetIdRef.current ??
          undefined,
      );
      setToken("");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div
      className={[
        "relative flex min-h-[100svh] items-stretch justify-center overflow-x-hidden bg-gradient-to-br px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] text-[#1d2742] sm:items-center sm:px-6 sm:py-8",
        colors.background,
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-[70px] sm:h-72 sm:w-72",
          colors.glow,
        ].join(" ")}
      />

      <section className="relative my-auto w-full max-w-[min(100%,22.5rem)] sm:max-w-md">
        <div className="rounded-[22px] border border-white/70 bg-white/68 p-3 shadow-[0_34px_110px_-45px_rgba(47,58,99,0.38)] backdrop-blur-2xl sm:rounded-[32px] sm:p-5">
          <div className="rounded-[18px] border border-[#dbe2f1]/80 bg-white/78 px-4 py-7 text-center sm:rounded-[26px] sm:px-7 sm:py-9">
            <span
              className={[
                "mx-auto grid h-16 w-16 place-items-center rounded-[18px] bg-gradient-to-br text-lg font-black text-white sm:h-20 sm:w-20 sm:rounded-[24px] sm:text-xl",
                colors.avatar,
              ].join(" ")}
            >
              {getInitials(displayName)}
            </span>

            <span className="mx-auto mt-4 grid h-9 w-9 place-items-center rounded-full bg-[#f0efff] text-[#675bd7]">
              <ShieldCheck
                className="h-4 w-4"
                aria-hidden="true"
              />
            </span>

            <h1 className="mt-3 text-2xl font-black tracking-[-0.055em] sm:text-3xl">
              Confirm you are human
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-5 text-[#68738c] sm:text-sm sm:leading-6">
              Complete the check below to open {displayName}&apos;s page.
            </p>

            {siteKey ? (
              <div className="mt-5 flex justify-center overflow-x-auto">
                <div ref={widgetRef} />
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-[12px] text-amber-800">
                reCAPTCHA is not configured for this site yet.
              </p>
            )}

            {message ? (
              <p
                role="status"
                className="mt-3 text-[12px] font-semibold text-rose-500"
              >
                {message}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => {
                void continueToPage();
              }}
              disabled={
                isPending || !siteKey
              }
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#6759df] px-5 text-sm font-bold text-white shadow-[0_16px_35px_-20px_rgba(74,60,190,0.8)] disabled:cursor-wait disabled:opacity-60"
            >
              {isPending
                ? "Checking..."
                : "Continue"}
            </button>

            <GoBackButton />
          </div>
        </div>
      </section>
    </div>
  );
}
