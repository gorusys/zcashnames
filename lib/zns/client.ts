import { ZNS } from "zcashname-sdk";
import type { Network } from "./name";
import type { EventsFilter, ResolveResult, VerifiedListing, StatusResult, EventsResult } from "zcashname-sdk";

export type { Registration, Listing, VerifiedListing, ResolveResult, StatusResult, Event, EventsFilter, EventsResult, Pricing, PreparedAction, CompletedAction } from "zcashname-sdk";

const ZNS_RPC_URLS: Record<Network, string> = {
  testnet: process.env.ZNS_TESTNET_RPC_URL ?? "https://light.zcash.me/zns-testnet",
  mainnet: process.env.ZNS_MAINNET_RPC_URL ?? "https://light.zcash.me/zns-mainnet-test",
};

const instances = new Map<Network, ZNS>();

export async function getZns(network: Network): Promise<ZNS> {
  const cached = instances.get(network);
  if (cached) return cached;
  const zns = await ZNS.create({ url: ZNS_RPC_URLS[network], skipVerify: true });
  instances.set(network, zns);
  return zns;
}

export async function resolve(name: string, network: Network = "testnet"): Promise<ResolveResult | null> {
  const zns = await getZns(network);
  const result = await zns.resolve(name);
  if (!result) return null;
  return Array.isArray(result) ? result[0] : result;
}

export async function listForSale(network: Network = "testnet"): Promise<VerifiedListing[]> {
  const zns = await getZns(network);
  return zns.listings();
}

export async function status(network: Network = "testnet"): Promise<StatusResult> {
  const zns = await getZns(network);
  return zns.status();
}

export async function events(filter: EventsFilter = {}, network: Network = "testnet"): Promise<EventsResult> {
  const zns = await getZns(network);
  return zns.events(filter);
}

export async function fetchClaimCost(name: string, network: Network = "testnet"): Promise<number | null> {
  try {
    const s = await status(network);
    if (!s.pricing?.tiers?.length) return null;
    const tiers = s.pricing.tiers;
    const idx = Math.min(name.length - 1, tiers.length - 1);
    return tiers[idx];
  } catch {
    return null;
  }
}

export function registrationStatus(reg: ResolveResult | null): "available" | "registered" | "forsale" {
  if (!reg) return "available";
  if (reg.listing) return "forsale";
  return "registered";
}

export {
  toBase64Url,
  buildZcashUri,
  decodeBase64UrlToUtf8,
  parseZip321Uri,
} from "../payment/zip321";
