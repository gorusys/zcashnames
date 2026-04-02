import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export interface ParsedWaitlistConfirmToken {
  waitlistId: string;
  expiresAt: number;
  signature: string;
}

function getSecret(): string {
  const secret =
    process.env.WAITLIST_CONFIRM_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.RESEND_API_KEY;
  if (!secret) {
    throw new Error("Missing WAITLIST_CONFIRM_SECRET (or fallback email/db secret).");
  }
  return secret;
}

function sign(waitlistId: string, email: string, expiresAt: number): string {
  const hmac = createHmac("sha256", getSecret());
  hmac.update(`${waitlistId}:${email.toLowerCase().trim()}:${expiresAt}`);
  return hmac.digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function buildWaitlistConfirmToken({
  waitlistId,
  email,
  ttlSeconds = DEFAULT_TOKEN_TTL_SECONDS,
}: {
  waitlistId: string;
  email: string;
  ttlSeconds?: number;
}): string {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const signature = sign(waitlistId, email, expiresAt);
  return `${waitlistId}.${expiresAt}.${signature}`;
}

export function parseWaitlistConfirmToken(token: string): ParsedWaitlistConfirmToken | null {
  const parts = token.split(".");
  if (parts.length < 3) return null;
  const signature = parts.pop();
  const expiresRaw = parts.pop();
  const waitlistId = parts.join(".");
  if (!signature || !expiresRaw || !waitlistId) return null;

  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) return null;

  return { waitlistId, expiresAt, signature };
}

export function isWaitlistConfirmTokenExpired(parsed: ParsedWaitlistConfirmToken): boolean {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return parsed.expiresAt < nowSeconds;
}

export function isWaitlistConfirmSignatureValid(
  parsed: ParsedWaitlistConfirmToken,
  email: string,
): boolean {
  const expected = sign(parsed.waitlistId, email, parsed.expiresAt);
  return safeEqual(expected, parsed.signature);
}
