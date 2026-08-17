import {
  redirect,
} from "next/navigation";

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

  const appUrl =
    process.env.APP_URL ??
    "http://localhost:4001";

  return (
    <SharePageStudioClient
      initialPages={pages}
      loadError={errorMessage}
      publicUserId={publicUserId}
      appUrl={appUrl}
    />
  );
}


// "use client";

// import {
//   Check,
//   ChevronDown,
//   Copy,
//   ExternalLink,
//   Globe2,
//   Link2,
//   Mail,
//   MessageCircle,
//   Music2,
//   Pencil,
//   Phone,
//   Plus,
//   Save,
//   Send,
//   Sparkles,
//   Trash2,
//   UserRound,
//   X,
// } from "lucide-react";
// import type { LucideIcon } from "lucide-react";
// import {
//   FaFacebookF,
//   FaInstagram,
//   FaLinkedin,
//   FaYoutube,
// } from "react-icons/fa6";
// import {
//   type ElementType,
//   type ReactNode,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// type SharePageStatus = "draft" | "published";

// type SharePageTheme =
//   | "aurora"
//   | "ocean"
//   | "plum";

// type OptionalField =
//   | "internalName"
//   | "introduction";

// type SocialPlatform =
//   | "Instagram"
//   | "Facebook"
//   | "LinkedIn"
//   | "TikTok"
//   | "YouTube"
//   | "Telegram"
//   | "WhatsApp"
//   | "Website"
//   | "Custom";

// type SocialLink = {
//   id: string;
//   platform: SocialPlatform;
//   url: string;
// };

// type SharePage = {
//   id: string;

//   displayName: string;
//   slug: string;
//   email: string;
//   phone: string;

//   internalName: string | null;
//   introduction: string | null;

//   status: SharePageStatus;
//   theme: SharePageTheme;

//   links: SocialLink[];
//   updatedAt: string;
// };

// type SharePageDraft = {
//   id: string | null;

//   displayName: string;
//   slug: string;
//   email: string;
//   phone: string;

//   internalName: string;
//   introduction: string;
//   optionalFields: OptionalField[];

//   status: SharePageStatus;
//   theme: SharePageTheme;

//   links: SocialLink[];
// };

// type PlatformOption = Readonly<{
//   value: SocialPlatform;
//   icon: ElementType;
// }>;

// type PreviewLink = Readonly<{
//   id: string;
//   label: string;
//   icon: ElementType;
// }>;

// const platformOptions: PlatformOption[] = [
//   {
//     value: "Instagram",
//     icon: FaInstagram,
//   },
//   {
//     value: "Facebook",
//     icon: FaFacebookF,
//   },
//   {
//     value: "LinkedIn",
//     icon: FaLinkedin,
//   },
//   {
//     value: "TikTok",
//     icon: Music2,
//   },
//   {
//     value: "YouTube",
//     icon: FaYoutube,
//   },
//   {
//     value: "Telegram",
//     icon: Send,
//   },
//   {
//     value: "WhatsApp",
//     icon: MessageCircle,
//   },
//   {
//     value: "Website",
//     icon: Globe2,
//   },
//   {
//     value: "Custom",
//     icon: Link2,
//   },
// ];

// const previewThemeClasses: Record<
//   SharePageTheme,
//   string
// > = {
//   aurora:
//     "from-[#7468ff] via-[#8f6ee8] to-[#30b9c4]",

//   ocean:
//     "from-[#087ca7] via-[#1398a5] to-[#53c6b3]",

//   plum:
//     "from-[#713a8f] via-[#9b4f88] to-[#df7e8b]",
// };

// const initialPages: SharePage[] = [
//   {
//     id: "share-page-owner",

//     displayName: "Intakeio Owner",
//     slug: "intakeio-owner",
//     email: "owner@example.com",
//     phone: "+1 514 555 0101",

//     internalName: null,
//     introduction: null,

//     status: "published",
//     theme: "aurora",

//     links: [
//       {
//         id: "owner-instagram",
//         platform: "Instagram",
//         url: "https://instagram.com/example",
//       },
//       {
//         id: "owner-telegram",
//         platform: "Telegram",
//         url: "https://t.me/example",
//       },
//       {
//         id: "owner-whatsapp",
//         platform: "WhatsApp",
//         url: "https://wa.me/15145550101",
//       },
//     ],

