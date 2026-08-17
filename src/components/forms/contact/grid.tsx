import type { ReactNode } from "react";

type GridProps = Readonly<{
  children: ReactNode;
}>;

export function Grid({ children }: GridProps) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
      {children}
    </div>
  );
}
