# Address Types & Privacy

ZNS accepts several Zcash address types when registering a name, but they offer different levels of privacy.

## Address types

| Type | Prefix | Privacy | Recommended |
|------|--------|---------|-------------|
| **Unified** | `u1...` | Highest | Yes |
| **Sapling** | `zs1...` | High | Acceptable |
| **Transparent** | `t1...` | None | No |
| **TEX** | `tex1...` | None | No |

## Recommendations

**Use a unified address.** Unified addresses (starting with `u1` on mainnet or `utest1` on testnet) support the Orchard shielded pool and provide the strongest privacy guarantees. All ZNS transactions use Orchard shielded notes, so a unified address keeps the entire flow private.

**Avoid transparent addresses.** While technically accepted, transparent addresses expose your name-to-identity link on the public blockchain. Anyone can see which transparent address owns which name.

## Viewing keys

The interface also detects Zcash viewing keys (starting with `uview`). These are not valid for registration since they can only observe transactions, not send them.

## Warnings

The web interface displays privacy warnings when you enter a non-unified address:

- **Sapling:** Mild warning — still shielded but doesn't support the latest Orchard pool
- **Transparent/TEX:** Strong warning — publicly visible on-chain, not recommended for name registration
