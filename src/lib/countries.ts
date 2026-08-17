import { getCountries, getCountryCallingCode } from "libphonenumber-js";

// Country names via Intl.DisplayNames
const displayNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export type CountryEntry = {
  code: string; // ISO-2, e.g. "NG"
  name: string; // "Nigeria"
  dialCode: string; // "234"
  flag: string; // 🇳🇬
};

function flagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

export const COUNTRIES: CountryEntry[] = getCountries()
  .map((c) => {
    let dial = "";
    try {
      dial = getCountryCallingCode(c);
    } catch {
      return null;
    }
    return {
      code: c,
      name: displayNames?.of(c) ?? c,
      dialCode: dial,
      flag: flagEmoji(c),
    } as CountryEntry;
  })
  .filter((v): v is CountryEntry => v !== null)
  .sort((a, b) => a.name.localeCompare(b.name));

export const COUNTRY_BY_CODE: Record<string, CountryEntry> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c]),
);
