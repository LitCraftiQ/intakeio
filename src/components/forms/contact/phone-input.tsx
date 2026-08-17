"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import {
  COUNTRIES,
  type CountryEntry,
} from "@/lib/countries";
import { cn } from "@/lib/utils";

type PhoneInputProps = Readonly<{
  countryCode: string;
  onCountryChange: (code: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  invalid?: boolean;
}>;

export function PhoneInput({
  countryCode,
  onCountryChange,
  value,
  onValueChange,
  id,
  invalid,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const country = useMemo(
    () =>
      COUNTRIES.find(
        (entry) => entry.code === countryCode,
      ) ?? COUNTRIES[0],
    [countryCode],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return COUNTRIES;
    }

    return COUNTRIES.filter(
      (entry) =>
        entry.name.toLowerCase().includes(
          normalized,
        ) ||
        entry.dialCode.includes(normalized) ||
        entry.code.toLowerCase().includes(
          normalized,
        ),
    );
  }, [query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onClick(event: MouseEvent) {
      if (
        !wrapRef.current?.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      onClick,
    );
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener(
        "mousedown",
        onClick,
      );
      document.removeEventListener(
        "keydown",
        onKey,
      );
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={cn(
          "glass-input flex items-stretch rounded-xl overflow-hidden",
          invalid && "border-destructive/60",
        )}
      >
        <button
          type="button"
          onClick={() =>
            setOpen((current) => !current)
          }
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex shrink-0 items-center gap-2 border-r border-white/10 px-3 transition-colors hover:bg-white/5 focus:outline-none focus-visible:bg-white/10"
        >
          <span className="text-lg leading-none">
            {country.flag}
          </span>
          <span className="text-sm tabular-nums text-muted-foreground">
            +{country.dialCode}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={value}
          onChange={(event) =>
            onValueChange(event.target.value)
          }
          placeholder="801 234 5678"
          className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {open ? (
        <div className="absolute z-50 mt-2 w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.18_0.04_275)]/95 shadow-2xl backdrop-blur-2xl animate-fade-up">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search country or code…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <ul
            role="listbox"
            className="max-h-72 overflow-y-auto py-1"
          >
            {filtered.map((entry: CountryEntry) => {
              const selected =
                entry.code === country.code;

              return (
                <li key={entry.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onCountryChange(entry.code);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-white/5",
                      selected && "bg-white/5",
                    )}
                  >
                    <span className="text-lg leading-none">
                      {entry.flag}
                    </span>
                    <span className="flex-1 truncate">
                      {entry.name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      +{entry.dialCode}
                    </span>
                    {selected ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : null}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No matches
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
