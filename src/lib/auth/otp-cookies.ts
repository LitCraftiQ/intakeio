import "server-only";

export const OTP_EMAIL_COOKIE =
  "intakeio_otp_email";

export const OTP_FULL_NAME_COOKIE =
  "intakeio_otp_full_name";

export const OTP_REQUESTED_AT_COOKIE =
  "intakeio_otp_requested_at";

export const OTP_COOKIE_MAX_AGE_SECONDS =
  10 * 60;

export const OTP_RESEND_SECONDS = 60;

export function getOtpCookieOptions() {
  return {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: OTP_COOKIE_MAX_AGE_SECONDS,
  };
}