# Scanner Phase — Implementation Plan

Status: **proposed, awaiting review**
Component: [components/landing/Zip321Modal.tsx](../components/landing/Zip321Modal.tsx)
Author: design pass with Claude

## Goal

After a user submits a name-related transaction (claim / buy / update / list / delist / release), give them a way to confirm the transaction actually landed without leaving the modal. Today the modal closes blindly the moment they click **Done** on the payment QR — there's no feedback loop.

## UX changes

### Payment phase
- Rename the **Done** button to **I Sent It!**.
- Clicking it now advances to a new `scanning` phase instead of closing the modal.
- The **Copy URI** button is unchanged.

### New scanning phase
- Replaces the payment QR view.
- Polls two data sources every **2 seconds** for the target name:
  1. **Mempool** — `GET https://light.zcash.me/mempool-mainnet/lookup/:name`
  2. **Resolver** — existing `resolve()` server action.
- Renders one of four non-terminal states plus the terminal `mined` state.
  A `sawMempoolRef` flag goes sticky-true the first time the mempool reports
  the tx in the current scanning session, so once we've had positive evidence
  we never regress to "not detected" — the natural gap between leaving the
  mempool and showing up in the resolver becomes `being_mined` instead.

| Mempool | Resolver | sawMempool | State           | Copy (action-aware)                                                                             |
|---------|----------|------------|-----------------|-------------------------------------------------------------------------------------------------|
| empty   | empty    | false      | not_detected    | "Your {noun} hasn't been detected yet. It may not have propagated, or wasn't sent correctly."   |
| success | empty    | (set true) | in_mempool      | "Your {noun} is in the mempool. Waiting to be mined."                                           |
| empty   | empty    | true       | being_mined     | "Your {noun} is being mined. Hang tight — this should only take a moment."                       |
| any     | success  | any        | mined (terminal)| Per-action confirmation copy (see table)                                                         |

Decision logic each poll:

```
if mempool.found              → sawMempool = true
if resolver === "success"     → mined          (terminal, polling stops)
else if mempool.found         → in_mempool
else if sawMempool            → being_mined
else                          → not_detected
```

- Three buttons: **Back** (returns to payment phase so the user can re-scan), **View on Explorer** (opens `/explorer?name={name}` in a new tab), and **Done** (closes the modal).
- Polling stops when the mined state is reached. It also stops on unmount and on phase change.
- A subtle spinner indicates active polling; it disappears once polling stops.

### Per-action copy

| Action  | Resolver "success" check                                  | Mined message                                                          |
|---------|-----------------------------------------------------------|------------------------------------------------------------------------|
| claim   | registration exists, address matches input                | "**name.zcash** is yours. Claim confirmed on-chain."                   |
| buy     | registration exists, address matches buyer input          | "**name.zcash** is now yours. Purchase confirmed on-chain."            |
| update  | registration address equals new input address             | "Address updated. **name.zcash** now resolves to your new address."    |
| list    | registration has a `listing` matching the new price       | "**name.zcash** is now listed for sale."                               |
| delist  | registration exists with no `listing`                     | "**name.zcash** has been delisted."                                    |
| release | registration is gone (status `available`)                 | "**name.zcash** has been released."                                    |

The "in mempool" and "not detected" copy uses the action's lowercase verb noun ("claim", "purchase", "update", "listing", "delist", "release").

## Assumptions (confirmed with PM)

1. **Mempool empty = HTTP 404, success = HTTP 200**. Network errors are treated as `empty` so polling doesn't get stuck on transient failures.
2. **Testnet has no mempool endpoint** — on testnet we skip the mempool check entirely and only poll the resolver. The "in mempool" state is therefore unreachable on testnet; users will see "not detected" until the resolver flips to success.
3. **Back** returns the user to the payment QR phase, not back to the input/OTP phases. The signed memo is preserved so the same QR is still valid.
4. Polling stops once the mined (terminal) state is reached. There is no auto-close — the user must click **Done**.

## Files touched

### New: `lib/zns/mempool.ts` (server action)

```ts
"use server";
import type { Network } from "@/lib/zns/name";

export async function checkMempool(
  name: string,
  network: Network,
): Promise<{ found: boolean }> {
  if (network !== "mainnet") return { found: false };
  try {
    const r = await fetch(
      `https://light.zcash.me/mempool-mainnet/lookup/${encodeURIComponent(name)}`,
      { cache: "no-store" },
    );
    return { found: r.status === 200 };
  } catch {
    return { found: false };
  }
}
```

Server-side because of CORS and to avoid leaking the indexer host into the client bundle.

### Modified: `lib/zns/resolve.ts`

Add a small server action `checkScannerState(name, network, action, expected)` that calls the existing `resolve()` and returns `"empty" | "success"` per the per-action table above. `expected` carries the action's input (new address for claim/buy/update; new price in zats for list; nothing for delist/release).

Keeping the per-action interpretation on the server keeps the client component thin and lets us reuse it elsewhere (e.g. SDK / future scanner page).

### Modified: `components/landing/Zip321Modal.tsx`

- Extend the `Phase` union with `"scanning"`.
- Payment phase: rename **Done** → **I Sent It!**, change `onClick` from `onClose` to `setPhase("scanning")`.
- New `scanning` phase render block with status copy, spinner, **Back**, **Done**.
- New state: `scanState: "loading" | "not_detected" | "in_mempool" | "mined"`.
- New `useEffect` keyed on `phase === "scanning"`:
  - Defines an async `poll()` that calls both server actions in parallel and updates `scanState`.
  - Runs once immediately, then `setInterval(poll, 2000)`.
  - On `scanState === "mined"`, clears the interval.
  - Cleanup clears the interval on unmount or phase change.
- No changes to `transaction.ts` or the action types.

## Edge cases

- **Wallet sends late**: user clicks "I Sent It!" before broadcasting. They'll see "not detected" until the wallet actually sends; polling keeps running, so it'll flip to "in mempool" or straight to "mined" automatically.
- **Tx leaves mempool before user clicks**: handled — that's the whole reason we check the resolver in parallel. They'll go straight to "mined".
- **Tx is in mempool, then leaves before resolver catches up**: handled by the `sawMempoolRef` sticky flag. The brief gap renders as `being_mined` rather than regressing to `not_detected`. The flag is reset every time the scanning phase begins (so Back → I Sent It! starts fresh).
- **Network error on mempool fetch**: treated as `empty`. We don't surface infra errors to the user mid-confirmation.
- **User clicks Back, then I Sent It! again**: a fresh scanning session begins. State is reset by the `useEffect` cleanup.
- **Modal closed during polling**: cleanup clears the interval. No leaked timers.
- **Testnet**: mempool check is short-circuited to `empty`. Only the resolver decides the terminal state.

## Open questions / future work

- Should we surface a "still nothing after N polls" hint with troubleshooting links? Out of scope for now.
- Should we auto-refresh the explorer page on Done? Not in this change.
- The mempool endpoint host should probably move to network constants alongside `ZIP321_RECIPIENT_ADDRESS` etc. — small follow-up.
