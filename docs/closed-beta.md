---
title: ZcashNames Closed Beta
status: source-of-truth reference
---

# ZcashNames Closed Beta

Welcome. ZcashNames (ZNS) is a name registration protocol on Zcash. You register a short name (e.g. `pacu.zcash`, `nullc0py.zcash`) and it resolves to your unified address.

---

## Get Started

You can start testing right away:

1. Go to the home page.
2. Click **Mainnet** or **Testnet** in the header bar (start with Testnet for Phase 1).
3. When the password modal appears, enter the **invite code I sent you**. The same code unlocks both networks.
4. You'll see a "Welcome" toast and a floating **Submit Feedback** button in the bottom-right. Click it -- the panel opens on the **Checklist** tab with your test plan. Reports filed from this session will be auto-attributed to you.

Read the **The Feedback Panel** section below before you start -- it's worth knowing how the panel works.

The plain network passwords (`mainnet`, `testnet`) still work, but submissions made from those sessions are anonymous.

---

## How It Works

You send a shielded transaction to the ZNS registry address with a specifically formatted memo - the indexer picks it up, validates the admin signature, and updates the registry. Names are resolved with a simple JSON-RPC call to the indexer.

For actions that require proving you own the name (update, list, delist, release), there is a one-time-password flow: you send a tiny verification transaction and receive a 6-digit code back in your memo. The OTP flow proves that you control the unified address linked to the registered name - you enter that code in the UI to authorize the action.

---

## Beta Structure

### Phase 1: Testnet

Test everything on testnet first. No real ZEC involved. I'll send you a faucet link. Testnet names registered during beta will persist after the program ends -- feel free to set up a real testnet identity.

### Phase 2: Mainnet Baby

Same flows, on mainnet, at 1/100th of full pricing. I'll send you **0.125 ZEC** at the start of this phase -- that covers your test costs with room to spare.

One thing to be clear about upfront: **mainnet beta names will be wiped when the program ends.** This is a test environment running at reduced prices. When beta closes, pricing moves to full rates and the registry resets.

The 0.125 ZEC is yours to use for testing. Whatever's left over when the program ends is yours to keep -- or donate, if you'd rather pay it forward.

---

## What to Test

The full test plan lives in the **Checklist** tab of the feedback panel -- every individual test you should run, with progress tracking.

The flagship test to make sure you cover: **have another tester send ZEC to your name from their wallet**. That's where wallet/ZIP-321 quirks are most likely to surface.

I want coverage across wallets. Let me know which wallet(s) you'll be using -- Zingo, Zodl, and a couple others are the targets.

---

## The Feedback Panel

Once you've unlocked Mainnet or Testnet on the home page, a floating **Submit Feedback** button stays pinned to the bottom-right corner. Clicking it slides a panel in from the right; the rest of the page reflows to fit, so you can keep using the site alongside it. The top-left chevron collapses the panel; the floating button reappears.

### The two tabs

The panel has two tabs and opens on **Checklist** the first time:

- **Checklist** -- your test plan with checkboxes. Tick the box on the left to mark a task done. Click anywhere on the item title (or the arrow on the right) to set it as the active **"Reporting on"** target.
- **Report** -- the form for submitting bug reports or comments. **Every report must be tied to a checklist item.** If you switch to Report without one selected, you'll see a red prompt to pick one first.

### Checklist → Report flow

- The active item shows a **green outline** in the Checklist tab and a **green "Reporting on" banner** above the Report tab.
- **Submitting a report does not check off the item.** The checkbox is yours to mark when *you* consider that test complete -- you might file several reports against one item before ticking it off.
- Wallet + version is **remembered across reports** -- fill it in once.
- All fields are optional, but you need at least one of *wallet, steps, expected, actual, txid, notes*, or a screenshot before you can submit.
- After Submit, the form clears (wallet stays). You can immediately file another report against the same item.

### General questions and comments

The last item on the checklist -- **"General questions, comments, or anything else"** -- is a catch-all. Use it for feedback that doesn't fit a specific test: questions, suggestions, UX gripes, anything.

### Test in one window, write in another

The popout icon at the top-right of the panel opens the same form in a small standalone window. Keep that on one side of your screen while you run the test on the other. Same cookie, same attribution, same wallet, same checklist progress -- synced live across tabs and windows.

### Re-reading the instructions

The book icon next to the popout (top-right of the panel) opens this page in a new tab anytime.

### Indexer lag is normal

Expect up to a few minutes between a transaction confirming on-chain and the UI catching up. That gap is not a bug -- only report it if it persists past ~10 minutes.

For casual feedback or things you'd rather discuss live, DM me on Signal or Discord.

---

## Confidentiality

Please don't share screenshots or disclose bugs publicly until they're fixed. Use the feedback panel or DM me directly.

---

## Bug Bounties

| Severity | Examples | Reward |
|----------|----------|--------|
| High | Funds at risk, invalid claim accepted, replay attack, core flow broken | 1.0 ZEC |
| Low | Edge case failure, OTP issue, wallet compat gap, wrong error, cosmetic | 0.1 ZEC |

First reporter gets the reward. The feedback form prompts you for everything I need.

---

## What You Need

- A Zcash wallet that supports custom memos and can display received memos (Zingo and Zodl both work)
- Testnet funds for Phase 1 (I'll send faucet)
- About an hour spread across 20 days

---

## Timeline

Rough target: Phase 1 starts within the next two weeks once everyone is onboarded. I'll share the private repo, the endpoint URLs, and a testnet faucet link once you confirm you're in.

---

## Get In Touch

Featured channels (private, end-to-end): Signal, Discord. Other channels: X / Twitter, Telegram. All links live in `lib/zns/brand.ts` and stay in sync with the site footer.

---

## Appendix: Links

### Documentation

- [ZcashNames Docs](/docs) -- protocol overview, wallet integration guide, indexer setup, SDK reference, and the JSON-RPC API
- [SDK Reference](/docs/sdk) -- first-party language ports
- [Running an Indexer](/docs/indexer/running)

### GitHub Repositories

- [`zcashme/zcashnames`](https://github.com/zcashme/zcashnames) -- the web app and docs site (this site)
- [`zcashme/ZNS`](https://github.com/zcashme/ZNS) -- the Rust indexer, the OpenRPC spec, and the SDK ports
- [`zcashme/directory`](https://github.com/zcashme/directory) -- reserved-names directory

### Useful Endpoints

- OpenRPC spec: [`/openrpc.json`](/openrpc.json)
- Testnet indexer: `https://light.zcash.me/zns-testnet`
- Mainnet test indexer: `https://light.zcash.me/zns-mainnet-test`

### File issues

During the closed beta, please use the in-panel feedback form. After launch, public bug reports go to [`zcashme/zcashnames/issues`](https://github.com/zcashme/zcashnames/issues) (web app) or [`zcashme/ZNS/issues`](https://github.com/zcashme/ZNS/issues) (indexer/SDKs).
