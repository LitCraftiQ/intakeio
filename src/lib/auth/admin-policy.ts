export const ADMIN_ROLES = [
    "super_admin",
    "operations_admin",
    "support_agent",
    "security_admin",
  ] as const;
  
  export type AdminRole =
    (typeof ADMIN_ROLES)[number];
  
  export const ADMIN_SECTIONS = [
    "overview",
    "businesses",
    "users",
    "security",
    "audit-logs",
    "admin-team",
  ] as const;
  
  export type AdminSection =
    (typeof ADMIN_SECTIONS)[number];
  
  export const ADMIN_ROLE_LABELS: Readonly<
    Record<AdminRole, string>
  > = {
    super_admin: "Super Admin",
    operations_admin: "Operations Admin",
    support_agent: "Support Agent",
    security_admin: "Security Admin",
  };
  
  const ADMIN_SECTION_ACCESS: Readonly<
    Record<AdminSection, readonly AdminRole[]>
  > = {
    overview: [
      "super_admin",
      "operations_admin",
      "support_agent",
      "security_admin",
    ],
  
    businesses: [
      "super_admin",
      "operations_admin",
      "support_agent",
    ],
  
    users: [
      "super_admin",
      "operations_admin",
      "support_agent",
      "security_admin",
    ],
  
    security: [
      "super_admin",
      "security_admin",
    ],
  
    "audit-logs": [
      "super_admin",
      "security_admin",
    ],
  
    "admin-team": [
      "super_admin",
    ],
  };
  
  export function isAdminSection(
    value: string,
  ): value is AdminSection {
    return ADMIN_SECTIONS.some(
      (section) => section === value,
    );
  }
  
  export function canAccessAdminSection(
    role: AdminRole,
    section: AdminSection,
  ) {
    return ADMIN_SECTION_ACCESS[
      section
    ].includes(role);
  }