# ZIP-321 Integration

ZNS uses [ZIP-321](https://zips.z.cash/zip-0321) payment request URIs to communicate transaction details to wallets. Instead of asking users to manually copy an address, amount, and memo, the interface generates a single URI that the wallet can parse.

## URI format

```
zcash:<address>?amount=<zec>&memo=<base64url_memo>
```

**Example:**
```
zcash:utest1f32kn6c4...?amount=0.25&memo=Wk5TOkNMQUlNOmFsaWNlOnV0ZXN0MWYzMmtuNmM0Li4u
```

## Components

| Component | Description |
|-----------|-------------|
| `address` | ZNS registry's unified address |
| `amount` | Payment amount in ZEC (decimal) |
| `memo` | Base64url-encoded UTF-8 memo string |

## Memo encoding

The ZNS memo (e.g. `ZNS:CLAIM:alice:utest1...`) is encoded as base64url per RFC 4648:
- Standard base64 with `+` replaced by `-` and `/` replaced by `_`
- No padding (`=` characters stripped)

## How the web app builds URIs

1. Server action constructs the memo string and calculates the amount in zatoshis
2. Client encodes the memo as base64url
3. Client formats the URI: `zcash:<registry_address>?amount=<zec>&memo=<encoded>`
4. URI is displayed as a copyable string and QR code

## For integrators

If you're building a service that interacts with ZNS programmatically, you can skip ZIP-321 and construct transactions directly. The important parts are:

1. Send to the correct ZNS registry address
2. Include the correctly formatted memo (see [Memo Format](memo-format.md))
3. Pay at least the required amount (claim cost or listing price)
4. Use the Orchard shielded pool