//     updatedAt: new Date().toISOString(),
//   },

//   {
//     id: "share-page-studio",

//     displayName: "Northstar Studio",
//     slug: "northstar-studio",
//     email: "hello@northstar.example",
//     phone: "",

//     internalName: "Studio profile",
//     introduction:
//       "Design and digital services for growing companies.",

//     status: "published",
//     theme: "ocean",

//     links: [
//       {
//         id: "studio-website",
//         platform: "Website",
//         url: "https://northstar.example",
//       },
//       {
//         id: "studio-youtube",
//         platform: "YouTube",
//         url: "https://youtube.com/@example",
//       },
//     ],

//     updatedAt: new Date(
//       Date.now() - 24 * 60 * 60 * 1000,
//     ).toISOString(),
//   },

//   {
//     id: "share-page-project",

//     displayName: "Atlas Projects",
//     slug: "atlas-projects",
//     email: "projects@example.com",
//     phone: "+1 514 555 0188",

//     internalName: null,
//     introduction: null,

//     status: "draft",
//     theme: "plum",

//     links: [
//       {
//         id: "project-facebook",
//         platform: "Facebook",
//         url: "https://facebook.com/example",
//       },
//     ],

//     updatedAt: new Date(
//       Date.now() -
//         3 * 24 * 60 * 60 * 1000,
//     ).toISOString(),
//   },
// ];

// function createId(prefix: string) {
//   return `${prefix}-${Date.now()}-${Math.random()
//     .toString(36)
//     .slice(2, 9)}`;
// }

// function createEmptyDraft(): SharePageDraft {
//   return {
//     id: null,

//     displayName: "",
//     slug: "",
//     email: "",
//     phone: "",

//     internalName: "",
//     introduction: "",
//     optionalFields: [],

//     status: "draft",
//     theme: "aurora",

//     links: [],
//   };
// }

// function normalizeSlug(value: string) {
//   return value
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9-]+/g, "-")
//     .replace(/-+/g, "-")
//     .replace(/^-|-$/g, "")
//     .slice(0, 60);
// }

// function formatUpdatedAt(value: string) {
//   return new Intl.DateTimeFormat("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   }).format(new Date(value));
// }

// function getPlatformIcon(
//   platform: SocialPlatform,
// ) {
//   return (
//     platformOptions.find(
//       (option) =>
//         option.value === platform,
//     )?.icon ?? Link2
//   );
// }

// function getInitials(value: string) {
//   const initials = value
//     .trim()
//     .split(/\s+/)
//     .filter(Boolean)
//     .slice(0, 2)
//     .map((word) =>
//       word[0]?.toUpperCase(),
//     )
//     .join("");

//   return initials || "SP";
// }

// function toDraft(
//   page: SharePage,
// ): SharePageDraft {
//   const optionalFields: OptionalField[] = [];

//   if (page.internalName !== null) {
//     optionalFields.push("internalName");
//   }

//   if (page.introduction !== null) {
//     optionalFields.push("introduction");
//   }

//   return {
//     id: page.id,

//     displayName: page.displayName,
//     slug: page.slug,
//     email: page.email,
//     phone: page.phone,

//     internalName:
//       page.internalName ?? "",

//     introduction:
//       page.introduction ?? "",

//     optionalFields,

//     status: page.status,
//     theme: page.theme,

//     links: page.links.map((link) => ({
//       ...link,
//     })),
//   };
// }

// function getSavedPageTitle(page: SharePage) {
//   return (
//     page.internalName?.trim() ||
//     page.displayName
//   );
// }

// export function SharePageStudio() {
//   const editorRef =
//     useRef<HTMLElement>(null);

//   const [pages, setPages] =
//     useState<SharePage[]>(initialPages);

//   const [draft, setDraft] =
//     useState<SharePageDraft>(
//       createEmptyDraft,
//     );

//   const [
//     expandedPageId,
//     setExpandedPageId,
//   ] = useState<string | null>(null);

//   const [
//     copiedPageId,
//     setCopiedPageId,
//   ] = useState<string | null>(null);

//   const [message, setMessage] =
//     useState("");

