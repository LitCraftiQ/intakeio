import type { Metadata } from "next";
import Link from "next/link";

import { ProposalCreatePicker } from
  "@/components/dashboard/proposal-create-picker";
import { getOwnedContacts } from
  "@/lib/contacts/queries";

export const metadata: Metadata = {
  title: "New proposal",
};

export const dynamic = "force-dynamic";

type NewProposalPageProps = Readonly<{
  searchParams: Promise<{
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

export default async function NewProposalPage({
  searchParams,
}: NewProposalPageProps) {
  const parameters = await searchParams;
  const contacts = await getOwnedContacts();
  const contactId = getSingleParameter(
    parameters.contact,
  ).slice(0, 100);

  const selectedContactId = contacts.some(
    (contact) => contact.id === contactId,
  )
    ? contactId
    : null;

  return (
    <div className="dashboard-page-enter mx-auto w-full max-w-[1540px]">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-5 py-5 shadow-[var(--dash-card-shadow)] sm:px-6">
        <Link
          href="/dashboard/proposals"
          className="text-xs font-bold text-[var(--dash-accent)]"
        >
          All proposals
        </Link>

        <h1 className="mt-3 text-2xl font-black tracking-[-0.05em] sm:text-3xl">
          New proposal
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--dash-muted)]">
          Review the submission, then write the proposal yourself or draft it from the intake form.
        </p>
      </section>

      <div className="mt-6">
        <ProposalCreatePicker
          contacts={contacts}
          selectedContactId={selectedContactId}
        />
      </div>
    </div>
  );
}
