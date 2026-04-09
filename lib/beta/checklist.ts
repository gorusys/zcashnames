// Canonical beta-test checklist. Items are referenced by id from:
//   - components/closedbeta/FeedbackChecklist.tsx (the modal/page UI)
//   - the future Supabase `beta_checklist_progress` table
//
// To add or rename items, edit here only — UI and DB schema both key off `id`.
// Items tagged `group: "both"` appear in BOTH sub-lists in the UI but are still
// a single canonical item (one row in state, one tick).

export type ChecklistGroup = "user" | "developer" | "both";

export interface ChecklistItem {
  id: string;
  label: string;
  hint?: string;
  /** If set, the item label becomes a link to this href (opens in a new tab). */
  link?: { href: string };
  group: ChecklistGroup;
}

export const BETA_CHECKLIST: ChecklistItem[] = [
  // ── User experience ──────────────────────────────────────────────────────
  { id: "claim-short", label: "Claim a 1-character name", hint: "Tests reserved/short-name handling and pricing tier.", group: "user" },
  { id: "claim-mid",   label: "Claim a 3-character name", group: "user" },
  { id: "claim-long",  label: "Claim a 7+ character name", group: "user" },
  { id: "otp-update",  label: "Update your address (OTP flow)", hint: "Send the verification tx, get the 6-digit memo, enter the code.", group: "user" },
  { id: "otp-list",    label: "List a name for sale (OTP flow)", group: "user" },
  { id: "otp-delist",  label: "Delist a name (OTP flow)", group: "user" },
  { id: "otp-release", label: "Release a name (OTP flow)", group: "user" },
  { id: "buy-listed",  label: "Buy a name another tester has listed", group: "user" },
  { id: "send-to-name", label: "Have another tester send ZEC to your name", hint: "Flagship use case. Coordinate with another tester via Signal/Discord.", group: "user" },
  { id: "qr-scan",     label: "Scan a QR code from the web UI through your wallet", group: "user" },

  // ── Developer experience ────────────────────────────────────────────────
  // Order: read the doc, then try the thing it documents.
  { id: "review-typescript-ref", label: "Review the TypeScript SDK reference", link: { href: "/docs/sdk/typescript" }, group: "developer" },
  { id: "resolve-sdk",           label: "Resolve a name via the SDK", group: "developer" },
  { id: "review-direct-rpc",     label: "Review the direct JSON-RPC reference", link: { href: "/docs/sdk/direct-rpc" }, group: "developer" },
  { id: "resolve-rpc",           label: "Resolve a name via the raw JSON-RPC API", group: "developer" },

  // ── Catch-all (per group, independent) ──────────────────────────────────
  // These are separate items on purpose — a comment about user flow and a
  // comment about the SDK are unrelated, so each group gets its own.
  { id: "other-user",      label: "General questions, comments, or anything else", group: "user" },
  { id: "other-developer", label: "General questions, comments, or anything else", group: "developer" },
];
