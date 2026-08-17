import type { ReactNode } from "react";
import {
  Instrument_Serif,
  Inter,
} from "next/font/google";

import "./form.css";

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

type IntakeFormLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function IntakeFormLayout({
  children,
}: IntakeFormLayoutProps) {
  return (
    <div
      className={`${inter.variable} ${inter.className} ${instrumentSerif.variable} intake-form-page`}
    >
      {children}
    </div>
  );
}