//   const publicUrl = useMemo(() => {
//     const slug =
//       draft.slug || "your-page";

//     return `https://intakeio.app/s/${slug}`;
//   }, [draft.slug]);

//   const previewLinks =
//     useMemo<PreviewLink[]>(() => {
//       const result: PreviewLink[] = [];

//       if (draft.email.trim()) {
//         result.push({
//           id: "preview-email",
//           label: "Email",
//           icon: Mail,
//         });
//       }

//       if (draft.phone.trim()) {
//         result.push({
//           id: "preview-phone",
//           label: "Phone",
//           icon: Phone,
//         });
//       }

//       draft.links.forEach((link) => {
//         if (!link.url.trim()) {
//           return;
//         }

//         result.push({
//           id: link.id,
//           label: link.platform,
//           icon: getPlatformIcon(
//             link.platform,
//           ),
//         });
//       });

//       return result;
//     }, [draft]);

//   function updateDraft<
//     Key extends keyof SharePageDraft,
//   >(
//     key: Key,
//     value: SharePageDraft[Key],
//   ) {
//     setDraft((current) => ({
//       ...current,
//       [key]: value,
//     }));

//     setMessage("");
//   }

//   function clearFields() {
//     setDraft(createEmptyDraft());
//     setExpandedPageId(null);
//     setMessage("");
//   }

//   function addOptionalField(
//     field: OptionalField,
//   ) {
//     if (
//       draft.optionalFields.includes(field)
//     ) {
//       return;
//     }

//     updateDraft("optionalFields", [
//       ...draft.optionalFields,
//       field,
//     ]);
//   }

//   function removeOptionalField(
//     field: OptionalField,
//   ) {
//     setDraft((current) => ({
//       ...current,

//       internalName:
//         field === "internalName"
//           ? ""
//           : current.internalName,

//       introduction:
//         field === "introduction"
//           ? ""
//           : current.introduction,

//       optionalFields:
//         current.optionalFields.filter(
//           (item) => item !== field,
//         ),
//     }));

//     setMessage("");
//   }

//   function addSocialLink() {
//     if (draft.links.length >= 12) {
//       setMessage(
//         "A Share Page can contain up to 12 links.",
//       );

//       return;
//     }

//     updateDraft("links", [
//       ...draft.links,
//       {
//         id: createId("social"),
//         platform: "Instagram",
//         url: "",
//       },
//     ]);
//   }

//   function updateSocialLink(
//     id: string,
//     changes: Partial<SocialLink>,
//   ) {
//     updateDraft(
//       "links",
//       draft.links.map((link) =>
//         link.id === id
//           ? {
//               ...link,
//               ...changes,
//             }
//           : link,
//       ),
//     );
//   }

//   function removeSocialLink(id: string) {
//     updateDraft(
//       "links",
//       draft.links.filter(
//         (link) => link.id !== id,
//       ),
//     );
//   }

//   function editPage(page: SharePage) {
//     setDraft(toDraft(page));
//     setExpandedPageId(page.id);
//     setMessage("");

//     editorRef.current?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     });
//   }

//   function savePage() {
//     const displayName =
//       draft.displayName.trim();

//     const slug =
//       normalizeSlug(draft.slug);

//     if (!displayName) {
//       setMessage(
//         "Enter the public display name.",
//       );

//       return;
//     }

//     if (slug.length < 3) {
//       setMessage(
//         "The public URL must contain at least three characters.",
//       );

//       return;
//     }

//     const duplicateSlug = pages.some(
//       (page) =>
//         page.slug === slug &&
//         page.id !== draft.id,
//     );

//     if (duplicateSlug) {
//       setMessage(
//         "That public URL is already being used.",
//       );

//       return;
//     }

//     const savedPage: SharePage = {
//       id:
//         draft.id ??
//         createId("share-page"),

//       displayName,
//       slug,

//       email: draft.email
//         .trim()
//         .toLowerCase(),

//       phone: draft.phone.trim(),

//       internalName:
//         draft.optionalFields.includes(
//           "internalName",
//         )
//           ? draft.internalName.trim()
//           : null,

//       introduction:
//         draft.optionalFields.includes(
//           "introduction",
//         )
//           ? draft.introduction.trim()
//           : null,

