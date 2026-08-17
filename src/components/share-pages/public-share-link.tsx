"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Globe2,
  Link2,
  Mail,
  MessageCircle,
  Music2,
  Phone,
  Send,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa6";
import {
  useState,
  type ElementType,
} from "react";

import type {
  ShareLinkPlatform,
} from "@/lib/share-pages/types";

export type ShareLinkIconName =
  | "Email"
  | "Phone"
  | ShareLinkPlatform;

const shareLinkIcons: Record<
  ShareLinkIconName,
  ElementType
> = {
  Email: Mail,
  Phone: Phone,
  Instagram: FaInstagram,
  Facebook: FaFacebookF,
  LinkedIn: FaLinkedin,
  TikTok: Music2,
  YouTube: FaYoutube,
  Telegram: Send,
  WhatsApp: MessageCircle,
  Website: Globe2,
  Custom: Link2,
};

export function PublicShareLink({
  href,
  label,
  copyValue,
  icon,
  external = false,
  themeClass,
  compact = false,
}: Readonly<{
  href: string;
  label: string;
  copyValue: string;
  icon: ShareLinkIconName;
  external?: boolean;
  themeClass?: string;
  compact?: boolean;
}>) {
  const Icon = shareLinkIcons[icon];

  const [
    copied,
    setCopied,
  ] = useState(false);

  async function copyDetail() {
    try {
      await navigator.clipboard.writeText(
        copyValue,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={[
        compact
          ? "flex min-h-8 items-center gap-1.5 rounded-lg border border-[#dce1f1] bg-white/85 px-2"
          : "flex min-h-12 items-center gap-2 rounded-xl border border-[#dce3ef] bg-white/88 px-2.5 shadow-[0_10px_28px_-24px_rgba(45,56,91,0.6)] sm:min-h-14 sm:gap-3 sm:rounded-2xl sm:px-3",
        themeClass,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {compact ? (
        <Icon
          className="h-3 w-3 shrink-0 text-[#6d61db]"
          aria-hidden="true"
        />
      ) : (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f0efff] text-[#675bd7] sm:h-9 sm:w-9 sm:rounded-xl">
          <Icon
            className="h-4 w-4 sm:h-[17px] sm:w-[17px]"
            aria-hidden="true"
          />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span
          className={
            compact
              ? "block truncate text-[9px] font-bold"
              : "block text-[13px] font-bold sm:text-sm"
          }
        >
          {label}
        </span>

        {compact ? null : (
          <span className="mt-0.5 block truncate text-[11px] text-[#7b859c] sm:text-xs">
            {copyValue}
          </span>
        )}
      </span>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={copyDetail}
          aria-label={`Copy ${label}`}
          className={
            compact
              ? "grid h-6 w-6 place-items-center rounded-md text-[#9aa3bb] transition hover:bg-[#f0efff] hover:text-[#675bd7]"
              : "grid h-8 w-8 place-items-center rounded-lg text-[#7b859c] transition hover:bg-[#f0efff] hover:text-[#675bd7] sm:h-9 sm:w-9"
          }
        >
          {copied ? (
            <Check
              className={
                compact
                  ? "h-2.5 w-2.5 text-emerald-500"
                  : "h-3.5 w-3.5 text-emerald-500 sm:h-4 sm:w-4"
              }
              aria-hidden="true"
            />
          ) : (
            <Copy
              className={
                compact
                  ? "h-2.5 w-2.5"
                  : "h-3.5 w-3.5 sm:h-4 sm:w-4"
              }
              aria-hidden="true"
            />
          )}
        </button>

        <a
          href={href}
          target={
            external
              ? "_blank"
              : undefined
          }
          rel={
            external
              ? "noopener noreferrer nofollow"
              : undefined
          }
          aria-label={`Open ${label}`}
          className={
            compact
              ? "grid h-6 w-6 place-items-center rounded-md text-[#9aa3bb] transition hover:bg-[#f0efff] hover:text-[#675bd7]"
              : "grid h-8 w-8 place-items-center rounded-lg text-[#7b859c] transition hover:bg-[#f0efff] hover:text-[#675bd7] sm:h-9 sm:w-9"
          }
        >
          <ExternalLink
            className={
              compact
                ? "h-2.5 w-2.5"
                : "h-3.5 w-3.5 sm:h-4 sm:w-4"
            }
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
  );
}
