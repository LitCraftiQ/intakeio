import { DashboardOverview } from
  "@/components/dashboard/dashboard-overview";
import { getOwnedContacts } from
  "@/lib/contacts/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const contacts = await getOwnedContacts();

  return (
    <DashboardOverview
      contacts={contacts}
    />
  );
}
