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
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

interface WaitlistEmailProps {
  name: string;
  referralUrl: string;
}

const tweetText = (referralUrl: string) =>
  `Sending and receiving $ZEC will be much easier with @ZcashNames.\n\nGet your @ZcashName before it's taken:\n${referralUrl}\n\nYou'll get your own referral link to earn rewards too.`;

const socials = [
  { href: "https://x.com/zcashnames", icon: "x", alt: "X" },
  { href: "https://discord.gg/z2H23QgAGf", icon: "discord", alt: "Discord" },
  { href: "https://signal.group/#CjQKIKDM76KMttnFqmbtbKzcfDrGeLtR6wWQq82YM8LWdyNhEhBGKNSZVjTREwDLqhatYhLH", icon: "signal", alt: "Signal" },
  { href: "https://t.me/zcashnames", icon: "telegram", alt: "Telegram" },
];

export default function WaitlistEmail({ name, referralUrl }: WaitlistEmailProps) {
  const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText(referralUrl))}`;

  return (
    <Html>
      <Head />
      <Preview>You're in. Start sharing your referral link and earn ZEC.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={{ padding: "40px 40px 24px", textAlign: "center" as const }}>
            <Img src="https://zcashnames.com/logo.svg" alt="ZcashNames" width="48" height="48" style={{ display: "block", margin: "0 auto", border: "0" }} />
          </Section>

          <Heading style={heading}>You're on the waitlist</Heading>

          <Hr style={divider} />

          <Section style={content}>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>You're early. We will give you a heads up before we launch.</Text>
          </Section>

          <Section style={{ textAlign: "center" as const, padding: "0 40px 16px" }}>
            <Text style={{ margin: "0 0 8px", fontSize: 13, color: "#a1a1aa" }}>REFERRAL REWARDS</Text>
          </Section>

          <Section style={{ textAlign: "center" as const, padding: "0 40px 8px" }}>
            <Button href={shareUrl} style={ctaButton}>
              Share your link on X
            </Button>
            <Text style={{ margin: "12px 0 0", fontSize: 12, color: "#a1a1aa", wordBreak: "break-all" as const }}>{referralUrl}</Text>
          </Section>

          <Section style={{ textAlign: "left" as const, padding: "16px 40px 0" }}>
            <Text style={paragraph}>Earn <strong>0.05 ZEC</strong> for every friend who signs up and buys during launch week.</Text>
          </Section>

          <Section style={{ textAlign: "left" as const, padding: "0 40px 32px" }}>
            <Text style={{ ...paragraph, margin: 0 }}>Start sharing now and dominate the leaderboard for a chance to win even more rewards.</Text>
          </Section>

          <Hr style={{ ...divider, margin: "0 40px 24px" }} />

          <Section style={{ textAlign: "center" as const, padding: "0 40px 12px" }}>
            <Text style={{ margin: "0 0 12px", fontSize: 13, color: "#d4d4d8" }}>Join the community</Text>
            <Row style={{ display: "inline-flex", gap: 16 }}>
              {socials.map(({ href, icon, alt }) => (
                <Column key={alt} style={{ padding: "0 8px" }}>
                  <Link href={href} style={{ textDecoration: "none" }}>
                    <Img src={`https://zcashnames.com/icons/${icon}.svg`} alt={alt} width="20" height="20" style={{ display: "block" }} />
                  </Link>
                </Column>
              ))}
            </Row>
          </Section>

          <Section style={{ textAlign: "center" as const, padding: "0 40px 32px" }}>
            <Text style={{ margin: 0, fontSize: 12, color: "#d4d4d8" }}>zcashnames.com</Text>
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