//       status: draft.status,
//       theme: draft.theme,

//       links: draft.links
//         .map((link) => ({
//           ...link,
//           url: link.url.trim(),
//         }))
//         .filter(
//           (link) => link.url.length > 0,
//         ),

//       updatedAt:
//         new Date().toISOString(),
//     };

//     setPages((current) => {
//       const exists = current.some(
//         (page) =>
//           page.id === savedPage.id,
//       );

//       if (exists) {
//         return current.map((page) =>
//           page.id === savedPage.id
//             ? savedPage
//             : page,
//         );
//       }

//       return [savedPage, ...current];
//     });

//     setDraft(toDraft(savedPage));
//     setExpandedPageId(savedPage.id);
//     setMessage("Share Page saved.");
//   }

//   async function copyPublicLink(
//     page: SharePage,
//   ) {
//     const value =
//       `https://intakeio.app/s/${page.slug}`;

//     try {
//       await navigator.clipboard.writeText(
//         value,
//       );

//       setCopiedPageId(page.id);

//       window.setTimeout(() => {
//         setCopiedPageId(null);
//       }, 1400);
//     } catch {
//       setCopiedPageId(null);
//     }
//   }

//   return (
//     <section
//       ref={editorRef}
//       className="mt-5 scroll-mt-24 overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[var(--dash-card-shadow)]"
//     >
//       <header className="flex items-center justify-between gap-4 border-b border-[var(--dash-border)] px-4 py-3.5 sm:px-5">
//         <div className="min-w-0">
//           <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--dash-accent)]">
//             <Sparkles
//               className="h-3.5 w-3.5"
//               aria-hidden="true"
//             />

//             Share Page Studio
//           </div>

//           <h2 className="mt-1 truncate text-base font-bold tracking-[-0.03em]">
//             Create a share page
//           </h2>
//         </div>

//         <button
//           type="button"
//           onClick={clearFields}
//           className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-3 text-xs font-bold text-[var(--dash-muted)] transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-500"
//         >
//           <Trash2
//             className="h-3.5 w-3.5"
//             aria-hidden="true"
//           />

//           Clear
//         </button>
//       </header>

//       <div className="grid xl:grid-cols-[minmax(0,1fr)_300px]">
//         <div className="border-b border-[var(--dash-border)] p-4 xl:border-b-0 xl:border-r">
//           <div className="grid gap-3 sm:grid-cols-2">
//             <Field
//               label="Public display name"
//               icon={UserRound}
//             >
//               <input
//                 type="text"
//                 value={draft.displayName}
//                 onChange={(event) => {
//                   updateDraft(
//                     "displayName",
//                     event.target.value.slice(
//                       0,
//                       80,
//                     ),
//                   );
//                 }}
//                 maxLength={80}
//                 placeholder="Your name or company"
//                 className="dashboard-input"
//               />
//             </Field>

//             <Field
//               label="Public URL"
//               icon={Globe2}
//             >
//               <div className="flex min-w-0 items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] focus-within:border-[var(--dash-accent)] focus-within:ring-4 focus-within:ring-[var(--dash-ring)]">
//                 <span className="pl-3 text-xs text-[var(--dash-soft)]">
//                   /s/
//                 </span>

//                 <input
//                   type="text"
//                   value={draft.slug}
//                   onChange={(event) => {
//                     updateDraft(
//                       "slug",
//                       normalizeSlug(
//                         event.target.value,
//                       ),
//                     );
//                   }}
//                   maxLength={60}
//                   placeholder="your-page"
//                   className="min-h-11 min-w-0 flex-1 bg-transparent px-2.5 text-sm text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-soft)]"
//                 />
//               </div>
//             </Field>

//             <Field
//               label="Email"
//               icon={Mail}
//             >
//               <input
//                 type="email"
//                 value={draft.email}
//                 onChange={(event) => {
//                   updateDraft(
//                     "email",
//                     event.target.value.slice(
//                       0,
//                       320,
//                     ),
//                   );
//                 }}
//                 maxLength={320}
//                 placeholder="you@company.com"
//                 className="dashboard-input"
//               />
//             </Field>

