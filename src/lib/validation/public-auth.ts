import { z } from "zod";

export const publicEmailSchema = z
  .string()
  .trim()
  .min(3, "Enter a valid email address.")
  .max(320, "Enter a valid email address.")
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

export const publicFullNameSchema = z
  .string()
  .trim()
  .min(2, "Enter your first and last name.")
  .max(80, "Enter a shorter name.")
  .refine(
    (value) =>
      value.split(/\s+/).filter(Boolean)
        .length >= 2,
    {
      message:
        "Enter your first and last name.",
    },
  );

export const emailOtpSchema = z
  .string()
  .trim()
  .regex(
    /^\d{6}$/,
    "Enter the complete six-digit code.",
  );
