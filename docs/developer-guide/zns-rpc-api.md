# ZNS RPC API Reference

The ZNS indexer exposes a read-only JSON-RPC 2.0 API over TCP.

**Default endpoint:** `http://127.0.0.1:3000`

## Methods

### `resolve`

Look up a name or address in the registry.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resolve",
  "params": { "query": "alice" }
}
```

The `query` parameter accepts either a name or a Zcash unified address. If the query parses as a valid Zcash address, it looks up by address; otherwise it looks up by name.

**Response (found):**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "name": "alice",
    "address": "utest1f32kn6c4...",
    "txid": "c03eb391...",
    "height": 3903307,
    "nonce": 3,
    "signature": "R2hTYbdEO/5OGFKc...",
    "listing": null
  }
}
```

**Response (not found):**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": null
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Registered name |
| `address` | string | Zcash unified address |
| `txid` | string | Transaction ID of the registration |
| `height` | number | Block height of the registration |
| `nonce` | number | Current nonce (incremented by admin actions) |
| `signature` | string \| null | Last admin action signature (base64) |
| `listing` | object \| null | Active listing, if any |

**Listing object:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Listed name |
| `price` | number | Price in zatoshis |
| `txid` | string | Transaction ID of the listing |
| `height` | number | Block height of the listing |
| `signature` | string | Ed25519 signature of the LIST action |

---

### `list_for_sale`

Get all active marketplace listings.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "list_for_sale",
  "params": {}
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "listings": [
      {
        "name": "bob",
        "price": 100000000,
        "txid": "fed321...",
        "height": 3901250,
        "signature": "CQID..."
      }
    ]
  }
}
```

Listings are ordered by block height descending (newest first).

---

### `status`

Get indexer synchronization status.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "status",
  "params": {}
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "synced_height": 3902500,
    "admin_pubkey": "eJ1mZqeYaQKe77xcgMrFD5sgUFYZzToKnNFEqVA43+8=",
    "ufvk": "uviewtest1qqq...fff",
    "registered": 42,
    "listed": 3
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `synced_height` | number | Latest block the indexer has processed |
| `admin_pubkey` | string | Ed25519 public key (base64) used to verify admin actions |
| `ufvk` | string | Unified full viewing key the indexer watches |
| `registered` | number | Total registered names |
| `listed` | number | Total names currently for sale |

---

## Error codes

| Code | Meaning |
|------|---------|
| `-32700` | Parse error |
| `-32600` | Invalid request |
| `-32601` | Method not found |
| `-32602` | Invalid params |
| `-32603` | Internal error |
