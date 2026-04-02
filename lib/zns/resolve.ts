"use server";

import { resolve, status, fetchClaimCost, events } from "@/lib/zns/client";
import { normalizeUsername, isValidUsername, zatsToZec, type Network } from "@/lib/zns/name";
import type { ResolveName } from "@/lib/types";

export async function resolveName(
  rawName: string,
  network: Network = "testnet"
): Promise<ResolveName> {
  const normalized = normalizeUsername(rawName);

  if (!isValidUsername(normalized)) {
    throw new Error("Use 1-62 characters: lowercase letters and numbers only.");
  }

  const registration = await resolve(normalized, network);

  if (!registration) {
    const claimCostZats = await fetchClaimCost(normalized, network);
    if (claimCostZats == null) {
      throw new Error("Pricing unavailable — indexer may be down.");
    }
    return {
      status: "available",
      query: normalized,
      claimCost: { zats: claimCostZats, zec: zatsToZec(claimCostZats) },
    };
  }

  if (registration.listing) {
    return {
      status: "listed",
      query: normalized,
      registration: {
        name: registration.name,
        address: registration.address,
        txid: registration.txid,
        height: registration.height,
        nonce: registration.nonce,
      },
      listingPrice: {
        zats: registration.listing.price,
        zec: zatsToZec(registration.listing.price),
      },
    };
  }

  return {
    status: "registered",
    query: normalized,
    registration: {
      name: registration.name,
      address: registration.address,
      txid: registration.txid,
      height: registration.height,
      nonce: registration.nonce,
    },
  };
}

export async function searchAction(formData: FormData): Promise<ResolveName> {
  const query = formData.get("query") as string;
  const network = (formData.get("network") as Network) || "testnet";
  return resolveName(query, network);
}

export async function getHomeStats(network: Network = "testnet"): Promise<{ claimed: number; forSale: number; verifiedOnZcashMe: number; syncedHeight: number; uivk: string }> {
  try {
    const s = await status(network);
    return {
      claimed: s.registered,
      forSale: s.listed,
      verifiedOnZcashMe: 0,
      syncedHeight: s.synced_height,
      uivk: s.uivk,
    };
  } catch {
    return {
      claimed: 0,
      forSale: 0,
      verifiedOnZcashMe: 0,
      syncedHeight: 0,
      uivk: "",
    };
  }
}

export async function getEvents(
  params: { name?: string; action?: string; limit?: number; offset?: number } = {},
  network: Network = "testnet"
) {
  try {
    return await events(params, network);
  } catch {
    return { events: [], total: 0 };
  }
}
