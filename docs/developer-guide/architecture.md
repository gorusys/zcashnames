# Architecture Overview

ZNS consists of three components that work together:

```
┌──────────────┐     shielded txs      ┌──────────────┐
│  Zcash       │◄──────────────────────►│  ZNS Indexer │
│  Blockchain  │     (Orchard memos)    │  (Rust)      │
│  (Testnet)   │                        │              │
└──────┬───────┘                        └──────┬───────┘
       │                                       │
       │                                       │ JSON-RPC
       │                                       │
       │    ┌──────────────┐            ┌──────▼───────┐
       │    │  ZVS         │            │  Web App     │
       │    │  (OTP        │◄──────────►│  (Next.js)   │
       │    │   Service)   │  server    └──────────────┘
       └────┤              │  actions
            └──────────────┘
```

## ZNS Indexer

The core of the system. A Rust service that:

- Connects to a lightwalletd instance (gRPC)
- Streams blocks and trial-decrypts Orchard shielded notes using its viewing key
- Parses `ZNS:` memos and applies them to a SQLite registry
- Exposes a read-only JSON-RPC API for queries

All write operations happen on-chain. The indexer is a passive observer that builds state from the blockchain.

## ZVS (Zcash Verification Service)

A separate Rust service that provides OTP-based authentication for admin actions. It watches the mempool for verification requests and responds with 6-digit codes via shielded memos. See [OTP Verification](../managing-names/otp-verification.md).

## Web App (zcashname)

A Next.js application that provides the user interface. It:

- Queries the ZNS indexer via JSON-RPC (through server actions)
- Builds memos and ZIP-321 payment URIs client-side
- Signs admin action memos with Ed25519 (server-side)
- Generates and verifies OTPs using the shared HMAC secret

The web app never writes to the blockchain directly. It constructs payment URIs that the user's wallet executes.

## Data flow

**Claiming a name:**
1. User searches on the web app
2. Web app queries ZNS indexer (`resolve` RPC) to check availability
3. User provides their unified address
4. Server action builds a `ZNS:CLAIM:...` memo and calculates the cost
5. Web app generates a ZIP-321 URI with the memo and amount
6. User sends the transaction from their wallet
7. ZNS indexer detects the transaction, validates the memo, registers the name

**Admin action (e.g. listing for sale):**
1. User initiates action on the web app
2. Web app generates an OTP verification memo
3. User sends the verification transaction to themselves
4. ZVS detects it, responds with a 6-digit OTP
5. User enters the OTP in the web app
6. Server action verifies the OTP, signs the memo with Ed25519
7. Web app generates a ZIP-321 URI with the signed memo
8. User sends the transaction; indexer validates signature and applies the action
