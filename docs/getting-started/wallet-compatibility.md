# Wallet Compatibility

ZNS uses the [ZIP-321](https://zips.z.cash/zip-0321) payment request standard. Any wallet that supports ZIP-321 URIs can be used to claim, buy, and manage names.

## How it works

When you perform an action (claim, buy, list, etc.), the interface generates a `zcash:` URI containing the recipient address, amount, and memo. You paste this URI into your wallet or scan the QR code, review the transaction, and send.

## Requirements

Your wallet must support:

1. **ZIP-321 payment URIs** — to parse the generated `zcash:` links
2. **Orchard shielded transactions** — all ZNS operations use the Orchard pool
3. **Memo field** — the wallet must include the memo exactly as provided (do not modify it)

## Address types

For the best privacy, use a **unified address** when registering your name. See [Address Types & Privacy](../developer-guide/address-types.md) for details on which address types are supported and their privacy tradeoffs.
