import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface InviteEmailProps {
  inviteLink: string;
}

export function InviteEmail({ inviteLink }: InviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;ve been invited to BookletFlow</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>BookletFlow</Text>
          </Section>

          <Section style={card}>
            <Heading style={h1}>You&apos;re invited</Heading>
            <Text style={paragraph}>
              You&apos;ve been invited to join your organization on BookletFlow — the platform for managing event booklet ads and front sections.
            </Text>
            <Text style={paragraph}>
              Click the button below to create your account and get started.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={inviteLink}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={hint}>
              This invite link expires in 24 hours. If you weren&apos;t expecting this invitation, you can safely ignore this email.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              If the button doesn&apos;t work, copy and paste this link into your browser:
            </Text>
            <Text style={link}>{inviteLink}</Text>
          </Section>

          <Text style={footerText}>
            © {new Date().getFullYear()} BookletFlow · Sent by your organization admin
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px 20px",
};

const logoSection: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "24px",
};

const logoText: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#18181b",
  margin: "0",
  letterSpacing: "-0.5px",
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "40px",
  border: "1px solid #e4e4e7",
};

const h1: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#18181b",
  margin: "0 0 16px",
  letterSpacing: "-0.3px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#52525b",
  margin: "0 0 16px",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "28px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#18181b",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "12px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const hint: React.CSSProperties = {
  fontSize: "13px",
  color: "#a1a1aa",
  lineHeight: "20px",
  margin: "0 0 24px",
  textAlign: "center",
};

const hr: React.CSSProperties = {
  borderColor: "#e4e4e7",
  margin: "0 0 20px",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#a1a1aa",
  margin: "0 0 4px",
};

const link: React.CSSProperties = {
  fontSize: "11px",
  color: "#71717a",
  wordBreak: "break-all",
  margin: "0",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#a1a1aa",
  textAlign: "center",
  marginTop: "24px",
};

export default () => <InviteEmail inviteLink="https://example.com/invite" />;
