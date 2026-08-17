"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function logoutDashboardUser(): Promise<never> {
  const supabase = await createClient();

  const { error } =
    await supabase.auth.signOut({
      scope: "local",
    });

  if (error) {
    console.error(
      "Dashboard logout failed.",
      {
        code: error.code,
      },
    );
  }

  redirect("/register");
}