import { Link2Off } from "lucide-react";
import Link from "next/link";

export default function IntakeFormNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <section className="glass-card w-full max-w-md rounded-3xl p-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-white/5 text-primary">
          <Link2Off
            className="h-7 w-7"
            aria-hidden="true"
          />
        </span>

        <h1
          className="mt-5 text-2xl tracking-tight text-foreground"
          style={{
            fontFamily: "var(--font-display)",
          }}
        >
          This form is not available
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          The owner has not created their
          intake form link yet, or this
          address is incorrect.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Go home
        </Link>
      </section>
    </main>
  );
}
