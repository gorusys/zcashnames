import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWaitlistWelcomeEmail } from "@/lib/email/waitlist";
import { allowRateLimit } from "@/lib/security/rate-limit";
import {
  isWaitlistConfirmSignatureValid,
  isWaitlistConfirmTokenExpired,
  parseWaitlistConfirmToken,
} from "@/lib/waitlist/confirm-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONFIRM_IP_LIMIT = 40;
const CONFIRM_IP_WINDOW_MS = 15 * 60 * 1000;

type WaitlistConfirmRow = {
  id: string;
  name: string;
  email: string;
  referral_code: string | null;
  email_verified: boolean;
};

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function baseUrl(request: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  return request.nextUrl.origin.replace(/\/$/, "");
}

function redirectToStatus(
  request: NextRequest,
  status: "success" | "already" | "invalid",
  extras?: { ref?: string; name?: string },
) {
  const url = new URL("/", request.url);
  url.searchParams.set("verified", status);
  if (extras?.ref) url.searchParams.set("ref", extras.ref);
  if (extras?.name) url.searchParams.set("name", extras.name);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const ip = clientIp(request);
  if (!allowRateLimit(`confirm:ip:${ip}`, CONFIRM_IP_LIMIT, CONFIRM_IP_WINDOW_MS)) {
    return redirectToStatus(request, "invalid");
  }

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return redirectToStatus(request, "invalid");
  }

  const parsed = parseWaitlistConfirmToken(token);
  if (!parsed || isWaitlistConfirmTokenExpired(parsed)) {
    return redirectToStatus(request, "invalid");
  }

  const { data, error } = await db
    .from("zn_waitlist")
    .select("id, name, email, referral_code, email_verified")
    .eq("id", parsed.waitlistId)
    .single();

  if (error || !data) {
    return redirectToStatus(request, "invalid");
  }

  const row = data as WaitlistConfirmRow;
  if (!isWaitlistConfirmSignatureValid(parsed, row.email)) {
    return redirectToStatus(request, "invalid");
  }

  if (row.email_verified) {
    return redirectToStatus(request, "already");
  }

  const { error: updateError } = await db
    .from("zn_waitlist")
    .update({ email_verified: true })
    .eq("id", row.id);

  if (updateError) {
    console.error("Waitlist confirm update error:", updateError.message);
    return redirectToStatus(request, "invalid");
  }

  try {
    await sendWaitlistWelcomeEmail({
      email: row.email,
      name: row.name,
      referralCode: row.referral_code ?? "",
      baseUrl: baseUrl(request),
    });
  } catch (emailError) {
    console.error("Waitlist welcome email error:", emailError);
  }

  return redirectToStatus(request, "success", {
    ref: row.referral_code ?? undefined,
    name: row.name,
  });
}
