import type { ReactNode } from "react";
import {
  Instrument_Serif,
  Inter,
} from "next/font/google";

import "../../[publicUserId]/form/form.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-intake-sans",
  display: "swap",
});

type PublicProposalLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function PublicProposalLayout({
  children,
}: PublicProposalLayoutProps) {
  return (
    <div
      className={`${inter.variable} ${inter.className} ${instrumentSerif.variable} intake-form-page`}
    >
      {children}
    </div>
  );
}
