"use server";

import { revalidatePath } from "next/cache";

import { createClient } from
  "@/lib/supabase/server";
import { publicFullNameSchema } from
  "@/lib/validation/public-auth";

export type UpdateDisplayNameState = Readonly<{
  status: "idle" | "error" | "success";
  message: string;
}>;

export async function updateDisplayName(
  _previousState: UpdateDisplayNameState,
  formData: FormData,
): Promise<UpdateDisplayNameState> {
  const nameResult =
    publicFullNameSchema.safeParse(
      formData.get("full_name"),
    );

  if (!nameResult.success) {
    return {
      status: "error",
      message:
        nameResult.error.issues[0]
          ?.message ??
        "Enter your first and last name.",
    };
  }

  const supabase = await createClient();
  const fullName = nameResult.data;

  const { error } =
    await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        name: fullName,
      },
    });

  if (error) {
    console.error(
      "Unable to update display name.",
      {
        code: error.code,
      },
    );

    return {
      status: "error",
      message:
        "Your name could not be saved right now. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return {
    status: "success",
    message: "Display name updated.",
  };
}
