import { cn } from "@/lib/utils";

type SelectFieldProps = Readonly<{
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
}>;

export function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder,
}: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "glass-input w-full appearance-none rounded-xl px-3.5 py-3 pr-10 text-[15px] transition-colors",
          "focus:outline-none focus:border-primary/60 focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_oklch(0.72_0.16_265/0.14)]",
          !value && "text-muted-foreground",
        )}
      >
        <option value="" disabled className="bg-[oklch(0.18_0.04_275)]">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-[oklch(0.18_0.04_275)] text-foreground"
          >
            {option}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      >
        <path
          d="M5 8l5 5 5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
