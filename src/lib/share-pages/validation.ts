import { z } from "zod";

import {
  shareLinkPlatforms,
  sharePageStatuses,
  sharePageThemes,
  type ShareLinkPlatform,
} from "./types";

const optionalText = (
  maximumLength: number,
  tooLongMessage: string,
) =>
  z
    .string()
    .trim()
    .max(maximumLength, tooLongMessage);

function normalizeWebUrl(value: string) {
  const trimmed = value.trim();

  if (
    /^[a-z][a-z0-9+.-]*:/i.test(
      trimmed,
    )
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function looksLikeWebUrl(value: string) {
  return /^(https?:\/\/|wa\.me\/|api\.whatsapp\.com\/|whatsapp\.com\/|t\.me\/|telegram\.me\/)/i.test(
    value.trim(),
  );
}

function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidPhoneNumber(
  value: string,
) {
  const digits = phoneDigits(value);

  return (
    digits.length === 10 ||
    (digits.length === 11 &&
      digits.startsWith("1"))
  );
}

export function normalizePhoneNumber(
  value: string,
) {
  const digits = phoneDigits(value);

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (
    digits.length === 11 &&
    digits.startsWith("1")
  ) {
    return `+${digits}`;
  }

  return "";
}

export function sanitizePhoneInput(
  value: string,
) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const keepPlus =
    trimmed.startsWith("+");
  const digits = phoneDigits(
    trimmed,
  ).slice(0, 11);

  return keepPlus
    ? `+${digits}`
    : digits;
}

export function createPhoneHref(
  phone: string,
) {
  const normalized =
    normalizePhoneNumber(phone);

  if (!normalized) {
    return "";
  }

  return `tel:${normalized}`;
}

export const whatsAppNumberHint =
  "Include the country code, with or without +. +44 and 44 are the same, +1 and 1 are the same. If the number starts with 0, replace that 0 with the country code — for example 07911… becomes 447911… or +447911…. You can also paste a WhatsApp link.";

function toWhatsAppDigits(value: string) {
  const digits = phoneDigits(value);

  if (digits.startsWith("00")) {
    return digits.slice(2);
  }

  return digits;
}

export function isValidWhatsAppNumber(
  value: string,
) {
  return /^[1-9]\d{6,14}$/.test(
    toWhatsAppDigits(value),
  );
}

function normalizeWhatsAppUrl(
  value: string,
) {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (
    /^(wa\.me|api\.whatsapp\.com|whatsapp\.com)\//i.test(
      trimmed,
    )
  ) {
    return `https://${trimmed}`;
  }

  if (!isValidWhatsAppNumber(trimmed)) {
    return trimmed;
  }

  return `https://wa.me/${toWhatsAppDigits(trimmed)}`;
}

export function normalizeShareLinkUrl(
  platform: ShareLinkPlatform,
  value: string,
) {
  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (platform === "WhatsApp") {
    return normalizeWhatsAppUrl(
      trimmed,
    );
  }

  if (platform === "Telegram") {
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    if (
      /^(t\.me|telegram\.me)\//i.test(
        trimmed,
      )
    ) {
      return `https://${trimmed}`;
    }

    const username = trimmed.replace(
      /^@/,
      "",
    );

    if (
      /^[a-zA-Z][a-zA-Z0-9_]{3,31}$/.test(
        username,
      )
    ) {
      return `https://t.me/${username}`;
    }
  }

  return normalizeWebUrl(trimmed);
}

const shareLinkSchema = z
  .object({
    platform: z.enum(
      shareLinkPlatforms,
    ),

    url: z
      .string()
      .trim()
      .min(1, "Enter a link or number.")
      .max(
        500,
        "That value is too long.",
      ),
  })
  .transform((link) => ({
    ...link,
    url: normalizeShareLinkUrl(
      link.platform,
      link.url,
    ),
  }))
  .superRefine((link, ctx) => {
    if (isHttpUrl(link.url)) {
      return;
    }

    ctx.addIssue({
      code: "custom",
      path: ["url"],
      message:
        link.platform === "WhatsApp"
          ? looksLikeWebUrl(link.url)
            ? "Enter a valid WhatsApp link."
            : "This WhatsApp number needs a country code, like 44… or +44…. You can also paste a WhatsApp link."
          : "Enter a valid link.",
    });
  });

export const sharePageInputSchema =
  z.object({
    id: z.string().uuid().nullable(),

    displayName: z
      .string()
      .trim()
      .min(1, "Enter a public display name.")
      .max(
        80,
        "Display name must be 80 characters or fewer.",
      ),

    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(
        3,
        "Public URL needs at least 3 characters.",
      )
      .max(
        60,
        "Public URL must be 60 characters or fewer.",
      )
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers, and hyphens.",
      )
      .refine(
        (value) => value !== "form",
        {
          message:
            "This URL is reserved for your intake form.",
        },
      ),

    email: z
      .string()
      .trim()
      .max(320)
      .refine(
        (value) =>
          value.length === 0 ||
          z.string().email().safeParse(value)
            .success,
        {
          message:
            "Enter a valid email address.",
        },
      ),

    phone: z
      .string()
      .trim()
      .max(16)
      .refine(
        (value) =>
          value.length === 0 ||
          isValidPhoneNumber(value),
        {
          message:
            "Enter a phone number as 1... or +1...",
        },
      )
      .transform((value) =>
        value.length === 0
          ? ""
          : normalizePhoneNumber(value),
      ),

    internalName: optionalText(
      80,
      "Internal name must be 80 characters or fewer.",
    ),

    introduction: optionalText(
      180,
      "Introduction must be 180 characters or fewer.",
    ),

    status: z.enum(sharePageStatuses),

    theme: z.enum(sharePageThemes),

    links: z
      .array(shareLinkSchema)
      .max(12),
  });

export const sharePageIdSchema =
  z.string().uuid();

export const publicShareSlugSchema =
  z
    .string()
    .trim()
    .toLowerCase()
    .min(
      3,
      "Public URL needs at least 3 characters.",
    )
    .max(
      60,
      "Public URL must be 60 characters or fewer.",
    )
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens.",
    );

export const publicShareUserIdSchema =
  z
    .string()
    .trim()
    .regex(
      /^[a-f0-9]{6}$/,
      "Invalid public user identifier.",
    );