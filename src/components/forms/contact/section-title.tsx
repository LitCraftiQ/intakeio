type SectionTitleProps = Readonly<{
  eyebrow: string;
  title: string;
  subtitle?: string;
}>;

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: SectionTitleProps) {
  return (
    <div className="mb-6">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/80">
        {eyebrow}
      </p>

      <h3
        className="mt-1.5 text-xl sm:text-2xl tracking-tight text-foreground"
        style={{
          fontFamily: "var(--font-display)",
        }}
      >
        {title}
      </h3>

      {subtitle ? (
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
