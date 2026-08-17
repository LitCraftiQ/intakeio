"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function DashboardThemeToggle() {
  const {
    resolvedTheme,
    setTheme,
  } = useTheme();

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span
        className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]"
        aria-hidden="true"
      />
    );
  }

  const dark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={
        dark
          ? "Switch to light theme"
          : "Switch to dark theme"
      }
      title={
        dark
          ? "Switch to light theme"
          : "Switch to dark theme"
      }
      onClick={() => {
        setTheme(dark ? "light" : "dark");
      }}
      className="group relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-muted)] transition hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-surface-hover)] hover:text-[var(--dash-text)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--dash-ring)]"
    >
      <span
        className="absolute inset-0 bg-gradient-to-br from-amber-300/10 to-violet-400/10 opacity-0 transition group-hover:opacity-100"
        aria-hidden="true"
      />

      {dark ? (
        <Sun
          className="relative h-[19px] w-[19px]"
          aria-hidden="true"
        />
      ) : (
        <Moon
          className="relative h-[19px] w-[19px]"
          aria-hidden="true"
        />
      )}
    </button>
  );
}