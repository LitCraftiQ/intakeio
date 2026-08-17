"use client";

import {
  ArrowLeft,
  Check,
  LoaderCircle,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
  useActionState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ResendEmailOtpState,
  VerifyEmailOtpState,
} from "@/lib/auth/otp-action-types";

import {
  resendEmailOtp,
  verifyEmailOtp,
} from "./actions";

const OTP_RESEND_SECONDS = 60;
const SLOT_COUNT = 6;
const FOLD_MS = 520;
const SUCCESS_HOLD_MS = 2200;

const SPARKS = [
  { x: "-2.4rem", y: "-1.8rem" },
  { x: "2.6rem", y: "-2rem" },
  { x: "-2.8rem", y: "0.4rem" },
  { x: "2.9rem", y: "0.2rem" },
  { x: "-1.6rem", y: "2.2rem" },
  { x: "1.8rem", y: "2.4rem" },
  { x: "0.2rem", y: "-2.6rem" },
  { x: "-0.4rem", y: "2.7rem" },
] as const;

const initialVerifyState: VerifyEmailOtpState = {
  status: "idle",
  message: "",
  destination: null,
};

const initialResendState: ResendEmailOtpState = {
  status: "idle",
  message: "",
  cooldownSeconds: OTP_RESEND_SECONDS,
};

type OtpVerificationFormProps = Readonly<{
  maskedEmail: string;
}>;

type SlotPoint = Readonly<{
  x: number;
  y: number;
}>;

function getLayoutMetrics(stage: HTMLElement | null) {
  const styles = stage
    ? getComputedStyle(stage)
    : null;

  const slot = Number.parseFloat(
    styles?.getPropertyValue("--otp-slot") || "58",
  );
  const gap = Number.parseFloat(
    styles?.getPropertyValue("--otp-gap") || "12",
  );
  const stageWidth = Number.parseFloat(
    styles?.getPropertyValue("--otp-stage-w") || "408",
  );
  const stageHeight = Number.parseFloat(
    styles?.getPropertyValue("--otp-stage-h") || "128",
  );
  const step = slot + gap;

  return {
    slot,
    gap,
    step,
    stageWidth,
    stageHeight,
  };
}

function getRowPoint(
  index: number,
  metrics: ReturnType<typeof getLayoutMetrics>,
): SlotPoint {
  return {
    x: index * metrics.step,
    y: (metrics.stageHeight - metrics.slot) / 2,
  };
}

function getGridPoint(
  index: number,
  metrics: ReturnType<typeof getLayoutMetrics>,
): SlotPoint {
  const gridWidth = 3 * metrics.slot + 2 * metrics.gap;
  const offsetX = (metrics.stageWidth - gridWidth) / 2;

  return {
    x: offsetX + (index % 3) * metrics.step,
    y: Math.floor(index / 3) * metrics.step,
  };
}

function getWirePath(
  metrics: ReturnType<typeof getLayoutMetrics>,
) {
  const points = Array.from(
    { length: SLOT_COUNT },
    (_, index) => {
      const point = getGridPoint(index, metrics);
      return {
        x: point.x + metrics.slot / 2,
        y: point.y + metrics.slot / 2,
      };
    },
  );

  const [a, b, c, d, e, f] = points;

  return [
    `M ${a.x} ${a.y} H ${b.x} H ${c.x}`,
    `M ${c.x} ${c.y} V ${f.y}`,
    `M ${f.x} ${f.y} H ${e.x} H ${d.x}`,
    `M ${d.x} ${d.y} V ${a.y}`,
  ].join(" ");
}

function prefersReducedMotion() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
}

