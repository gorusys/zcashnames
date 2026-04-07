export const DEFAULT_URL = "https://names.zcash.me";

/**
 * Known canonical Unified Incoming Viewing Keys (UIVKs) for the official ZNS
 * indexer instances. The SDK pins these so a client connecting to a hostile
 * RPC server can detect that it's being pointed at a different registry wallet
 * than the one it expects.
 */
export const TESTNET_UIVK =
  "uivktest1hzw7wyadutvzfgpna80yftsk5l7jeyu2p5me5quvp28tytxueta00cx4068wnlzcv7tx9n3t3gfhsy83pe4y6jrhxtzaq0hj6xtg5zrk2dn7zen3vns2a5pgs4fxdjlletmqrhfa42";

export const MAINNET_UIVK =
  "uivk1gl26qy0xjja7lqhyg3pf0x4j4j66kqwewrjkdcg28eqq4wgtzjmujpee7x9cs2ec9xhnlgrm8ptlw8z80j2aryw8nqtssser2ys778a0s00uvgkdjnfr58sndhfvc3f4zqjs6ywva6";

export const KNOWN_UIVKS: readonly string[] = [TESTNET_UIVK, MAINNET_UIVK];

export const CLAIM_PRICES: Record<number, number> = {
  1: 600_000_000,
  2: 425_000_000,
  3: 300_000_000,
  4: 150_000_000,
  5: 75_000_000,
  6: 50_000_000,
};

export const DEFAULT_CLAIM_PRICE = 25_000_000;
