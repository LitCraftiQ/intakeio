import type {
    ContactStatus,
    ContactSubmission,
    PreferredContactMethod,
  } from "./types";
  
  const names = [
    "Amelia Foster",
    "Noah Bennett",
    "Maya Laurent",
    "Ethan Williams",
    "Sofia Martinez",
    "Liam Anderson",
    "Ava Thompson",
    "Lucas Bernard",
    "Chloe Morgan",
    "Daniel Okafor",
    "Emma Wilson",
    "Owen Richards",
    "Léa Tremblay",
    "James Walker",
    "Nora Ibrahim",
    "Benjamin Clark",
    "Camila Silva",
    "Adam Reynolds",
    "Zara Patel",
    "Samuel Martin",
    "Olivia Hughes",
    "Nathan Dubois",
    "Mia Johnson",
    "Gabriel Moreau",
  ] as const;
  
  const companies = [
    "Northstar Labs",
    "Velora Studio",
    "Arcline Partners",
    "Mosaic Health",
    "Cobalt Commerce",
    "Nimbus Legal",
    "Foundry Creative",
    "Sonder Consulting",
    "Harbor Digital",
    "Atlas Property Group",
    "Juniper Works",
    "Brightline Media",
    "Summit Advisory",
    "Cedar Technologies",
    "Lumen Finance",
    "Origin Architecture",
    "Monarch Services",
    "Solstice Ventures",
    "Oakwell Group",
    "Aperture Systems",
    "Meridian Foods",
    "Nova Education",
    "Kinship Collective",
    "Evergreen Operations",
  ] as const;
  
  const countries = [
    "Canada",
    "United States",
    "United Kingdom",
    "France",
    "Nigeria",
    "Germany",
    "Australia",
    "United Arab Emirates",
    "Singapore",
    "Spain",
  ] as const;
  
  const projectTitles = [
    "Client intake portal",
    "Website redesign",
    "Customer onboarding system",
    "Private consultation platform",
    "Digital service launch",
    "Lead qualification workflow",
    "Booking experience",
    "Internal operations dashboard",
    "Brand and website refresh",
    "Secure document intake",
    "Service automation project",
    "Analytics dashboard",
  ] as const;
  
  const projectDescriptions = [
    "We need a polished client experience that simplifies how new requests are collected and reviewed by our internal team.",
    "Our current process is spread across email and spreadsheets. We want one private and organized submission workflow.",
    "The project should feel modern, trustworthy, and simple for clients while giving our team a clear operational view.",
    "We are looking for a secure system that collects project requirements and makes follow-up easier for our staff.",
    "Our team needs a responsive platform that works well on mobile and keeps every submission easy to locate.",
    "We want to replace a manual process with a streamlined experience that is easier to manage and scale.",
  ] as const;
  
  const budgets = [
    "$1,000 – $2,500",
    "$2,500 – $5,000",
    "$5,000 – $10,000",
    "$10,000 – $20,000",
    "$20,000+",
    "To be discussed",
  ] as const;
  
  const meetingTimes = [
    "Weekday mornings",
    "Weekday afternoons",
    "After 5:00 PM",
    "Tuesday or Thursday",
    "Friday morning",
    "Flexible",
  ] as const;
  
  const contactMethods: PreferredContactMethod[] = [
    "Email",
    "Phone",
    "Telegram",
  ];
  
  const statuses: ContactStatus[] = [
    "pending",
    "pending",
    "contacted",
    "qualified",
    "contacted",
    "pending",
    "qualified",
    "archived",
  ];
  
  function slugify(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 28);
  }
  
  function createSubmittedAt(
    now: Date,
    index: number,
  ) {
    let elapsedMilliseconds: number;
  
    if (index < 8) {
      elapsedMilliseconds =
        (index + 1) * 42 * 60 * 1000;
    } else if (index < 26) {
      elapsedMilliseconds =
        (index - 6) *
        7 *
        60 *
        60 *
        1000;
    } else {
      elapsedMilliseconds =
        (index - 18) *
        17 *
        60 *
        60 *
        1000;
    }
  
    return new Date(
      now.getTime() - elapsedMilliseconds,
    ).toISOString();
  }
  
  export function createMockContacts(
    now = new Date(),
  ): ContactSubmission[] {
    const totalContacts = 78;
  
    return Array.from(
      {
        length: totalContacts,
      },
      (_, index): ContactSubmission => {
        const name =
          names[index % names.length];
  
        const company =
          companies[index % companies.length];
  
        const projectTitle =
          projectTitles[
            index % projectTitles.length
          ];
  
        const firstName =
          name.split(" ")[0]?.toLowerCase() ??
          "client";
  
        const lastName =
          name.split(" ")[1]?.toLowerCase() ??
          "contact";
  
        const duplicateNumber = Math.floor(
          index / names.length,
        );
  
        const emailSuffix =
          duplicateNumber > 0
            ? `${duplicateNumber + 1}`
            : "";
  
        const companySlug = slugify(company);
  
        const status =
          statuses[index % statuses.length];
  
        const telegramUsername =
          index % 3 === 0
            ? `@${slugify(
                `${firstName}${lastName}${emailSuffix}`,
              )}`
            : null;
  
        return {
          id: `contact-${String(
            index + 1,
          ).padStart(3, "0")}`,
  
          fullName: name,
  
          email: `${firstName}.${lastName}${emailSuffix}@${companySlug}.example`,
  
          phone: `+1 514 555 ${String(
            1200 + index,
          ).padStart(4, "0")}`,
  
          telegramUsername,
  
          companyName: company,
  
          website:
            index % 7 === 0
              ? null
              : `https://${companySlug}.example`,
  
          projectTitle,
  
          projectDescription:
            projectDescriptions[
              index %
                projectDescriptions.length
            ],
  
          budget:
            budgets[index % budgets.length],
  
          preferredContactMethod:
            contactMethods[
              index % contactMethods.length
            ],
  
          preferredMeetingTime:
            meetingTimes[
              index % meetingTimes.length
            ],
  
          country:
            countries[index % countries.length],
  
          status,
  
          privateNotes:
            status === "qualified"
              ? "Strong fit. Review the project scope and prepare a structured follow-up."
              : status === "contacted"
                ? "Initial response sent. Waiting for the client to confirm availability."
                : status === "archived"
                  ? "Archived after the client paused the project."
                  : index % 4 === 0
                    ? "Review the project description before the first response."
                    : null,

          additionalInformation: null,

          submittedAt: createSubmittedAt(
            now,
            index,
          ),
        };
      },
    ).sort(
      (first, second) =>
        new Date(
          second.submittedAt,
        ).getTime() -
        new Date(
          first.submittedAt,
        ).getTime(),
    );
  }