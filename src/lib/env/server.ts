import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z.object({
  APP_URL: z
    .string()
    .trim()
    .url()
    .transform((value) =>
      value.replace(/\/+$/, ""),
    ),

  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .trim()
    .url(),

  SUPABASE_SECRET_KEY: z
    .string()
    .trim()
    .min(20),
});

let cachedEnvironment:
  | z.infer<typeof serverEnvironmentSchema>
  | undefined;

export function getServerEnvironment() {
  if (cachedEnvironment) {
    return cachedEnvironment;
  }

  const parsed =
    serverEnvironmentSchema.safeParse({
      APP_URL: process.env.APP_URL,
      NEXT_PUBLIC_SUPABASE_URL:
        process.env
          .NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SECRET_KEY:
        process.env.SUPABASE_SECRET_KEY,
    });

  if (!parsed.success) {
    throw new Error(
      "Required private server environment variables are missing or invalid.",
    );
  }

  cachedEnvironment = parsed.data;

  return cachedEnvironment;
}