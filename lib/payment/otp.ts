import "server-only";

/**
 * ZVS OTP — HMAC-SHA256 generation and verification.
 */

import { parseZvsMemo } from "./memo";

function getSecretSeedBytes(): Uint8Array {
  const seed = process.env.ZVS_SECRET_SEED;
  if (!seed) {
    throw new Error("ZVS_SECRET_SEED environment variable is required");
  }
  return new Uint8Array(Buffer.from(seed, "hex"));
}

/* ── OTP ─────────────────────────────────────────────────────────────── */

/**
 * Generate a 6-digit OTP from a memo using HMAC-SHA256.
 * HMAC-SHA256(secret, sessionId + userAddress) → u32 → mod 1_000_000.
 * The address is included in the hash so the OTP is bound to both the
 * session and the address — prevents replay with a swapped address.
 */
async function generateOtp(memo: string): Promise<string> {
  const parsed = parseZvsMemo(memo);
  if (!parsed) throw new Error("Invalid memo format");

  const keyData = getSecretSeedBytes().slice();
  const messageData = new TextEncoder().encode(
    parsed.sessionId + parsed.userAddress
  );

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, messageData);
  const h = new Uint8Array(sig);
  const code = ((h[0] << 24) | (h[1] << 16) | (h[2] << 8) | h[3]) >>> 0;
  return (code % 1_000_000).toString().padStart(6, "0");
}

/**
 * Verify a user-provided OTP against a memo (stateless HMAC check).
 * Requires the expected address so the OTP can't be replayed with a
 * swapped address — the sessionId alone determines the OTP, so without
 * this check an attacker who sees the sessionId could build a memo with
 * their own address, receive the same OTP, and pass verification.
 */
export async function verifyOtp(
  memo: string,
  providedOtp: string,
  expectedAddress: string
): Promise<boolean> {
  const parsed = parseZvsMemo(memo);
  if (!parsed) return false;
  if (parsed.userAddress !== expectedAddress) return false;

  const expected = await generateOtp(memo);
  return expected === providedOtp.trim();
}
