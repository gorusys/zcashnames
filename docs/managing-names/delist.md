# Delist

Remove your name from the marketplace so it's no longer available for purchase.

## Steps

1. Search for your listed name
2. Click **Delist**
3. Complete [OTP verification](otp-verification.md) to prove you own the name
4. A signed memo is generated
5. Send the transaction from your wallet

## What happens on-chain

The transaction memo contains:

```
ZNS:DELIST:<name>:<nonce>:<ed25519_signature>
```

The indexer verifies the signature and nonce, then removes the listing. The name remains registered to you but is no longer for sale.
