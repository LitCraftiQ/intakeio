export function IntakeFormHeader() {
  return (
    <header className="animate-fade-up">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
          Business inquiry
        </p>
        <h1
          className="mt-3 text-[2.2rem] leading-[1.05] tracking-tight sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Project intake
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Share your company and project details. We use this to review the
          request, assign the right person, and follow up with next steps.
        </p>
      </div>
    </header>
  );
}
