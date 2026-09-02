"use client";

import { AboutYouSection } from "./about-you-section";
import { Divider } from "./divider";
import { ProjectSection } from "./project-section";
import { SubmitSection } from "./submit-section";
import { SuccessScreen } from "./success-screen";
import { useContactForm } from "./use-contact-form";

type ContactFormProps = Readonly<{
  publicOwnerId: string;
  leaveHref: string | null;
}>;

export function ContactForm({
  publicOwnerId,
  leaveHref,
}: ContactFormProps) {
  const form = useContactForm(publicOwnerId);

  return (
    <>
      <form
        onSubmit={form.onSubmit}
        noValidate
        className="glass-card animate-fade-up rounded-3xl p-6 sm:p-10"
      >
        <AboutYouSection form={form} />
        <Divider />
        <ProjectSection form={form} />
        <Divider />
        <SubmitSection form={form} />
      </form>

      {form.submitted ? (
        <SuccessScreen
          publicOwnerId={publicOwnerId}
          leaveHref={leaveHref}
          onDismiss={form.dismissSuccess}
        />
      ) : null}
    </>
  );
}
