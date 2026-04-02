# TypeScript SDK

The ZNS TypeScript SDK provides type-safe functions for querying the registry, building memos, and validating names.

## Installation

The SDK is available in the ZNS repository at `sdk/typescript/`.

## Query functions

### `resolve(query, url?)`

Look up a name or address.

```typescript
import { resolve } from "zns-sdk";

const result = await resolve("alice");
// { name: "alice", address: "utest1...", txid: "...", height: 3903307, nonce: 3, listing: null }

const result2 = await resolve("utest1f32kn6c4...");
// Same — looks up by address if query is a valid Zcash address
```

### `listings(url?)`

Get all marketplace listings.

```typescript
import { listings } from "zns-sdk";

const items = await listings();
// [{ name: "bob", price: 100000000, txid: "...", height: 3901250, signature: "..." }]
```

### `status(url?)`

Get indexer sync status.

```typescript
import { status } from "zns-sdk";

const s = await status();
// { synced_height: 3902500, admin_pubkey: "...", ufvk: "...", registered: 42, listed: 3 }
```

### `isAvailable(name, url?)`

Check if a name can be claimed.

```typescript
import { isAvailable } from "zns-sdk";

const available = await isAvailable("alice"); // true or false
```

### `getNonce(name, url?)`

Get the current nonce for a registered name. Returns `null` if the name isn't registered.

```typescript
import { getNonce } from "zns-sdk";

const nonce = await getNonce("alice"); // 3
```

## Memo builders

### `buildClaimMemo(name, ua)`

```typescript
buildClaimMemo("alice", "utest1f32kn6c4...");
// "ZNS:CLAIM:alice:utest1f32kn6c4..."
```

### `buildBuyMemo(name, buyerUa)`

```typescript
buildBuyMemo("alice", "utest1abc123...");
// "ZNS:BUY:alice:utest1abc123..."
```

### `buildListMemo(name, price, nonce, signature)`

```typescript
buildListMemo("alice", 100000000, 1, "R2hTYbdEO/5OGFKc...");
// "ZNS:LIST:alice:100000000:1:R2hTYbdEO/5OGFKc..."
```

### `buildDelistMemo(name, nonce, signature)`

```typescript
buildDelistMemo("alice", 2, "CQID...");
// "ZNS:DELIST:alice:2:CQID..."
```

### `buildUpdateMemo(name, newUa, nonce, signature)`

```typescript
buildUpdateMemo("alice", "utest1new...", 3, "XYZ...");
// "ZNS:UPDATE:alice:utest1new...:3:XYZ..."
```

## Signing payloads

These return the canonical string that must be signed with Ed25519.

```typescript
listPayload("alice", 100000000, 1);    // "LIST:alice:100000000:1"
delistPayload("alice", 2);              // "DELIST:alice:2"
updatePayload("alice", "utest1...", 3); // "UPDATE:alice:utest1...:3"
```

## Validation

### `isValidName(name)`

```typescript
isValidName("alice");     // true
isValidName("-alice");    // false
isValidName("ALICE");     // false
```

### `claimCost(nameLength)`

Returns the claim cost in zatoshis.

```typescript
claimCost(1);  // 600_000_000
claimCost(3);  // 300_000_000
claimCost(7);  // 25_000_000
```

## Error handling

The SDK throws `ZNSError` with typed error codes:

```typescript
import { ZNSError, ErrorType } from "zns-sdk";

try {
  await resolve("alice");
} catch (e) {
  if (e instanceof ZNSError) {
    console.log(e.type); // ErrorType enum value
  }
}
```

## Configuration

All query functions accept an optional `url` parameter. Defaults to `https://names.zcash.me`.

```typescript
await resolve("alice", "http://localhost:3000");
```
