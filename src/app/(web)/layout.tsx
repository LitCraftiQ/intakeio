import type { ReactNode } from "react";

type MarketingLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>{children}</main>
    </div>
  );
}