export function OtpVerificationForm({
  maskedEmail,
}: OtpVerificationFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Array<HTMLLabelElement | null>>(
    [],
  );
  const inputRefs = useRef<Array<HTMLInputElement | null>>(
    [],
  );
  const foldedRef = useRef(false);

  const [digits, setDigits] = useState(
    Array.from({ length: SLOT_COUNT }, () => ""),
  );
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [lastSubmittedToken, setLastSubmittedToken] =
    useState("");
  const [editedAfterError, setEditedAfterError] =
    useState(false);
  const [countdown, setCountdown] = useState(
    OTP_RESEND_SECONDS,
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const [verifyState, verifyAction, verifying] =
    useActionState(verifyEmailOtp, initialVerifyState);
  const [resendState, resendAction, resending] =
    useActionState(resendEmailOtp, initialResendState);

  const token = useMemo(() => digits.join(""), [digits]);
  const verified = verifyState.status === "success";
  const showingError =
    verifyState.status === "error" && !editedAfterError;
  const wired =
    (token.length === SLOT_COUNT && !showingError) ||
    verified;
  const wirePath = useMemo(
    () => getWirePath(getLayoutMetrics(null)),
    [],
  );

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [countdown]);

  useEffect(() => {
    if (resendState.status === "sent") {
      setCountdown(resendState.cooldownSeconds);
    }

    if (
      resendState.status === "error" &&
      resendState.cooldownSeconds > 0
    ) {
      setCountdown(resendState.cooldownSeconds);
    }
  }, [resendState]);

  useLayoutEffect(() => {
    const metrics = getLayoutMetrics(stageRef.current);

    slotRefs.current.forEach((slot, index) => {
      if (!slot) {
        return;
      }

      const point = wired
        ? getGridPoint(index, metrics)
        : getRowPoint(index, metrics);

      slot.style.transform =
        `translate(${point.x}px, ${point.y}px)`;
    });

    foldedRef.current = wired;
  }, []);

  useEffect(() => {
    const metrics = getLayoutMetrics(stageRef.current);
    const shouldFold = wired;

    if (foldedRef.current === shouldFold) {
      return;
    }

    foldedRef.current = shouldFold;
    const reduced = prefersReducedMotion();
    const centerX = metrics.stageWidth / 2 - metrics.slot / 2;
    const centerY = metrics.stageHeight / 2 - metrics.slot / 2;
    const angle = (42 * Math.PI) / 180;

    slotRefs.current.forEach((slot, index) => {
      if (!slot) {
        return;
      }

      const from = shouldFold
        ? getRowPoint(index, metrics)
        : getGridPoint(index, metrics);
      const to = shouldFold
        ? getGridPoint(index, metrics)
        : getRowPoint(index, metrics);
      const rx = from.x - centerX;
      const ry = from.y - centerY;
      const midX =
        centerX +
        (rx * Math.cos(angle) - ry * Math.sin(angle));
      const midY =
        centerY +
        (rx * Math.sin(angle) + ry * Math.cos(angle));

      if (reduced) {
        slot.style.transform =
          `translate(${to.x}px, ${to.y}px)`;
        return;
      }

      slot.animate(
        [
          {
            transform:
              `translate(${from.x}px, ${from.y}px)`,
          },
          {
            transform:
              `translate(${midX}px, ${midY}px) rotate(22deg)`,
            offset: 0.46,
          },
          {
            transform: `translate(${to.x}px, ${to.y}px)`,
          },
        ],
        {
          duration: FOLD_MS,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        },
      );
    });
  }, [wired]);

  useEffect(() => {
    if (
      token.length !== SLOT_COUNT ||
      verifying ||
      verified ||
      token === lastSubmittedToken
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      formRef.current?.requestSubmit();
    }, FOLD_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    token,
    verifying,
    verified,
    lastSubmittedToken,
  ]);

  useEffect(() => {
    if (verifyState.status !== "success") {
      return;
    }

    const revealTimer = window.setTimeout(() => {
      setShowSuccess(true);
    }, 640);

    return () => {
      window.clearTimeout(revealTimer);
    };
  }, [verifyState.status]);

  useEffect(() => {
    if (
      !showSuccess ||
      !verifyState.destination
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace(verifyState.destination!);
      router.refresh();
    }, SUCCESS_HOLD_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [router, showSuccess, verifyState.destination]);

  useEffect(() => {
    if (verifyState.status === "error") {
      setEditedAfterError(false);
      setShowSuccess(false);
      inputRefs.current[SLOT_COUNT - 1]?.focus();
    }
  }, [verifyState]);

  function applyDigits(startIndex: number, value: string) {
    const incomingDigits = value
      .replace(/\D/g, "")
      .slice(0, SLOT_COUNT - startIndex);

    if (!incomingDigits) {
      return;
    }

    const nextDigits = [...digits];

    incomingDigits.split("").forEach((digit, offset) => {
      nextDigits[startIndex + offset] = digit;
    });

    setDigits(nextDigits);
    setEditedAfterError(true);

    const nextIndex = Math.min(
      startIndex + incomingDigits.length,
      SLOT_COUNT - 1,
    );

    inputRefs.current[nextIndex]?.focus();
  }

  function handleChange(index: number, value: string) {
    const numericValue = value.replace(/\D/g, "");

    if (numericValue.length > 1) {
      applyDigits(index, numericValue);
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = numericValue.slice(-1);
    setDigits(nextDigits);
    setEditedAfterError(true);

    if (numericValue && index < SLOT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < SLOT_COUNT - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(
    event: ClipboardEvent<HTMLInputElement>,
  ) {
    event.preventDefault();

    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, SLOT_COUNT);

    if (!pastedDigits) {
      return;
    }

    setDigits(
      Array.from(
        { length: SLOT_COUNT },
        (_, index) => pastedDigits[index] ?? "",
      ),
    );
    setEditedAfterError(true);
    inputRefs.current[
      Math.min(pastedDigits.length, SLOT_COUNT - 1)
    ]?.focus();
  }

  function goToDestination() {
    if (!verifyState.destination) {
      return;
    }

    router.replace(verifyState.destination);
    router.refresh();
  }

  return (
    <main className="otp-page relative isolate grid min-h-[100svh] place-items-center overflow-hidden px-4 py-8 text-white sm:px-6">
      <section
        className="otp-sheet relative z-10 p-6 sm:p-8"
        data-wired={wired ? "true" : "false"}
        data-error={showingError ? "true" : "false"}
      >
        {showSuccess ? (
          <div className="otp-success-view text-center">
            <h1 className="text-[1.85rem] font-semibold tracking-[-0.04em] text-[var(--otp-ok)] sm:text-[2rem]">
              Verified successfully
            </h1>

            <p className="mt-2 text-sm text-white/45">
              Your email has been verified.
            </p>

            <div className="relative mx-auto mt-8 grid h-28 place-items-center">
              {SPARKS.map((spark, index) => (
                <span
                  key={index}
                  className="otp-spark"
                  style={{
                    "--i": index,
                    "--x": spark.x,
                    "--y": spark.y,
                  } as CSSProperties}
                />
              ))}

              <div className="otp-success-mark">
                <Check className="h-8 w-8" strokeWidth={2.6} />
              </div>
            </div>

            <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--otp-ok)]">
              <Lock className="h-4 w-4" />
              Verified and secure
            </p>

            <button
              type="button"
              onClick={goToDestination}
              className="mt-7 flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--otp-ok)] px-5 text-sm font-bold text-[#08110b] transition hover:brightness-110"
            >
              Continue
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-center text-[1.85rem] font-semibold tracking-[-0.045em] sm:text-[2.05rem]">
              Verify your email
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-white/45">
              Enter the 6-digit code we sent to{" "}
              <strong className="font-semibold text-white/80">
                {maskedEmail}
              </strong>
            </p>

            <form
              ref={formRef}
              action={verifyAction}
              onSubmit={() => {
                setLastSubmittedToken(token);
                setEditedAfterError(false);
              }}
              className="mt-8"
            >
              <input type="hidden" name="token" value={token} />

              <div
                ref={stageRef}
                className={[
                  "otp-code",
                  showingError ? "otp-shake" : "",
                ].join(" ")}
              >
                <svg
                  className="otp-wires"
                  viewBox="0 0 408 128"
                  aria-hidden="true"
                >
                  <path
                    pathLength={1}
                    d={wirePath}
                  />
                </svg>

                {digits.map((digit, index) => (
                  <label
                    key={index}
                    ref={(element) => {
                      slotRefs.current[index] = element;
                    }}
                    className="otp-slot"
                    data-filled={digit ? "true" : "false"}
                    data-focused={
                      focusedIndex === index && !wired
                        ? "true"
                        : "false"
                    }
                  >
                    <input
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={
                        index === 0 ? "one-time-code" : "off"
                      }
                      autoFocus={index === 0}
                      maxLength={1}
                      value={digit}
                      disabled={verifying || verified}
                      aria-label={`Verification digit ${index + 1}`}
                      onFocus={() => setFocusedIndex(index)}
                      onChange={(event) => {
                        handleChange(index, event.target.value);
                      }}
                      onKeyDown={(event) => {
                        handleKeyDown(index, event);
                      }}
                      onPaste={handlePaste}
                    />
                    <span className="otp-caret" aria-hidden="true" />
                  </label>
                ))}
              </div>

              <div
                className="mt-5 min-h-6 text-center"
                aria-live="polite"
              >
                {verifying ? (
                  <p className="flex items-center justify-center gap-2 text-sm text-white/45">
                    <LoaderCircle
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Verifying your code…
                  </p>
                ) : null}

                {showingError ? (
                  <p className="text-sm text-rose-300" role="alert">
                    {verifyState.message}
                  </p>
                ) : null}
              </div>
            </form>

            <div className="mt-2 text-center">
              <form action={resendAction}>
                <button
                  type="submit"
                  disabled={
                    countdown > 0 || resending || verified
                  }
                  className="text-sm text-white/40 transition hover:text-white disabled:cursor-not-allowed disabled:text-white/25"
                >
                  {resending
                    ? "Sending a new code…"
                    : countdown > 0
                      ? `Didn’t receive the code? Resend in ${countdown}s`
                      : "Didn’t receive the code? Resend"}
                </button>
              </form>

              {resendState.message ? (
                <p
                  className={[
                    "mt-2 text-xs",
                    resendState.status === "sent"
                      ? "text-emerald-300"
                      : "text-rose-300",
                  ].join(" ")}
                  aria-live="polite"
                >
                  {resendState.message}
                </p>
              ) : null}

              <Link
                href="/register"
                className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 text-sm text-white/35 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Use a different email
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
