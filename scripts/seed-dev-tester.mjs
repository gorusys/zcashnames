/**
 * Upserts a known dev tester into the beta_testers table so you can exercise
 * the attributed invite-code path locally without going through the apply form.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-dev-tester.mjs
 *
 * Or via the package.json shortcut:
 *   pnpm seed-dev
 *
 * After running, go to the home page, click Testnet or Mainnet, and enter:
 *   dev-test-invite
 */

import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

const DEV_INVITE_CODE = "dev-test-invite";
const DEV_TESTER_ID = "tester_dev_local";
const DEV_DISPLAY_NAME = "Dev (local)";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "\nMissing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
    "Run with:  node --env-file=.env.local scripts/seed-dev-tester.mjs\n"
  );
  process.exit(1);
}

const db = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

const codeHash = createHash("sha256").update(DEV_INVITE_CODE).digest("hex");

const { error } = await db.from("beta_testers").upsert(
  {
    id: DEV_TESTER_ID,
    display_name: DEV_DISPLAY_NAME,
    code_hash: codeHash,
    invite_code: DEV_INVITE_CODE,
    status: "invited",
    submitted_at: new Date().toISOString(),
    why: "Local dev seed — not a real applicant.",
    focus_areas: ["user", "sdk"],
    experience: null,
    referral_source: null,
    contact_email: null,
    contact_signal: null,
    contact_discord: null,
    contact_x: null,
    contact_telegram: null,
    contact_forum: null,
    best_contact_kind: "email",
    ip_hash: null,
    user_agent: "seed-script",
  },
  { onConflict: "id" }
);

if (error) {
  console.error("\nUpsert failed:", error.message, "\n");
  process.exit(1);
}

console.log(`
  Dev tester seeded (id: ${DEV_TESTER_ID})

  Invite code  : ${DEV_INVITE_CODE}
  Display name : ${DEV_DISPLAY_NAME}

  On the home page, click Testnet or Mainnet and enter:
    ${DEV_INVITE_CODE}

  You should see a "Welcome, Dev (local)" toast and reports will be attributed
  to this tester. To test the anonymous path, use these passwords instead:
    testnet  →  testnet
    mainnet  →  mainnet
`);
