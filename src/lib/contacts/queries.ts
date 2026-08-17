import { createClient } from
  "@/lib/supabase/server";
import type {
  ContactStatus,
  ContactSubmission,
} from "@/lib/dashboard/types";

type RawContact = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  telegram_username: string | null;
  company_name: string | null;
  website: string | null;
  project_title: string | null;
  project_description: string | null;
  budget: string | null;
  preferred_contact_method: string | null;
  preferred_meeting_time: string | null;
  country_name: string | null;
  status: ContactStatus;
  private_notes: string | null;
  additional_information: string | null;
  submitted_at: string;
};

function mapContact(
  row: RawContact,
): ContactSubmission {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone_number ?? "",
    telegramUsername: row.telegram_username,
    companyName: row.company_name ?? "",
    website: row.website,
    projectTitle: row.project_title ?? "",
    projectDescription:
      row.project_description ?? "",
    budget: row.budget ?? "",
    preferredContactMethod:
      row.preferred_contact_method ?? "",
    preferredMeetingTime:
      row.preferred_meeting_time ?? "",
    country: row.country_name ?? "",
    status: row.status,
    privateNotes: row.private_notes,
    additionalInformation:
      row.additional_information,
    submittedAt: row.submitted_at,
  };
}

export async function getOwnedContacts(): Promise<
  ContactSubmission[]
> {
  const supabase = await createClient();

  const {
    data: userResult,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("contacts")
    .select(
      "id, full_name, email, phone_number, telegram_username, company_name, website, project_title, project_description, budget, preferred_contact_method, preferred_meeting_time, country_name, status, private_notes, additional_information, submitted_at",
    )
    .eq("owner_user_id", userResult.user.id)
    .order("submitted_at", {
      ascending: false,
    });

  if (error) {
    return [];
  }

  return (
    (data ?? []) as RawContact[]
  ).map(mapContact);
}
