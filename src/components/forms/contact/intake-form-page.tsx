"use client";

import { AnimatedBackground } from
  "./animated-background";
import { ContactForm } from "./contact-form";
import { IntakeFormHeader } from
  "./intake-form-header";

type IntakeFormPageProps = Readonly<{
  publicOwnerId: string;
  leaveHref: string | null;
}>;

export function IntakeFormPage({
  publicOwnerId,
  leaveHref,
}: IntakeFormPageProps) {
  return (
    <>
      <AnimatedBackground />
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-10 sm:px-8 sm:py-16">
        <IntakeFormHeader />
        <div className="mt-10 sm:mt-14">
          <ContactForm
            publicOwnerId={publicOwnerId}
            leaveHref={leaveHref}
          />
        </div>
        <footer className="mt-14 flex items-center justify-between text-[12px] text-muted-foreground/70">
          <span>
            © {new Date().getFullYear()} Intakeio
          </span>
          <span className="tracking-wide">
            Encrypted &amp; confidential
          </span>
        </footer>
      </main>
    </>
  );
}
