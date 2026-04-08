"use server";

import { resolve, registrationStatus, status, fetchClaimCost, events, listForSale, type ZnsListing } from "@/lib/zns/client";
import { normalizeUsername, isValidUsername, zatsToZec, type Network } from "@/lib/zns/name";
import { getExchangeRate } from "@/lib/exchange-rate";
import { getReservedName } from "@/lib/zns/reserved";
import type { Action, ResolveName } from "@/lib/types";

export async function resolveName(
  rawName: string,
  network: Network = "testnet"
): Promise<ResolveName> {
  const normalized = normalizeUsername(rawName);

  if (!isValidUsername(normalized)) {
    throw new Error("Use 1-62 characters: lowercase letters and numbers only.");
  }

  const registration = await resolve(normalized, network);
  const nameStatus = registrationStatus(registration);

  if (nameStatus === "available") {
    const reserved = await getReservedName(normalized);

    if (reserved && !reserved.redeemed && reserved.category === "offensive") {
      return { status: "blocked", query: normalized };
    }

    const claimCostZats = await fetchClaimCost(normalized, network);
    if (claimCostZats == null) {
      throw new Error("Pricing unavailable - indexer may be down.");
    }

    if (reserved && !reserved.redeemed) {
      return {
        status: "reserved",
        query: normalized,
        claimCost: { zats: claimCostZats, zec: zatsToZec(claimCostZats) },
      };
    }

    return {
      status: "available",
      query: normalized,
      claimCost: { zats: claimCostZats, zec: zatsToZec(claimCostZats) },
    };
  }

  const reg = {
    name: registration!.name,
    address: registration!.address,
    txid: registration!.txid,
    height: registration!.height,
    nonce: registration!.nonce,
  };

  if (nameStatus === "forsale") {
    return {
      status: "listed",
      query: normalized,
      registration: reg,
      listingPrice: {
        zats: registration!.listing!.price,
        zec: zatsToZec(registration!.listing!.price),
      },
    };
  }

  return {
    status: "registered",
    query: normalized,
    registration: reg,
  };
}

/**
 * Check whether the resolver reflects the expected post-action state for `name`.
 * Used by the scanner phase of Zip321Modal to know when an action has been mined.
 *
 * Returns "success" once the resolver matches the expected state, "empty" otherwise.
 * Network/parsing errors are reported as "empty" so the polling loop keeps going.
 */
export async function checkScannerState(
  name: string,
  network: Network,
  action: Action,
  expected: { address?: string; priceZats?: number },
): Promise<"empty" | "success"> {
  try {
    const reg = await resolve(name, network);

    switch (action) {
      case "claim":
      case "buy":
      case "update": {
        if (!reg) return "empty";
        if (!expected.address) return "empty";
        return reg.address === expected.address ? "success" : "empty";
      }
      case "list": {
        if (!reg || !reg.listing) return "empty";
        if (expected.priceZats == null) return "empty";
        return reg.listing.price === expected.priceZats ? "success" : "empty";
      }
      case "delist": {
        if (!reg) return "empty";
        return reg.listing == null ? "success" : "empty";
      }
      case "release": {
        return reg == null ? "success" : "empty";
      }
    }
  } catch {
    return "empty";
  }
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

export async function getUsdPerZec(): Promise<number | null> {
  return getExchangeRate();
}

export async function getListings(network: Network = "testnet"): Promise<ZnsListing[]> {
  try {
    return await listForSale(network);
  } catch {
    return [];
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
