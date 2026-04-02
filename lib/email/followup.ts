import { Resend } from "resend";
import FollowUpEmail from "@/components/emails/FollowUpEmail";

export async function sendFollowUp(
  email: string,
  name: string,
  reasonCopy: string,
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  await resend.emails.send({
    from: "zechariah@updates.zcashnames.com",
    to: email,
    subject: "Let\u2019s connect",
    react: FollowUpEmail({ name, reasonCopy }),
  });
}
