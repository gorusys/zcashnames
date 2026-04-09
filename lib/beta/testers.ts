import "server-only";

import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Beta tester registry. Primary source: the `beta_testers` Supabase table.
// Fallback: gitignored beta-testers.json at the repo root (or BETA_TESTERS_JSON
// env var) — used if the table is empty or unreachable. The fallback exists so
// local dev still works without a network round-trip and so a freshly cloned
// repo can boot without DB seed data.
//
// JSON shape (matches the DB columns):
//   [
//     { "id": "tester_pacu",     "displayName": "Pacu",     "codeHash": "<sha256 hex>" }
//   ]
// ---------------------------------------------------------------------------

export interface BetaTester {
  id: string;
  displayName: string;
  codeHash: string;
}

let jsonCache: BetaTester[] | null = null;

function parseJson(raw: string): BetaTester[] {
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("beta-testers must be an array");
  for (const entry of data) {
    if (!entry || typeof entry !== "object") throw new Error("invalid tester entry");
    if (typeof entry.id !== "string" || !entry.id) throw new Error("tester id required");
    if (typeof entry.displayName !== "string") throw new Error("displayName required");
    if (typeof entry.codeHash !== "string" || entry.codeHash.length !== 64) {
      throw new Error(`tester ${entry.id}: codeHash must be a 64-char sha256 hex`);
    }
  }
  return data as BetaTester[];
}

function loadFromJson(): BetaTester[] {
  if (jsonCache) return jsonCache;

  const fromEnv = process.env.BETA_TESTERS_JSON;
  if (fromEnv) {
    try {
      jsonCache = parseJson(fromEnv);
      return jsonCache;
    } catch (err) {
      console.error("[beta] failed to parse BETA_TESTERS_JSON:", err);
      jsonCache = [];
      return jsonCache;
    }
  }

  try {
    const path = join(process.cwd(), "beta-testers.json");
    const raw = readFileSync(path, "utf8");
    jsonCache = parseJson(raw);
    return jsonCache;
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") {
      console.error("[beta] failed to load beta-testers.json:", err);
    }
    jsonCache = [];
    return jsonCache;
  }
}

function hashCode(code: string): string {
  return createHash("sha256").update(code.trim()).digest("hex");
}

/** Look up a tester by their plaintext invite code. */
export async function findTesterByCode(code: string): Promise<BetaTester | null> {
  if (!code) return null;
  const hash = hashCode(code);

  // Try the DB first.
  try {
    const { data, error } = await db
      .from("beta_testers")
      .select("id, display_name, code_hash, revoked_at")
      .eq("code_hash", hash)
      .is("revoked_at", null)
      .maybeSingle();

    if (error) {
      console.error("[beta] beta_testers lookup failed:", error);
    } else if (data) {
      return {
        id: data.id as string,
        displayName: data.display_name as string,
        codeHash: data.code_hash as string,
      };
    }
  } catch (err) {
    console.error("[beta] beta_testers lookup threw:", err);
  }

  // Fallback to JSON.
  return loadFromJson().find((t) => t.codeHash === hash) ?? null;
}

/** Look up a tester by their stable id (used by the cookie payload). */
export async function findTesterById(id: string): Promise<BetaTester | null> {
  if (!id) return null;

  try {
    const { data, error } = await db
      .from("beta_testers")
      .select("id, display_name, code_hash, revoked_at")
      .eq("id", id)
      .is("revoked_at", null)
      .maybeSingle();

    if (error) {
      console.error("[beta] beta_testers id lookup failed:", error);
    } else if (data) {
      return {
        id: data.id as string,
        displayName: data.display_name as string,
        codeHash: data.code_hash as string,
      };
    }
  } catch (err) {
    console.error("[beta] beta_testers id lookup threw:", err);
  }

  return loadFromJson().find((t) => t.id === id) ?? null;
}
