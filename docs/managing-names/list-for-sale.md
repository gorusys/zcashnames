# List for Sale

You can list any name you own on the ZNS marketplace.

## Steps

1. Search for your registered name
2. Click **List for Sale**
3. Complete [OTP verification](otp-verification.md) to prove you own the name
4. Set your asking price in ZEC
5. A signed memo is generated containing the listing details
6. Send the transaction from your wallet

## What happens on-chain

The transaction memo contains:

```
ZNS:LIST:<name>:<price_in_zatoshis>:<nonce>:<ed25519_signature>
```

The indexer verifies:
- The Ed25519 signature is valid
- The nonce is strictly greater than the current nonce for this name (replay protection)
- The name is registered

Once confirmed, the name appears in the marketplace and anyone can buy it.

## Re-listing

You can update the price of a listed name by listing it again. The new listing replaces the old one.
