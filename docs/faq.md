# FAQ

## General

### What is ZNS?

ZNS (Zcash Name Service) maps human-readable names like `alice.zcash` to Zcash shielded addresses. Instead of sharing a 200+ character unified address, you share a short name.

### Is ZNS a separate blockchain?

No. ZNS lives entirely within Zcash's existing shielded memo field. Operations are standard Zcash transactions. The indexer is a passive observer that reads the blockchain and builds a registry from it.

### What network does ZNS run on?

ZNS is currently on **Zcash testnet only**. It is experimental software under active development.

### Can I get a refund if someone claims a name before me?

No. Claim transactions are standard Zcash payments. If your claim is rejected (because someone else claimed it first in an earlier block), the payment is still processed. The indexer simply ignores the invalid memo.

---

## Names

### What characters are allowed in names?

Lowercase letters (`a-z`), digits (`0-9`), and hyphens (`-`). No leading, trailing, or consecutive hyphens. 1-62 characters. See [Name Validation Rules](developer-guide/name-validation.md).

### What's the difference between .zcash and .zec?

They are alternate display suffixes for the same name system. `alice.zcash` and `alice.zec` refer to the same underlying registration.

### Can I register multiple names?

Each address can only have one name, and each name can only have one address. To register multiple names, use different addresses.

### How are conflicts resolved?

First-come-first-served by block height. If two claims for the same name appear in the same block, the one with the lower transaction index wins.

---

## Marketplace

### How do I buy a name?

Search for the name, click **Buy**, enter your unified address, and send the generated transaction. The payment amount must be at least the listed price. Ownership transfers to you once the transaction is confirmed.

### Can I change the price of my listing?

Yes. List the name again with a new price. The new listing replaces the old one.

### What happens when someone buys my name?

The name's registered address changes to the buyer's address, the listing is removed, and the nonce resets to 0.

---

## Security

### What is OTP verification?

A stateless two-factor authentication mechanism using Zcash shielded transactions. You prove you own an address by sending a verification transaction from it and receiving a one-time password back. See [OTP Verification](managing-names/otp-verification.md).

### What is the Ed25519 signature for?

Admin actions (list, delist, update) include an Ed25519 signature in the memo to prove they were authorized by the ZNS admin key. This prevents unauthorized modifications.

### What is nonce replay protection?

Each name has a nonce counter. Admin actions must include a nonce strictly greater than the current value. This prevents old signed memos from being re-broadcast.
