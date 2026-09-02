"use client";

import {
  type FormEvent,
  useState,
} from "react";
import { parsePhoneNumberFromString } from
  "libphonenumber-js";

import { submitContactFormAction } from
  "@/app/(web)/[publicUserId]/form/actions";
import {
  contactFormSchema,
  initialContactForm,
  type ContactFormState,
} from "@/lib/contacts/form-schema";

export function useContactForm(
  publicOwnerId: string,
) {
  const [values, setValues] = useState<
    ContactFormState
  >(initialContactForm);

  const [errors, setErrors] = useState<
    Partial<
      Record<keyof ContactFormState, string>
    >
  >({});

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [serverError, setServerError] =
    useState<string | null>(null);

  function update<
    Key extends keyof ContactFormState,
  >(
    key: Key,
    value: ContactFormState[Key],
  ) {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((previous) => ({
        ...previous,
        [key]: undefined,
      }));
    }
  }

  async function onSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setServerError(null);

    const parsed =
      contactFormSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors: Partial<
        Record<keyof ContactFormState, string>
      > = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as
          keyof ContactFormState;

        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    const data = parsed.data;

    if (data.phoneNational.trim()) {
      const parsedPhone =
        parsePhoneNumberFromString(
          data.phoneNational,
          data.phoneCountry as never,
        );

      if (
        !parsedPhone ||
        !parsedPhone.isValid()
      ) {
        setErrors((previous) => ({
          ...previous,
          phoneNational:
            "Enter a valid phone number, or leave it blank.",
        }));
        return;
      }
    }

    setSubmitting(true);

    try {
      const result =
        await submitContactFormAction(
          publicOwnerId,
          data,
        );

      if (!result.ok) {
        setServerError(result.message);
        return;
      }

      setSubmitted(true);
    } catch {
      setServerError(
        "Something went wrong while submitting. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return {
    values,
    errors,
    submitting,
    submitted,
    serverError,
    update,
    onSubmit,
    dismissSuccess() {
      setSubmitted(false);
    },
  };
}

export type ContactFormController =
  ReturnType<typeof useContactForm>;
