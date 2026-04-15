/**
 * Server-only: ZNS admin signing operations.
 * DO NOT IMPORT IN CLIENT COMPONENTS.
 *
 * Handles Ed25519 signing of name operations using the ZNS admin key.
 * Requires ZNS_SIGNING_KEY_PATH environment variable (server-side only).
 */

import crypto from "node:crypto";
import type { Network } from "./name";
import { getZns, resolve } from "./client";

let cachedKeyPair: crypto.KeyObject | null = null;

function getSigningKey(): crypto.KeyObject {
  if (cachedKeyPair) return cachedKeyPair;

  const hex = process.env.ZNS_SIGNING_KEY_PATH;
  if (!hex) throw new Error("ZNS_SIGNING_KEY_PATH environment variable is required");

  const seed = Buffer.from(hex, "hex"); // 32-byte Ed25519 seed
  cachedKeyPair = crypto.createPrivateKey({
    key: Buffer.concat([
      // PKCS#8 DER prefix for Ed25519 (RFC 8410)
      Buffer.from("302e020100300506032b657004220420", "hex"),
      seed,
    ]),
    format: "der",
    type: "pkcs8",
  });

  return cachedKeyPair;
}

/** Sign a payload with the admin Ed25519 key. Returns base64 signature. */
export function adminSign(payload: string): string {
  const key = getSigningKey();
  const sig = crypto.sign(null, Buffer.from(payload, "utf-8"), key);
  return sig.toString("base64");
}

export async function buildSignedClaimMemo(
  name: string,
  userUa: string,
  network: Network = "testnet"
): Promise<string> {
  const [reg, zns] = await Promise.all([resolve(name, network), getZns(network)]);
  if (reg) throw new Error(`Name "${name}" is already registered.`);
  const { payload } = zns.prepareClaim(name, userUa);
  const sig = adminSign(payload);
  return zns.completeClaim(name, userUa, sig).memo;
}

export async function buildSignedBuyMemo(
  name: string,
  buyerUa: string,
  network: Network = "testnet"
): Promise<string> {
  const [reg, zns] = await Promise.all([resolve(name, network), getZns(network)]);
  if (!reg?.listing) throw new Error(`Name "${name}" is not listed for sale.`);
  const { payload } = zns.prepareBuy(name, buyerUa);
  const sig = adminSign(payload);
  return zns.completeBuy(name, buyerUa, sig).memo;
}

export async function buildSignedListMemo(
  name: string,
  priceZats: number,
  network: Network = "testnet"
): Promise<{ memo: string; nonce: number }> {
  const [reg, zns] = await Promise.all([resolve(name, network), getZns(network)]);
  if (!reg) throw new Error(`Name "${name}" is not registered.`);
  const nonce = reg.nonce + 1;
  const { payload } = zns.prepareList(name, priceZats, nonce);
  const sig = adminSign(payload);
  return { memo: zns.completeList(name, priceZats, nonce, sig).memo, nonce };
}

export async function buildSignedDelistMemo(
  name: string,
  network: Network = "testnet"
): Promise<{ memo: string; nonce: number }> {
  const [reg, zns] = await Promise.all([resolve(name, network), getZns(network)]);
  if (!reg) throw new Error(`Name "${name}" is not registered.`);
  const nonce = reg.nonce + 1;
  const { payload } = zns.prepareDelist(name, nonce);
  const sig = adminSign(payload);
  return { memo: zns.completeDelist(name, nonce, sig).memo, nonce };
}

export async function buildSignedReleaseMemo(
  name: string,
  network: Network = "testnet"
): Promise<{ memo: string; nonce: number }> {
  const [reg, zns] = await Promise.all([resolve(name, network), getZns(network)]);
  if (!reg) throw new Error(`Name "${name}" is not registered.`);
  const nonce = reg.nonce + 1;
  const { payload } = zns.prepareRelease(name, nonce);
  const sig = adminSign(payload);
  return { memo: zns.completeRelease(name, nonce, sig).memo, nonce };
}

export async function buildSignedUpdateMemo(
  name: string,
  newUa: string,
  network: Network = "testnet"
): Promise<{ memo: string; nonce: number }> {
  const [reg, zns] = await Promise.all([resolve(name, network), getZns(network)]);
  if (!reg) throw new Error(`Name "${name}" is not registered.`);
  const nonce = reg.nonce + 1;
  const { payload } = zns.prepareUpdate(name, newUa, nonce);
  const sig = adminSign(payload);
  return { memo: zns.completeUpdate(name, newUa, nonce, sig).memo, nonce };
}
