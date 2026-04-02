"use client";

import { useEffect, useState } from "react";
import { useStatus } from "@/components/StatusToggle";
import { getHomeStats, getEvents, resolveName } from "@/lib/zns/resolve";
import type { Network } from "@/lib/zns/name";
import type { ResolveName } from "@/lib/types";
import type { ZnsEvent } from "@/lib/zns/client";

type Tab = "activity" | "forsale";

export default function ExplorerShell() {
  const { status } = useStatus();
  const network: Network = status === "mainnet" ? "mainnet" : "testnet";

  const [tab, setTab] = useState<Tab>("activity");
  const [query, setQuery] = useState("");
  const [nameResult, setNameResult] = useState<ResolveName | null>(null);
  const [nameEvents, setNameEvents] = useState<ZnsEvent[]>([]);
  const [searching, setSearching] = useState(false);

  // Stats
  const [stats, setStats] = useState({ claimed: 0, forSale: 0, syncedHeight: 0, uivk: "" });
  const [statsLoading, setStatsLoading] = useState(true);

  // Activity feed
  const [events, setEvents] = useState<ZnsEvent[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsOffset, setEventsOffset] = useState(0);

  // UIVK
  const [uivkOpen, setUivkOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch stats on mount / network change
  useEffect(() => {
    setStatsLoading(true);
    getHomeStats(network).then((s) => {
      setStats({ claimed: s.claimed, forSale: s.forSale, syncedHeight: s.syncedHeight, uivk: s.uivk });
      setStatsLoading(false);
    });
  }, [network]);

  // Fetch events on mount / network change
  useEffect(() => {
    setEventsLoading(true);
    setEventsOffset(0);
    getEvents({ limit: 20 }, network).then((r) => {
      setEvents(r.events);
      setEventsTotal(r.total);
      setEventsLoading(false);
    });
  }, [network]);

  async function loadMoreEvents() {
    const newOffset = eventsOffset + 20;
    const r = await getEvents({ limit: 20, offset: newOffset }, network);
    setEvents((prev) => [...prev, ...r.events]);
    setEventsOffset(newOffset);
  }

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setNameResult(null);
    setNameEvents([]);
    try {
      const res = await resolveName(q, network);
      setNameResult(res);
      const ev = await getEvents({ name: q, limit: 20 }, network);
      setNameEvents(ev.events);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setNameResult(null);
    setNameEvents([]);
  }

  function copyUivk() {
    navigator.clipboard.writeText(stats.uivk);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const shimmer = <span className="inline-block h-[0.85em] w-12 animate-pulse rounded-md bg-fg-dim/20 align-middle" />;

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <h1 className="text-2xl font-semibold text-fg-heading sm:text-3xl">Name Explorer</h1>

      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          placeholder="Search a name or address..."
          className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            background: "var(--color-raised)",
            border: "1.5px solid var(--faq-border)",
            color: "var(--fg-heading)",
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-xl px-5 py-3 text-sm font-bold transition-opacity hover:opacity-80 cursor-pointer"
          style={{
            background: "var(--fg-heading)",
            color: "var(--bg-base, #fff)",
          }}
        >
          Search
        </button>
      </div>

      {/* Name detail (shown after search) */}
      {(searching || nameResult) && (
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--feature-card-bg)", border: "1px solid var(--faq-border)" }}
        >
          {searching ? (
            <div className="flex items-center gap-2 text-fg-muted text-sm">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-fg-dim border-t-fg-heading" />
              Searching...
            </div>
          ) : nameResult && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-fg-heading">{nameResult.query}.zcash</span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide"
                    style={{
                      background: nameResult.status === "available"
                        ? "var(--accent-green, #22c55e)"
                        : nameResult.status === "listed"
                        ? "var(--color-brand-blue, #3b82f6)"
                        : "var(--fg-dim)",
                      color: "#fff",
                    }}
                  >
                    {nameResult.status === "listed" ? "For Sale" : nameResult.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-sm text-fg-muted hover:text-fg-heading transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>

              {nameResult.status !== "available" && (
                <div className="flex flex-col gap-1.5 text-sm">
                  <div>
                    <span className="text-fg-dim">Address: </span>
                    <span className="font-mono text-fg-muted break-all">{nameResult.registration.address}</span>
                  </div>
                  <div>
                    <span className="text-fg-dim">Block: </span>
                    <span className="text-fg-muted">{nameResult.registration.height.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-fg-dim">Txid: </span>
                    <span className="font-mono text-fg-muted break-all">{nameResult.registration.txid}</span>
                  </div>
                  {nameResult.status === "listed" && (
                    <div>
                      <span className="text-fg-dim">Price: </span>
                      <span className="text-fg-muted">{nameResult.listingPrice.zec} ZEC</span>
                    </div>
                  )}
                </div>
              )}

              {nameResult.status === "available" && (
                <div className="text-sm">
                  <span className="text-fg-dim">Claim cost: </span>
                  <span className="text-fg-muted">{nameResult.claimCost.zec} ZEC</span>
                </div>
              )}

              {/* Name event history */}
              {nameEvents.length > 0 && (
                <div className="flex flex-col gap-2 border-t pt-3" style={{ borderColor: "var(--faq-border)" }}>
                  <h3 className="text-sm font-semibold text-fg-heading">History</h3>
                  {nameEvents.map((ev) => (
                    <div key={ev.id} className="flex items-center gap-3 text-sm">
                      <ActionBadge action={ev.action} />
                      <span className="text-fg-muted">block {ev.height.toLocaleString()}</span>
                      <span className="font-mono text-fg-dim text-xs truncate max-w-[12rem]">{ev.txid}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tabs (hidden when viewing search result) */}
      {!nameResult && !searching && (
        <>
          <div className="flex gap-1">
            {(["activity", "forsale"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="rounded-full px-4 py-1.5 text-sm font-bold transition-colors cursor-pointer"
                style={{
                  background: tab === t ? "var(--fg-heading)" : "transparent",
                  color: tab === t ? "var(--bg-base, #fff)" : "var(--fg-muted)",
                }}
              >
                {t === "activity" ? "Activity" : "For Sale"}
              </button>
            ))}
          </div>

          {/* Activity tab */}
          {tab === "activity" && (
            <div className="flex flex-col gap-2">
              {eventsLoading ? (
                <div className="flex flex-col gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 animate-pulse rounded-lg bg-fg-dim/10" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <p className="text-sm text-fg-muted">No events yet.</p>
              ) : (
                <>
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
                      style={{ background: "var(--feature-card-bg)", border: "1px solid var(--faq-border)" }}
                    >
                      <ActionBadge action={ev.action} />
                      <button
                        type="button"
                        onClick={() => { setQuery(ev.name); handleSearchByName(ev.name); }}
                        className="font-semibold text-fg-heading hover:underline cursor-pointer"
                      >
                        {ev.name || "(admin)"}
                      </button>
                      {ev.ua && (
                        <span className="hidden sm:inline font-mono text-fg-dim text-xs truncate max-w-[14rem]">
                          {ev.ua}
                        </span>
                      )}
                      <span className="ml-auto text-fg-dim text-xs tabular-nums">{ev.height.toLocaleString()}</span>
                    </div>
                  ))}
                  {events.length < eventsTotal && (
                    <button
                      type="button"
                      onClick={loadMoreEvents}
                      className="mx-auto mt-2 rounded-full px-5 py-2 text-sm font-bold text-fg-muted hover:text-fg-heading transition-colors cursor-pointer"
                      style={{ border: "1px solid var(--faq-border)" }}
                    >
                      Load More
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* For Sale tab */}
          {tab === "forsale" && (
            <p className="text-sm text-fg-muted">
              {stats.forSale === 0
                ? "No names listed for sale."
                : `${stats.forSale} name${stats.forSale === 1 ? "" : "s"} listed.`}
            </p>
          )}
        </>
      )}

      {/* Stats bar */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm"
        style={{ background: "var(--feature-card-bg)", border: "1px solid var(--faq-border)" }}
      >
        <div className="flex gap-6">
          <div>
            <span className="text-fg-dim">Synced </span>
            <span className="font-semibold text-fg-heading tabular-nums">
              {statsLoading ? shimmer : stats.syncedHeight.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-fg-dim">Registered </span>
            <span className="font-semibold text-fg-heading tabular-nums">
              {statsLoading ? shimmer : stats.claimed.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-fg-dim">Listed </span>
            <span className="font-semibold text-fg-heading tabular-nums">
              {statsLoading ? shimmer : stats.forSale.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* UIVK */}
      {stats.uivk && (
        <div
          className="rounded-xl px-4 py-3"
          style={{ border: "1px solid var(--faq-border)" }}
        >
          <button
            type="button"
            onClick={() => setUivkOpen(!uivkOpen)}
            className="flex w-full items-center justify-between text-sm font-semibold text-fg-dim cursor-pointer"
          >
            <span>Indexer UIVK</span>
            <span className="text-xs">{uivkOpen ? "▾" : "▸"}</span>
          </button>
          {uivkOpen && (
            <div className="mt-3 flex flex-col gap-2">
              <p className="font-mono text-xs text-fg-muted break-all leading-relaxed">{stats.uivk}</p>
              <button
                type="button"
                onClick={copyUivk}
                className="self-start rounded-lg px-3 py-1.5 text-xs font-bold text-fg-muted hover:text-fg-heading transition-colors cursor-pointer"
                style={{ border: "1px solid var(--faq-border)" }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Helper: search by clicking a name in the feed
  async function handleSearchByName(name: string) {
    setSearching(true);
    setNameResult(null);
    setNameEvents([]);
    try {
      const res = await resolveName(name, network);
      setNameResult(res);
      const ev = await getEvents({ name, limit: 20 }, network);
      setNameEvents(ev.events);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  }
}

/* ── Action badge ────────────────────────────────────────────────── */

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    CLAIM:  { bg: "rgba(34,197,94,0.15)",  text: "var(--accent-green, #22c55e)" },
    BUY:    { bg: "rgba(59,130,246,0.15)",  text: "var(--color-brand-blue, #3b82f6)" },
    LIST:   { bg: "rgba(234,179,8,0.15)",   text: "#eab308" },
    DELIST: { bg: "rgba(156,163,175,0.15)", text: "var(--fg-dim)" },
    UPDATE: { bg: "rgba(168,85,247,0.15)",  text: "#a855f7" },
  };
  const c = colors[action] ?? colors.DELIST;

  return (
    <span
      className="rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide"
      style={{ background: c.bg, color: c.text }}
    >
      {action}
    </span>
  );
}
