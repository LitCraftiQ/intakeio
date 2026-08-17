"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

type DashboardThemeProviderProps = Readonly<{
  children: ReactNode;
}>;

export function DashboardThemeProvider({
  children,
}: DashboardThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="data-dashboard-theme"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
      storageKey="intakeio-dashboard-theme"
      themes={["light", "dark"]}
    >
      {children}
    </ThemeProvider>
  );
}