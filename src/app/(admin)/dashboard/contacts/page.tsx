import type {
    Metadata,
  } from "next";
  
  import { ContactsWorkspace } from
    "@/components/dashboard/contacts-workspace";
  import { getOwnedContacts } from
    "@/lib/contacts/queries";
  
  export const metadata: Metadata = {
    title: "Contacts",
  };
  
  export const dynamic = "force-dynamic";
  
  type ContactsPageProps = Readonly<{
    searchParams: Promise<{
      q?: string | string[];
      contact?: string | string[];
    }>;
  }>;
  
  function getSingleParameter(
    value: string | string[] | undefined,
  ) {
    if (typeof value === "string") {
      return value;
    }
  
    if (Array.isArray(value)) {
      return value[0] ?? "";
    }
  
    return "";
  }
  
  export default async function ContactsPage({
    searchParams,
  }: ContactsPageProps) {
    const parameters = await searchParams;
  
    const initialQuery =
      getSingleParameter(
        parameters.q,
      ).slice(0, 120);
  
    const contactId =
      getSingleParameter(
        parameters.contact,
      ).slice(0, 100);
  
    const contacts = await getOwnedContacts();
  
    return (
      <ContactsWorkspace
        contacts={contacts}
        initialQuery={initialQuery}
        initialContactId={
          contactId || null
        }
      />
    );
  }