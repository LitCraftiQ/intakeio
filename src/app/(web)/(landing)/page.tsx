import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { LandingHero } from "./landing-hero";

import "./landing.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

export default function LandingPage() {
  return (
    <div className={`${bodyFont.variable} ${displayFont.variable}`}>
      <LandingHero />
    </div>
  );
}