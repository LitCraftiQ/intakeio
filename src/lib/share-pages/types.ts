export const sharePageStatuses = [
    "draft",
    "published",
  ] as const;
  
  export type SharePageStatus =
    (typeof sharePageStatuses)[number];
  
  export const sharePageThemes = [
    "aurora",
    "ocean",
    "plum",
  ] as const;
  
  export type SharePageTheme =
    (typeof sharePageThemes)[number];
  
  export const shareLinkPlatforms = [
    "Instagram",
    "Facebook",
    "LinkedIn",
    "TikTok",
    "YouTube",
    "Telegram",
    "WhatsApp",
    "Website",
    "Custom",
  ] as const;
  
  export type ShareLinkPlatform =
    (typeof shareLinkPlatforms)[number];
  
  export type SharePageLink = Readonly<{
    id: string;
    platform: ShareLinkPlatform;
    url: string;
    position: number;
  }>;
  
  export type SharePage = Readonly<{
    id: string;
  
    displayName: string;
    slug: string;
  
    email: string | null;
    phone: string | null;
  
    internalName: string | null;
    introduction: string | null;
  
    status: SharePageStatus;
    theme: SharePageTheme;
  
    links: SharePageLink[];
  
    createdAt: string;
    updatedAt: string;
  }>;
  
  export type SharePageInput = Readonly<{
    id: string | null;
  
    displayName: string;
    slug: string;
  
    email: string;
    phone: string;
  
    internalName: string;
    introduction: string;
  
    status: SharePageStatus;
    theme: SharePageTheme;
  
    links: ReadonlyArray<{
      platform: ShareLinkPlatform;
      url: string;
    }>;
  }>;
  
  export type SharePageActionResult =
    | Readonly<{
        ok: true;
        page: SharePage;
      }>
    | Readonly<{
        ok: false;
        message: string;
        code:
          | "INVALID_INPUT"
          | "UNAUTHORIZED"
          | "SLUG_TAKEN"
          | "NOT_FOUND"
          | "SAVE_FAILED";
      }>;
  
  export type DeleteSharePageResult =
    | Readonly<{
        ok: true;
        id: string;
      }>
    | Readonly<{
        ok: false;
        message: string;
        code:
          | "INVALID_INPUT"
          | "UNAUTHORIZED"
          | "NOT_FOUND"
          | "DELETE_FAILED";
      }>;