//             <Field
//               label="Phone"
//               icon={Phone}
//             >
//               <input
//                 type="tel"
//                 value={draft.phone}
//                 onChange={(event) => {
//                   updateDraft(
//                     "phone",
//                     event.target.value.slice(
//                       0,
//                       30,
//                     ),
//                   );
//                 }}
//                 maxLength={30}
//                 placeholder="+1..."
//                 className="dashboard-input"
//               />
//             </Field>
//           </div>

//           <div className="mt-3 flex flex-wrap items-center gap-2">
//             <span className="text-[11px] font-semibold text-[var(--dash-muted)]">
//               Optional details:
//             </span>

//             {!draft.optionalFields.includes(
//               "internalName",
//             ) ? (
//               <button
//                 type="button"
//                 onClick={() => {
//                   addOptionalField(
//                     "internalName",
//                   );
//                 }}
//                 className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-2.5 text-[10px] font-bold text-[var(--dash-muted)] transition hover:border-[var(--dash-border-strong)]"
//               >
//                 <Plus className="h-3 w-3" />
//                 Internal page name
//               </button>
//             ) : null}

//             {!draft.optionalFields.includes(
//               "introduction",
//             ) ? (
//               <button
//                 type="button"
//                 onClick={() => {
//                   addOptionalField(
//                     "introduction",
//                   );
//                 }}
//                 className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-2.5 text-[10px] font-bold text-[var(--dash-muted)] transition hover:border-[var(--dash-border-strong)]"
//               >
//                 <Plus className="h-3 w-3" />
//                 Short introduction
//               </button>
//             ) : null}
//           </div>

//           {draft.optionalFields.includes(
//             "internalName",
//           ) ? (
//             <OptionalFieldRow
//               label="Internal page name"
//               onRemove={() => {
//                 removeOptionalField(
//                   "internalName",
//                 );
//               }}
//             >
//               <input
//                 type="text"
//                 value={draft.internalName}
//                 onChange={(event) => {
//                   updateDraft(
//                     "internalName",
//                     event.target.value.slice(
//                       0,
//                       80,
//                     ),
//                   );
//                 }}
//                 maxLength={80}
//                 placeholder="Only visible in your dashboard"
//                 className="dashboard-input"
//               />
//             </OptionalFieldRow>
//           ) : null}

//           {draft.optionalFields.includes(
//             "introduction",
//           ) ? (
//             <OptionalFieldRow
//               label="Short introduction"
//               onRemove={() => {
//                 removeOptionalField(
//                   "introduction",
//                 );
//               }}
//             >
//               <textarea
//                 value={draft.introduction}
//                 onChange={(event) => {
//                   updateDraft(
//                     "introduction",
//                     event.target.value.slice(
//                       0,
//                       180,
//                     ),
//                   );
//                 }}
//                 maxLength={180}
//                 rows={2}
//                 placeholder="Optional public introduction"
//                 className="dashboard-input min-h-[70px] resize-none py-2.5"
//               />
//             </OptionalFieldRow>
//           ) : null}

//           <div className="mt-4 border-t border-[var(--dash-border)] pt-3.5">
//             <div className="flex items-center justify-between gap-3">
//               <div>
//                 <h3 className="text-xs font-bold">
//                   Additional social links
//                 </h3>

//                 <p className="mt-0.5 text-[10px] text-[var(--dash-muted)]">
//                   Optional. Add only the platforms you need.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={addSocialLink}
//                 className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-2.5 text-[10px] font-bold transition hover:border-[var(--dash-border-strong)]"
//               >
//                 <Plus className="h-3.5 w-3.5" />
//                 Add link
//               </button>
//             </div>

//             {draft.links.length > 0 ? (
//               <div className="dashboard-scrollbar mt-3 max-h-[145px] space-y-2 overflow-y-auto pr-1">
//                 {draft.links.map((link) => (
//                   <div
//                     key={link.id}
//                     className="grid gap-2 sm:grid-cols-[135px_minmax(0,1fr)_40px]"
//                   >
//                     <div className="relative">
//                       <select
//                         value={link.platform}
//                         onChange={(event) => {
//                           updateSocialLink(
//                             link.id,
//                             {
//                               platform:
//                                 event.target
//                                   .value as SocialPlatform,
//                             },
//                           );
//                         }}
//                         className="dashboard-input appearance-none pr-8"
//                       >
//                         {platformOptions.map(
//                           (option) => (
//                             <option
//                               key={option.value}
//                               value={option.value}
//                             >
//                               {option.value}
//                             </option>
//                           ),
//                         )}
//                       </select>

