# Keypair Page Refactor Checklist

## Context

`app/(site)/keypair/page.tsx` — fully client-side Ed25519 signing tool. Users generate or import a keypair, paste a ZNS payload, sign it, and copy the result back to the signing modal. All crypto stays in the browser.

The indexer (`~/ZcashMe/ZNS/src/memo.rs`) parses the on-chain memo format:
```
ZNS:{action}:{...fields}:{sig}[:{pubkey}]
```
The pubkey field in the memo is optional (legacy names may not have one).

The CLI tool (`~/ZcashMe/ZNS/tools/zns-sign`) uses raw 32-byte Ed25519 seeds via `ZNS_SIGNING_KEY` env var.

## Done

- [x] Replace WebCrypto (`window.crypto.subtle`) with `@noble/ed25519`
- [x] Remove public key input from import tab — derive public key from seed automatically
- [x] Key format: raw 32-byte seed (base64), compatible with CLI `ZNS_SIGNING_KEY`
- [x] JSON export: `privkey` field (was `privkey_pkcs8`)
- [x] JSON import: auto-activates keypair, no "Use this keypair" click required
- [x] Remove "Use this keypair" button
- [x] Remove two async `useEffect` key validation hooks
- [x] Stale signature cleared when keypair changes (generate or import)
- [x] Typo fix: "interpretted" → "interpreted"
- [x] Remove `subtleAvailable` state and WebCrypto availability warning banner

## Remaining

### 1. Commit current changes
Commit the done items above as an atomic commit before proceeding.

### 2. Replace accordion with progressive disclosure
The current page uses a 3-step accordion with collapse/expand buttons gated on completion state. This is the wrong pattern — it's a wizard forced into accordion clothing, with broken gate logic:

- Step 3 collapse gated on same condition as Step 2 (wrong — Step 3 is read-only output)
- Step 2 collapsible with a stale signature if payload changed after signing
- Disabled collapse button gives no explanation to the user
- Can't collapse the current step to navigate back up

Replace with plain progressive disclosure: sections appear as state is ready, no collapse/expand needed.

- Remove: `step1Open`, `step2Open`, `step3Open`
- Remove: `step1Complete`, `step2Complete`, `step3Complete`
- Remove: the `useEffect` that drives step navigation
- Remove: all collapse/expand button gate logic
- Keypair section: always visible
- Sign section: appears when `activeSeed` is set
- Output section: appears when `signatureB64` is set

### 3. Add top-level reset ("Start over")
No global reset exists anywhere on the page. "Clear" on the import tab only clears the two import fields. "Generate Another" overwrites the keypair but leaves payload and signature from the previous session.

A single "Start over" button should reset everything:
- `activeSeed`, `activeSource`
- `publicKeyB64`, `privateKeyB64`
- `importPrivB64`, `importPrivError`
- `payload`, `signatureB64`
- `error`, `exportLabel`
- Tab back to `"import"`

### 4. Add assembled memo output field
The page currently outputs signature and public key as separate fields. The user or the signing modal has to assemble the actual memo manually — an error surface.

The ZNS memo format (from `memo.rs`) is:
```
ZNS:{payload}:{sig}:{pk}
```

Example for a CLAIM:
```
ZNS:CLAIM:alice:zs1abc...:BASE64SIG:BASE64PUBKEY
```

Add a read-only textarea + copy button in the output section showing the fully assembled memo string. This is what gets embedded in the Zcash transaction memo field.

### 5. Verify signing modal assembles memo correctly
The keypair page feeds sig + pubkey back to a signing modal elsewhere in the app. Confirm that modal constructs `ZNS:{payload}:{sig}:{pk}` correctly and matches the format `memo.rs` parses. Find the modal and read it.

## Low priority / known but acceptable

- JSON export `label` field is exported but ignored on re-import (cosmetic)
- `useEffect` for `?payload=` URL param pre-fill (acceptable, low impact)
