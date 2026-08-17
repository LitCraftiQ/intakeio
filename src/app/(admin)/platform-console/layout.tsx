import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

type PlatformConsoleLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function PlatformConsoleLayout({
  children,
}: PlatformConsoleLayoutProps) {
  const admin = await requireAdmin();

  return (
    <AdminShell
      admin={{
        role: admin.role,
        roleLabel: admin.roleLabel,
        displayName: admin.displayName,
        email: admin.email,
        initials: admin.initials,
      }}
    >
      {children}
    </AdminShell>
  );
}