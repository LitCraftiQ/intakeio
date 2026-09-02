export const contactStatuses = [
    "pending",
    "contacted",
    "qualified",
    "archived",
  ] as const;
  
  export type ContactStatus =
    (typeof contactStatuses)[number];
  
  export const preferredContactMethods = [
    "Email",
    "Phone",
    "Telegram",
  ] as const;
  
  export type PreferredContactMethod =
    (typeof preferredContactMethods)[number];
  
  export type ContactSubmission = Readonly<{
    id: string;

    fullName: string;
    email: string;
    phone: string;
    telegramUsername: string | null;
    companyName: string;
    website: string | null;

    projectTitle: string;
    projectDescription: string;
    budget: string;
    preferredContactMethod: string;
    preferredMeetingTime: string;

    country: string;
    status: ContactStatus;
    privateNotes: string | null;
    additionalInformation: string | null;
    submittedAt: string;
  }>;

  export const dashboardNotificationTypes = [
    "share_page_opened",
    "contact_submitted",
  ] as const;

  export type DashboardNotificationType =
    (typeof dashboardNotificationTypes)[number];

  export type DashboardNotification = Readonly<{
    id: string;
    type: DashboardNotificationType;
    title: string;
    body: string;
    href: string;
    createdAt: string;
    readAt: string | null;
  }>;