# OTP Verification

Admin actions — **list**, **delist**, and **update** — require one-time password (OTP) verification to prove you control the registered address. This is powered by ZVS (Zcash Verification Service).

## How it works

1. **The interface generates a verification memo** containing a unique session ID and your registered address
2. **You send this memo to yourself** as a shielded Zcash transaction (minimum 0.002 ZEC)
3. **ZVS detects the transaction** in the mempool and generates a 6-digit OTP using HMAC-SHA256
4. **ZVS sends the OTP back** to your address as a shielded memo
5. **You enter the OTP** in the interface to authorize your action

## Why this exists

ZNS has no accounts or passwords. The only way to prove you own a name is to prove you control the Zcash address it's registered to. OTP verification does this by requiring you to send a transaction from that address and receive a response at it.

## Memo format

The verification memo follows this format:

```
DO NOT MODIFY:{zvs/<session_id>,<your_address>}
```

- `session_id` — 48-digit random number that seeds the OTP
- `your_address` — the unified address registered to your name

## Security properties

- **Stateless** — the OTP is deterministic (HMAC-SHA256 of the session ID), so both ZVS and the web interface can compute the same code independently
- **Shielded** — all verification transactions use Orchard shielded notes, so the OTP is never visible on-chain
- **No login** — there is no account to compromise; verification is per-action
