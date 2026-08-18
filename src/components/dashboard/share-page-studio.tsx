import {
  redirect,
} from "next/navigation";

import {
  getServerEnvironment,
} from "@/lib/env/server";
import {
  createClient,
} from "@/lib/supabase/server";
import {
  getOwnedSharePages,
} from "@/lib/share-pages/queries";

import {
  SharePageStudioClient,
} from "./share-page-studio-client";

export async function SharePageStudio() {
  const supabase =
    await createClient();

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  const user =
    userResult.user;

  if (userError || !user) {
    redirect("/register");
  }

  const {
    data: publicUserId,
    error: publicIdError,
  } = await supabase.rpc(
    "get_or_create_share_public_id",
  );

  if (
    publicIdError ||
    typeof publicUserId !== "string"
  ) {
    throw new Error(
      "Unable to initialize Share Page.",
    );
  }

  await supabase
    .from("share_pages")
    .update({
      public_owner_id: publicUserId,
    })
    .eq("owner_user_id", user.id)
    .is("public_owner_id", null);

  const {
    pages,
    errorMessage,
  } = await getOwnedSharePages();

  const { APP_URL: appUrl } =
    getServerEnvironment();

  return (
    <SharePageStudioClient
      initialPages={pages}
      loadError={errorMessage}
      publicUserId={publicUserId}
      appUrl={appUrl}
    />
  );
}
