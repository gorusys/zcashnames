/**
 * ZIP-321 payment URI helpers - browser-safe, no Node.js dependencies.
 */

export function buildZcashUri(
  address: string,
  amount: string = "0",
  memo: string = ""
): string {
  if (!address) return "";
  const base = `zcash:${address}`;
  const params: string[] = [];
  if (amount && Number(amount) > 0) params.push(`amount=${amount}`);
  if (memo) params.push(`memo=${toBase64Url(memo)}`);
  return params.length ? `${base}?${params.join("&")}` : base;
}

export function parseZip321Uri(uri: string) {
  const withoutScheme = String(uri ?? "").replace(/^zcash:/i, "");
  const [addressPart, queryPart = ""] = withoutScheme.split("?");
  const address = addressPart.trim();
  const params = new URLSearchParams(queryPart);
  const amount = String(params.get("amount") ?? "").trim();
  const memoRaw = String(params.get("memo") ?? "").trim();
  const memoDecoded = memoRaw ? decodeBase64UrlToUtf8(memoRaw) : "";
  return { address, amount, memoRaw, memoDecoded };
}

/* ── base64url encoding ──────────────────────────────────────────────── */

export function toBase64Url(text: string): string {
  // @ts-expect-error
  return new TextEncoder().encode(text).toBase64({ alphabet: "base64url", omitPadding: true });
}

export function decodeBase64UrlToUtf8(value: string): string {
  // @ts-expect-error
  return new TextDecoder().decode(Uint8Array.fromBase64(value, { alphabet: "base64url" }));
}
