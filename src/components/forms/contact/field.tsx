import type { ReactNode } from "react";

type FieldProps = Readonly<{
  children: ReactNode;
  span?: 1 | 2;
}>;

export function Field({
  children,
  span,
}: FieldProps) {
  return (
    <div
      className={
        span === 2
          ? "sm:col-span-2"
          : undefined
      }
    >
      {children}
    </div>
  );
}