//                       <ChevronDown
//                         className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--dash-soft)]"
//                         aria-hidden="true"
//                       />
//                     </div>

//                     <input
//                       type="url"
//                       value={link.url}
//                       onChange={(event) => {
//                         updateSocialLink(
//                           link.id,
//                           {
//                             url:
//                               event.target.value.slice(
//                                 0,
//                                 500,
//                               ),
//                           },
//                         );
//                       }}
//                       maxLength={500}
//                       placeholder="https://..."
//                       className="dashboard-input"
//                     />

//                     <button
//                       type="button"
//                       aria-label={`Remove ${link.platform}`}
//                       onClick={() => {
//                         removeSocialLink(
//                           link.id,
//                         );
//                       }}
//                       className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-soft)] transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-500"
//                     >
//                       <X
//                         className="h-3.5 w-3.5"
//                         aria-hidden="true"
//                       />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="mt-3 rounded-xl border border-dashed border-[var(--dash-border)] px-3 py-3 text-center text-[10px] text-[var(--dash-muted)]">
//                 No social links added.
//               </div>
//             )}
//           </div>

//           <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px_165px] sm:items-end">
//             <div>
//               <p className="text-[10px] font-bold text-[var(--dash-muted)]">
//                 Style
//               </p>

//               <div className="mt-1.5 grid grid-cols-3 gap-1.5">
//                 {(
//                   [
//                     "aurora",
//                     "ocean",
//                     "plum",
//                   ] as const
//                 ).map((theme) => (
//                   <button
//                     key={theme}
//                     type="button"
//                     aria-pressed={
//                       draft.theme === theme
//                     }
//                     onClick={() => {
//                       updateDraft(
//                         "theme",
//                         theme,
//                       );
//                     }}
//                     className={[
//                       "rounded-lg border p-1.5 transition",
//                       draft.theme === theme
//                         ? "border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]"
//                         : "border-[var(--dash-border)] bg-[var(--dash-surface)]",
//                     ].join(" ")}
//                   >
//                     <span
//                       className={[
//                         "block h-5 rounded-md bg-gradient-to-r",
//                         previewThemeClasses[
//                           theme
//                         ],
//                       ].join(" ")}
//                     />

//                     <span className="mt-1 block text-[8px] font-bold capitalize text-[var(--dash-muted)]">
//                       {theme}
//                     </span>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <label>
//               <span className="mb-1.5 block text-[10px] font-bold text-[var(--dash-muted)]">
//                 Status
//               </span>

//               <div className="relative">
//                 <select
//                   value={draft.status}
//                   onChange={(event) => {
//                     updateDraft(
//                       "status",
//                       event.target
//                         .value as SharePageStatus,
//                     );
//                   }}
//                   className="dashboard-input appearance-none pr-8"
//                 >
//                   <option value="draft">
//                     Draft
//                   </option>

//                   <option value="published">
//                     Published
//                   </option>
//                 </select>

//                 <ChevronDown
//                   className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--dash-soft)]"
//                   aria-hidden="true"
//                 />
//               </div>
//             </label>

//             <button
//               type="button"
//               onClick={savePage}
//               className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--dash-accent)] px-4 text-xs font-bold text-white shadow-[0_16px_35px_-20px_rgba(91,76,230,0.72)] transition hover:brightness-105"
//             >
//               <Save
//                 className="h-4 w-4"
//                 aria-hidden="true"
//               />

//               {draft.id
//                 ? "Save changes"
//                 : "Save page"}
//             </button>
//           </div>

//           {message ? (
//             <p
//               className={[
//                 "mt-3 rounded-lg border px-3 py-2 text-xs",
//                 message ===
//                 "Share Page saved."
//                   ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600"
//                   : "border-rose-400/20 bg-rose-400/10 text-rose-500",
//               ].join(" ")}
//               role="status"
//             >
//               {message}
//             </p>
//           ) : null}
//         </div>

