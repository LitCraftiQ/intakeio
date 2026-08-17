"use server";

import { parsePhoneNumberFromString } from
  "libphonenumber-js";

import { contactFormSchema } from
  "@/lib/contacts/form-schema";
import { COUNTRY_BY_CODE } from
  "@/lib/countries";
import { getFormLinkOwner } from
  "@/lib/intake-forms/queries";
import {
  publicShareUserIdSchema,
} from "@/lib/share-pages/validation";
import { createPrivilegedClient } from
  "@/lib/supabase/privileged";

export type SubmitContactFormResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

function emptyToNull(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (
    /^[a-z][a-z0-9+.-]*:/i.test(
      trimmed,
    )
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export async function submitContactFormAction(
  publicOwnerId: string,
  input: unknown,
): Promise<SubmitContactFormResult> {
  const parsedOwnerId =
    publicShareUserIdSchema.safeParse(
      publicOwnerId,
    );

  if (!parsedOwnerId.success) {
    return {
      ok: false,
      message:
        "This form link is not available.",
    };
  }

  const parsed =
    contactFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]
          ?.message ??
        "Please review the form and try again.",
    };
  }

  const owner = await getFormLinkOwner(
    parsedOwnerId.data,
  );

  if (!owner) {
    return {
      ok: false,
      message:
        "This form link is not available.",
    };
  }

  const data = parsed.data;
  const phoneNational =
    data.phoneNational.trim();

  let phoneNumber: string | null = null;
  let phoneInternational: string | null =
    null;
  let countryName: string | null = null;
  let countryCode: string | null = null;

  if (phoneNational.length > 0) {
    const parsedPhone =
      parsePhoneNumberFromString(
        phoneNational,
        data.phoneCountry as never,
      );

    if (
      !parsedPhone ||
      !parsedPhone.isValid()
    ) {
      return {
        ok: false,
        message:
          "Enter a valid phone number, or leave it blank.",
      };
    }

    phoneNumber =
      parsedPhone.formatInternational();
    phoneInternational =
      parsedPhone.number;
    countryCode = data.phoneCountry;
    countryName =
      COUNTRY_BY_CODE[data.phoneCountry]
        ?.name ??
      data.phoneCountry;
  }

  const supabase =
    createPrivilegedClient();

  const { error } = await supabase
    .from("contacts")
    .insert({
      owner_user_id: owner.ownerUserId,
      full_name: data.fullName,
      email: data.email,
      phone_number: phoneNumber,
      phone_international:
        phoneInternational,
      country_name: countryName,
      country_code: countryCode,
      telegram_username: emptyToNull(
        data.telegramUsername,
      ),
      company_name: emptyToNull(
        data.companyName,
      ),
      website: normalizeWebsite(
        data.website,
      ),
      project_title: emptyToNull(
        data.projectTitle,
      ),
      project_description: emptyToNull(
        data.projectDescription,
      ),
      budget: emptyToNull(data.budget),
      preferred_contact_method:
        emptyToNull(
          data.preferredContactMethod,
        ),
      preferred_meeting_time:
        emptyToNull(
          data.preferredMeetingTime,
        ),
      additional_information:
        emptyToNull(
          data.additionalInformation,
        ),
    });

  if (error) {
    return {
      ok: false,
      message:
        "Something went wrong while submitting. Please try again.",
    };
  }

  return {
    ok: true,
  };
}
