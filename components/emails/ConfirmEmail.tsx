import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ConfirmEmailProps {
  name: string;
  confirmUrl: string;
}

const socials = [
  { href: "https://x.com/zcashnames", icon: "x", alt: "X" },
  { href: "https://discord.gg/z2H23QgAGf", icon: "discord", alt: "Discord" },
  {
    href: "https://signal.group/#CjQKIKDM76KMttnFqmbtbKzcfDrGeLtR6wWQq82YM8LWdyNhEhBGKNSZVjTREwDLqhatYhLH",
    icon: "signal",
    alt: "Signal",
  },
  { href: "https://t.me/zcashnames", icon: "telegram", alt: "Telegram" },
];

export default function ConfirmEmail({ name, confirmUrl }: ConfirmEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirm your email to join the ZcashNames waitlist.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={{ padding: "40px 40px 24px", textAlign: "center" as const }}>
            <Img
              src="https://zcashnames.com/logo.svg"
              alt="ZcashNames"
              width="48"
              height="48"
              style={{ display: "block", margin: "0 auto", border: "0" }}
            />
          </Section>

          <Heading style={heading}>Confirm your email</Heading>

          <Hr style={divider} />

          <Section style={content}>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>
              Click the button below to confirm your email and secure your spot on the
              ZcashNames waitlist.
            </Text>
          </Section>

          <Section style={{ textAlign: "center" as const, padding: "0 40px 8px" }}>
            <Button href={confirmUrl} style={ctaButton}>
              Confirm your email
            </Button>
            <Text
              style={{
                margin: "12px 0 0",
                fontSize: 12,
                color: "#a1a1aa",
                wordBreak: "break-all" as const,
              }}
            >
              {confirmUrl}
            </Text>
          </Section>

          <Section style={{ textAlign: "left" as const, padding: "16px 40px 32px" }}>
            <Text style={{ ...paragraph, margin: 0, color: "#a1a1aa", fontSize: 13 }}>
              If you didn&apos;t sign up for ZcashNames, you can ignore this email.
            </Text>
          </Section>

          <Hr style={{ ...divider, margin: "0 40px 24px" }} />

          <Section style={{ textAlign: "center" as const, padding: "0 40px 12px" }}>
            <Text style={{ margin: "0 0 12px", fontSize: 13, color: "#d4d4d8", textAlign: "center" as const }}>
              Join the community
            </Text>
            <table role="presentation" style={{ margin: "0 auto", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  {socials.map(({ href, icon, alt }) => (
                    <td key={alt} style={{ padding: "0 8px" }}>
                      <Link href={href} style={{ textDecoration: "none", display: "inline-block" }}>
                        <Img
                          src={`https://zcashnames.com/icons/${icon}.svg`}
                          alt={alt}
                          width="20"
                          height="20"
                          style={{ display: "block" }}
                        />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={{ textAlign: "center" as const, padding: "0 40px 32px" }}>
            <Text style={{ margin: 0, fontSize: 12, color: "#d4d4d8", textAlign: "center" as const }}>
              zcashnames.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: "#f4f4f5",
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: 480,
  margin: "40px auto",
  backgroundColor: "#0a0a0a",
  borderRadius: 12,
  overflow: "hidden",
};

const heading: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 600,
  color: "#f0f0f0",
  textAlign: "center" as const,
  padding: "0 40px 8px",
};

const divider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #2a2a2a",
  margin: "0 40px",
  padding: 0,
};

const content: React.CSSProperties = {
  padding: "16px 40px 0",
};

const paragraph: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: 15,
  lineHeight: "1.6",
  color: "#d4d4d8",
};

const ctaButton: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#F4B728",
  color: "#0a0a0a",
  fontSize: 14,
  fontWeight: 700,
  textDecoration: "none",
  padding: "14px 32px",
  borderRadius: 8,
};
