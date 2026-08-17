import { z } from "zod";

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(120),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(255),
  phoneCountry: z.string().min(2),
  phoneNational: z.string().trim().max(40),
  telegramUsername: z.string().trim().max(32),
  projectTitle: z.string().trim().max(160),
  projectDescription: z.string().trim().max(4000),
  companyName: z.string().trim().max(160),
  website: z
    .string()
    .trim()
    .max(255)
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(
          value,
        ),
      "Enter a valid website URL",
    ),
  budget: z.string().max(80),
  preferredContactMethod: z.string().max(40),
  preferredMeetingTime: z.string().trim().max(160),
  additionalInformation: z.string().max(8000),
});

export const initialContactForm = {
  fullName: "",
  email: "",
  phoneCountry: "US",
  phoneNational: "",
  telegramUsername: "",
  projectTitle: "",
  projectDescription: "",
  companyName: "",
  website: "",
  budget: "",
  preferredContactMethod: "",
  preferredMeetingTime: "",
  additionalInformation: "",
};

export type ContactFormState =
  typeof initialContactForm;

export const BUDGET_OPTIONS = [
  "Under $1,000",
  "$1,000 – $5,000",
  "$5,000 – $15,000",
  "$15,000 – $50,000",
  "$50,000+",
  "Not sure yet",
] as const;

export const CONTACT_METHODS = [
  "Email",
  "Phone call",
  "WhatsApp",
  "Video meeting",
] as const;
