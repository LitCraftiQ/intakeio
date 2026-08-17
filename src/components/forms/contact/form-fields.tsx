import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

export function FieldLabel({
  htmlFor,
  children,
  required,
  hint,
}: {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-medium tracking-wide text-foreground/85"
      >
        {children}
        {required ? (
          <span className="ml-1 text-primary/80">
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <span className="text-[11px] text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function FieldError({
  children,
}: {
  children?: ReactNode;
}) {
  if (!children) {
    return null;
  }

  return (
    <p
      className="mt-1.5 text-[12px] text-destructive/90"
      role="alert"
    >
      {children}
    </p>
  );
}

type InputProps =
  InputHTMLAttributes<HTMLInputElement> & {
    invalid?: boolean;
  };

export const TextField = forwardRef<
  HTMLInputElement,
  InputProps
>(function TextField(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "glass-input w-full rounded-xl px-3.5 py-3 text-[15px] text-foreground placeholder:text-muted-foreground transition-colors",
        "focus:outline-none focus:border-primary/60 focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_oklch(0.72_0.16_265/0.14)]",
        invalid && "border-destructive/60",
        className,
      )}
      {...rest}
    />
  );
});

type TextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    invalid?: boolean;
  };

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(function TextArea(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "glass-input w-full resize-y rounded-xl px-3.5 py-3 text-[15px] text-foreground placeholder:text-muted-foreground transition-colors",
        "focus:outline-none focus:border-primary/60 focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_oklch(0.72_0.16_265/0.14)]",
        invalid && "border-destructive/60",
        className,
      )}
      {...rest}
    />
  );
});
