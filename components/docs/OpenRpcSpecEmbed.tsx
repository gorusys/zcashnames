/**
 * Server component wrapper that fetches the canonical openrpc.json from the
 * ZNS indexer repo and hands the parsed spec to the client OpenRpcExplorer.
 *
 * No mirror in public/ - Next.js fetch cache refreshes hourly, and the public
 * /openrpc.json URL is re-served by app/openrpc.json/route.ts.
 */

import { OpenRpcExplorer } from "./OpenRpcExplorer";

const UPSTREAM =
  "https://raw.githubusercontent.com/zcashme/ZNS/master/openrpc.json";

export default async function OpenRpcSpecEmbed() {
  const res = await fetch(UPSTREAM, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`openrpc.json fetch failed: ${res.status}`);
  }
  const spec = await res.json();
  return <OpenRpcExplorer spec={spec} />;
}
