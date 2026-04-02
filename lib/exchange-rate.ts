const RATE_TIMEOUT_MS = 4500;

const providers = [
  "https://api.coinbase.com/v2/prices/ZEC-USD/spot",
  "https://api.coingecko.com/api/v3/simple/price?ids=zcash&vs_currencies=usd",
  "https://api.kraken.com/0/public/Ticker?pair=ZECUSD",
];

function toPositiveFiniteNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseCoinbase(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const amount = (payload as { data?: { amount?: unknown } }).data?.amount;
  return toPositiveFiniteNumber(amount);
}

function parseCoingecko(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const usd = (payload as { zcash?: { usd?: unknown } }).zcash?.usd;
  return toPositiveFiniteNumber(usd);
}

function parseKraken(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const result = (
    payload as { result?: Record<string, { c?: unknown[] }> }
  ).result;
  if (!result || typeof result !== "object") return null;
  const firstPair = Object.values(result)[0];
  if (!firstPair || !Array.isArray(firstPair.c) || firstPair.c.length === 0)
    return null;
  return toPositiveFiniteNumber(firstPair.c[0]);
}

const parsers = [parseCoinbase, parseCoingecko, parseKraken];

export async function getExchangeRate(): Promise<number | null> {
  for (let i = 0; i < providers.length; i++) {
    const url = providers[i];
    const parser = parsers[i];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), RATE_TIMEOUT_MS);
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) continue;
      const payload = (await response.json()) as unknown;
      const rate = parser(payload);
      if (!rate) continue;
      return rate;
    } catch {
      // continue to next provider
    }
  }

  return null;
}
