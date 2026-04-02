# Update Address

You can change the unified address that your name resolves to.

## Steps

1. Search for your registered name
2. Click **Update**
3. Complete [OTP verification](otp-verification.md) to prove you own the name
4. Enter the new unified address
5. A signed memo is generated
6. Send the transaction from your wallet

## What happens on-chain

The transaction memo contains:

```
ZNS:UPDATE:<name>:<new_unified_address>:<nonce>:<ed25519_signature>
```

The indexer verifies the signature and nonce, then updates the address mapping. The name now resolves to your new address.

## When to update

- You rotated your wallet keys
- You want to receive payments at a different address
- You're transferring the name to a different address you control
