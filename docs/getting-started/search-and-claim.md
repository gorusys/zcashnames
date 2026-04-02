# Search & Claim a Name

## Searching

Enter any name on the homepage. The search checks availability across both `.zcash` and `.zec` suffixes and shows related suggestions (e.g. searching "alice" also checks "alicewallet", "alicepay", "aliceapp", etc.).

Each result shows one of three statuses:

| Status | Meaning |
|--------|---------|
| **Available** | Not yet registered. You can claim it. |
| **For Sale** | Registered but listed on the marketplace. You can buy it. |
| **Registered** | Taken and not for sale. |

See docs\developer-guide\search-result-scenario-matrix.md
## Claiming a name

1. Search for your desired name
2. Click **Claim** on an available name
3. Enter your **Zcash unified address** — this is the address the name will resolve to
4. Click **Generate Payment**
5. A ZIP-321 payment URI is generated containing the exact amount and memo
6. Copy the URI or scan the QR code with your Zcash wallet
7. Send the transaction

Once the transaction is confirmed on-chain, the ZNS indexer processes it and the name is yours.

## What happens on-chain

When you claim a name, your wallet sends a shielded transaction to the ZNS registry address. The memo field contains:

```
ZNS:CLAIM:<name>:<your_unified_address>
```

The transaction amount must be at least the [claim cost](pricing.md) for the name's length. The indexer validates the memo, checks the name isn't already taken, and registers it.

## Tips

- Names are **first-come-first-served** by block height. If two people try to claim the same name in the same block, the one with the lower transaction index wins.
- Use a **unified address** for maximum privacy. Transparent and Sapling addresses work but offer less privacy. See [Address Types & Privacy](../developer-guide/address-types.md).
- You can star/bookmark names during search to keep track of ones you're interested in. Starred names are saved in your browser's local storage.
