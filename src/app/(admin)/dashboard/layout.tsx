import type {
    Metadata,
  } from "next";
  import { redirect } from "next/navigation";
  import type {
    ReactNode,
  } from "react";
  
import {
  DashboardShell,
} from "@/components/dashboard/dashboard-shell";
import {
  DashboardThemeProvider,
} from "@/components/dashboard/dashboard-theme-provider";
import { getUserDisplayName } from
  "@/lib/auth/display-name";
import {
  getDashboardNotifications,
} from "@/lib/dashboard/notifications";
import { getOwnedFormLink } from
  "@/lib/intake-forms/queries";
import {
  createClient,
} from "@/lib/supabase/server";
  
  import "./dashboard.css";
  
  export const metadata: Metadata = {
    title: {
      default: "Dashboard",
      template: "%s | Intakeio",
    },
    description:
      "Private Intakeio client submission dashboard.",
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  };
  
  export const dynamic = "force-dynamic";
  
  type DashboardLayoutProps = Readonly<{
    children: ReactNode;
  }>;
  
  export default async function DashboardLayout({
    children,
  }: DashboardLayoutProps) {
    const supabase = await createClient();
  
    const {
      data: userResult,
      error: userError,
    } = await supabase.auth.getUser();
  
    const user = userResult.user;
  
    if (userError || !user) {
      redirect("/register");
    }
  
    const email =
      user.email ??
      "Authenticated user";
  
    const displayName =
      getUserDisplayName(user);

    const {
      notifications,
      errorMessage: notificationsError,
    } =
      await getDashboardNotifications();

    const formPublicOwnerId =
      await getOwnedFormLink();

    return (
      <DashboardThemeProvider>
        <DashboardShell
          displayName={displayName}
          email={email}
          formPublicOwnerId={
            formPublicOwnerId
          }
          notifications={notifications}
          notificationsError={
            notificationsError
          }
        >
          {children}
        </DashboardShell>
      </DashboardThemeProvider>
    );
  }