//         <div className="flex items-center justify-center bg-[var(--dash-preview-area)] p-4">
//           <div className="w-full max-w-[250px]">
//             <div className="mb-2 flex items-center justify-between">
//               <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[var(--dash-soft)]">
//                 Preview
//               </p>

//               <span className="rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-0.5 text-[8px] font-bold capitalize text-[var(--dash-muted)]">
//                 {draft.status}
//               </span>
//             </div>

//             <div
//               className={[
//                 "share-preview-glow relative overflow-hidden rounded-[25px] bg-gradient-to-br p-px shadow-xl",
//                 previewThemeClasses[
//                   draft.theme
//                 ],
//               ].join(" ")}
//             >
//               <div className="relative min-h-[320px] overflow-hidden rounded-[24px] bg-[#f5f6ff]/95 px-3.5 py-5 text-[#1b2140]">
//                 <span
//                   className={[
//                     "mx-auto grid h-14 w-14 place-items-center rounded-[17px] bg-gradient-to-br text-base font-black text-white",
//                     previewThemeClasses[
//                       draft.theme
//                     ],
//                   ].join(" ")}
//                 >
//                   {getInitials(
//                     draft.displayName,
//                   )}
//                 </span>

//                 <h3 className="mt-3 truncate text-center text-lg font-black tracking-[-0.04em]">
//                   {draft.displayName ||
//                     "Your public name"}
//                 </h3>

//                 {draft.optionalFields.includes(
//                   "introduction",
//                 ) &&
//                 draft.introduction.trim() ? (
//                   <p className="mt-1.5 line-clamp-2 text-center text-[11px] leading-4 text-[#6f7893]">
//                     {draft.introduction}
//                   </p>
//                 ) : null}

//                 <div className="mt-4 space-y-1.5">
//                   {previewLinks
//                     .slice(0, 5)
//                     .map((link) => {
//                       const Icon = link.icon;

//                       return (
//                         <div
//                           key={link.id}
//                           className="flex min-h-9 items-center gap-2.5 rounded-xl border border-[#dce1f1] bg-white/85 px-3 shadow-sm"
//                         >
//                           <Icon
//                             className="h-3.5 w-3.5 shrink-0 text-[#6d61db]"
//                             aria-hidden="true"
//                           />

//                           <span className="min-w-0 flex-1 truncate text-[10px] font-bold">
//                             {link.label}
//                           </span>

//                           <ExternalLink
//                             className="h-3 w-3 shrink-0 text-[#9aa3bb]"
//                             aria-hidden="true"
//                           />
//                         </div>
//                       );
//                     })}

//                   {previewLinks.length ===
//                   0 ? (
//                     <div className="rounded-xl border border-dashed border-[#cfd6e9] px-3 py-5 text-center text-[10px] text-[#8a93ab]">
//                       Add contact or social links.
//                     </div>
//                   ) : null}
//                 </div>

//                 <p className="mt-4 truncate text-center text-[8px] font-bold uppercase tracking-[0.1em] text-[#a0a8bc]">
//                   {publicUrl}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="border-t border-[var(--dash-border)] px-4 py-3.5">
//         <div className="flex items-center justify-between gap-3">
//           <div>
//             <h3 className="text-xs font-bold">
//               Your Share Pages
//             </h3>

//             <p className="mt-0.5 text-[9px] text-[var(--dash-muted)]">
//               Select a saved page to manage it.
//             </p>
//           </div>

//           <span className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-2 py-0.5 text-[9px] font-bold text-[var(--dash-muted)]">
//             {pages.length}
//           </span>
//         </div>

//         <div className="dashboard-scrollbar mt-2.5 max-h-[175px] space-y-2 overflow-y-auto pr-1">
//           {pages.map((page) => {
//             const expanded =
//               expandedPageId === page.id;

//             return (
//               <article
//                 key={page.id}
//                 className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)]"
//               >
//                 <button
//                   type="button"
//                   aria-expanded={expanded}
//                   onClick={() => {
//                     setExpandedPageId(
//                       expanded
//                         ? null
//                         : page.id,
//                     );
//                   }}
//                   className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-[var(--dash-surface-hover)]"
//                 >
//                   <span
//                     className={[
//                       "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-[10px] font-black text-white",
//                       previewThemeClasses[
//                         page.theme
//                       ],
//                     ].join(" ")}
//                   >
//                     {getInitials(
//                       page.displayName,
//                     )}
//                   </span>

