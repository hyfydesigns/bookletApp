import { render } from "@react-email/components";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { InviteEmail } from "../src/emails/invite";
import { ConfirmSignupEmail } from "../src/emails/confirm-signup";
import { ResetPasswordEmail } from "../src/emails/reset-password";

async function main() {
  const outDir = join(process.cwd(), "src/emails/html");
  mkdirSync(outDir, { recursive: true });

  const templates = [
    {
      name: "invite",
      html: await render(InviteEmail({ inviteLink: "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite" })),
    },
    {
      name: "confirm-signup",
      html: await render(ConfirmSignupEmail({ confirmLink: "{{ .ConfirmationURL }}" })),
    },
    {
      name: "reset-password",
      html: await render(ResetPasswordEmail({ resetLink: "{{ .ConfirmationURL }}" })),
    },
  ];

  for (const { name, html } of templates) {
    const path = join(outDir, `${name}.html`);
    writeFileSync(path, html, "utf8");
    console.log(`✓ ${name}.html`);
  }

  console.log(`\nHTML files written to src/emails/html/`);
  console.log("Paste each file's contents into Supabase → Authentication → Email Templates");
}

main();
