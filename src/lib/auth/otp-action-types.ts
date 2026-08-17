import type {
    PublicAuthDestination,
  } from "./public-post-auth";
  
  export type RequestEmailOtpState =
    Readonly<{
      status: "idle" | "error";
      message: string;
    }>;
  
  export type VerifyEmailOtpState =
    Readonly<{
      status:
        | "idle"
        | "error"
        | "success";
      message: string;
      destination:
        | PublicAuthDestination
        | null;
    }>;
  
  export type ResendEmailOtpState =
    Readonly<{
      status:
        | "idle"
        | "error"
        | "sent";
      message: string;
      cooldownSeconds: number;
    }>;