//                   <div className="min-w-0 flex-1">
//                     <div className="flex items-center gap-2">
//                       <p className="truncate text-xs font-bold">
//                         {getSavedPageTitle(
//                           page,
//                         )}
//                       </p>

//                       <span
//                         className={[
//                           "rounded-full border px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.06em]",
//                           page.status ===
//                           "published"
//                             ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600"
//                             : "border-amber-400/20 bg-amber-400/10 text-amber-600",
//                         ].join(" ")}
//                       >
//                         {page.status}
//                       </span>
//                     </div>

//                     <p className="mt-0.5 truncate text-[9px] text-[var(--dash-muted)]">
//                       intakeio.app/s/
//                       {page.slug}
//                     </p>
//                   </div>

//                   <p className="hidden text-[8px] text-[var(--dash-soft)] sm:block">
//                     {formatUpdatedAt(
//                       page.updatedAt,
//                     )}
//                   </p>

//                   <ChevronDown
//                     className={[
//                       "h-3.5 w-3.5 shrink-0 text-[var(--dash-soft)] transition-transform",
//                       expanded
//                         ? "rotate-180"
//                         : "",
//                     ].join(" ")}
//                     aria-hidden="true"
//                   />
//                 </button>

//                 {expanded ? (
//                   <div className="dashboard-expand-enter flex flex-wrap items-center justify-between gap-2 border-t border-[var(--dash-border)] px-3 py-2.5">
//                     <div className="flex flex-wrap gap-1.5">
//                       {page.links
//                         .slice(0, 5)
//                         .map((link) => (
//                           <span
//                             key={link.id}
//                             className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-0.5 text-[8px] font-bold text-[var(--dash-muted)]"
//                           >
//                             {link.platform}
//                           </span>
//                         ))}
//                     </div>

//                     <div className="flex gap-1.5">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           void copyPublicLink(
//                             page,
//                           );
//                         }}
//                         className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2.5 text-[9px] font-bold"
//                       >
//                         {copiedPageId ===
//                         page.id ? (
//                           <Check className="h-3 w-3 text-emerald-500" />
//                         ) : (
//                           <Copy className="h-3 w-3" />
//                         )}

//                         {copiedPageId ===
//                         page.id
//                           ? "Copied"
//                           : "Copy"}
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() => {
//                           editPage(page);
//                         }}
//                         className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--dash-accent)] px-2.5 text-[9px] font-bold text-white"
//                       >
//                         <Pencil className="h-3 w-3" />
//                         Edit
//                       </button>
//                     </div>
//                   </div>
//                 ) : null}
//               </article>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }

// type FieldProps = Readonly<{
//   label: string;
//   icon: LucideIcon;
//   children: ReactNode;
// }>;

// function Field({
//   label,
//   icon: Icon,
//   children,
// }: FieldProps) {
//   return (
//     <label>
//       <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold text-[var(--dash-muted)]">
//         <Icon
//           className="h-3.5 w-3.5 text-[var(--dash-accent)]"
//           aria-hidden="true"
//         />

//         {label}
//       </span>

//       {children}
//     </label>
//   );
// }

// type OptionalFieldRowProps = Readonly<{
//   label: string;
//   children: ReactNode;
//   onRemove: () => void;
// }>;

// function OptionalFieldRow({
//   label,
//   children,
//   onRemove,
// }: OptionalFieldRowProps) {
//   return (
//     <div className="mt-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] p-3">
//       <div className="mb-2 flex items-center justify-between gap-3">
//         <p className="text-[10px] font-bold text-[var(--dash-muted)]">
//           {label}
//         </p>

//         <button
//           type="button"
//           aria-label={`Remove ${label}`}
//           onClick={onRemove}
//           className="grid h-6 w-6 place-items-center rounded-md text-[var(--dash-soft)] transition hover:bg-rose-400/10 hover:text-rose-500"
//         >
//           <X className="h-3.5 w-3.5" />
//         </button>
//       </div>

//       {children}
//     </div>
//   );
// }