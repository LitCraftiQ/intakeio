import "server-only";

import { getServerEnvironment } from
  "@/lib/env/server";

import { proposalBodySections, proposalPublicPath } from
  "./sections";
import type { ProposalRecord } from
  "./types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toHtmlParagraphs(value: string) {
  return escapeHtml(value).replaceAll(
    "\n",
    "<br />",
  );
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Intakeio <beth.t@example.com>";

  if (!apiKey || apiKey.length < 20) {
    return null;
  }

  return { apiKey, from };
}

export function buildProposalEmailHtml(
  proposal: ProposalRecord,
  senderName: string,
) {
  const { APP_URL } = getServerEnvironment();
  const publicUrl = `${APP_URL}${proposalPublicPath(
    proposal.publicToken,
  )}`;
  const title =
    proposal.projectTitle.trim() ||
    "Project proposal";
  const clientLine = [
    proposal.contactName,
    proposal.contactCompany
      ? `at ${proposal.contactCompany}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const sections = proposalBodySections
    .map((section) => {
      const value = proposal[section.key].trim();

      if (!value) {
        return "";
      }

      return `
        <tr>
          <td style="padding:0 0 16px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.16);border-radius:24px;background:linear-gradient(150deg, rgba(88,92,168,0.45) 0%, rgba(42,40,92,0.55) 50%, rgba(58,78,150,0.42) 100%);">
              <tr>
                <td style="padding:22px 24px;">
                  <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#b7a8ff;">${escapeHtml(section.label)}</p>
                  <p style="margin:12px 0 0 0;font-size:15px;line-height:1.7;color:#f4f6fb;white-space:pre-wrap;">${toHtmlParagraphs(value)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#2b3a7a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg, #4a63c7 0%, #33408f 55%, #3a56b0 100%);">
      <tr>
        <td align="center" style="padding:36px 16px;">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;font-family:Inter,Segoe UI,Roboto,sans-serif;color:#f4f6fb;">
            <tr>
              <td style="padding:0 8px 28px 8px;">
                <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#c4b8ff;">Proposal</p>
                <h1 style="margin:12px 0 0 0;font-family:Georgia,Times,serif;font-size:36px;line-height:1.1;font-weight:normal;color:#ffffff;">${escapeHtml(title)}</h1>
                <p style="margin:18px 0 0 0;font-size:15px;line-height:1.6;color:#d5dced;">Prepared for ${escapeHtml(clientLine)} by ${escapeHtml(senderName)}. Review the scope below, then accept or request changes.</p>
              </td>
            </tr>
            ${sections}
            <tr>
              <td style="padding:8px 0 0 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.16);border-radius:24px;background:linear-gradient(150deg, rgba(88,92,168,0.45) 0%, rgba(42,40,92,0.55) 50%, rgba(58,78,150,0.42) 100%);">
                  <tr>
                    <td style="padding:22px 24px;text-align:center;">
                      <p style="margin:0;font-family:Georgia,Times,serif;font-size:24px;color:#ffffff;">Ready to proceed?</p>
                      <p style="margin:10px 0 0 0;font-size:14px;line-height:1.6;color:#d5dced;">Open the proposal to accept it or request changes.</p>
                      <p style="margin:22px 0 0 0;">
                        <a href="${escapeHtml(publicUrl)}" style="display:inline-block;background:#8b7cf7;color:#120e2a;text-decoration:none;font-size:14px;font-weight:600;border-radius:12px;padding:12px 22px;">Open proposal</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 8px 0 8px;font-size:12px;color:#c4cbe0;">
                <p style="margin:0;">Private proposal from Intakeio</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendProposalEmail(input: {
  proposal: ProposalRecord;
  to: string;
  senderName: string;
  senderEmail: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const config = getResendConfig();

  if (!config) {
    return {
      ok: false,
      message:
        "Email sending is not configured yet. Add RESEND_API_KEY to send proposals by mail, or copy the private link instead.",
    };
  }

  const subject =
    input.proposal.projectTitle.trim() ||
    "Your proposal";

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [input.to],
        reply_to: input.senderEmail || undefined,
        subject,
        html: buildProposalEmailHtml(
          input.proposal,
          input.senderName,
        ),
      }),
    },
  );

  if (!response.ok) {
    return {
      ok: false,
      message:
        "The proposal email could not be sent. Check RESEND_API_KEY and RESEND_FROM_EMAIL, then try again.",
    };
  }

  return { ok: true };
}
