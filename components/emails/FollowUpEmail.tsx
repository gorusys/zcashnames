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

interface FollowUpEmailProps {
  name: string;
  reasonCopy: string;
}

const socials = [
  { href: "https://x.com/zcashnames", icon: "x", alt: "X" },
  { href: "https://discord.gg/z2H23QgAGf", icon: "discord", alt: "Discord" },
  { href: "https://signal.group/#CjQKIKDM76KMttnFqmbtbKzcfDrGeLtR6wWQq82YM8LWdyNhEhBGKNSZVjTREwDLqhatYhLH", icon: "signal", alt: "Signal" },
  { href: "https://t.me/zcashnames", icon: "telegram", alt: "Telegram" },
];

export default function FollowUpEmail({ name, reasonCopy }: FollowUpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>We'd love to chat about ZcashNames with you.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={{ padding: "40px 40px 24px", textAlign: "center" as const }}>
            <Img src="https://zcashnames.com/logo.svg" alt="ZcashNames" width="48" height="48" style={{ display: "block", margin: "0 auto", border: "0" }} />
          </Section>

          <Heading style={heading}>Let&rsquo;s connect</Heading>

          <Hr style={divider} />

          <Section style={content}>
            <Text style={paragraph}>Thanks for completing our survey, {name}.</Text>
            <Text style={paragraph}>{reasonCopy}</Text>
            <Text style={paragraph}>We&rsquo;d love to chat. Book a time that works for you:</Text>
          </Section>

          <Section style={{ textAlign: "center" as const, padding: "0 40px 32px" }}>
            <Button href="https://cal.com/zcash" style={ctaButton}>
              Book a time to chat
            </Button>
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
                        <Img src={`https://zcashnames.com/icons/${icon}.svg`} alt={alt} width="20" height="20" style={{ display: "block" }} />
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
