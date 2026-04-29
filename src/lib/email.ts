import { Resend } from "resend";
import { render } from "@react-email/components";
import { InviteEmail } from "@/emails/invite";

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "BookletFlow <onboarding@resend.dev>";

export async function sendInviteEmail({
  to,
  organizationName,
  inviteLink,
}: {
  to: string;
  organizationName: string;
  inviteLink: string;
}) {
  const html = await render(InviteEmail({ organizationName, inviteLink }));
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to,
    subject: `You've been invited to join ${organizationName} on BookletFlow`,
    html,
  });
}
