"use client";

import { useState } from "react";
import { useStatus } from "@/components/StatusToggle";

export default function ExplorerStatsBar() {
  const { data, loading } = useStatus();
  const [uivkOpen, setUivkOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const stats = data?.mode === "search" ? data.stats : null;
  const shimmer = <span className="inline-block h-[0.85em] w-12 animate-pulse rounded-md bg-fg-dim/20 align-middle" />;
  const showLoading = loading || !stats;

  function copyUivk() {
    if (!stats?.uivk) return;
    navigator.clipboard.writeText(stats.uivk);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm"
        style={{ background: "var(--feature-card-bg)", border: "1px solid var(--faq-border)" }}
      >
        <div className="flex gap-6">
          <div>
            <span className="text-fg-dim">Synced </span>
            <span className="font-semibold text-fg-heading tabular-nums">
              {showLoading ? shimmer : stats.syncedHeight.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-fg-dim">Registered </span>
            <span className="font-semibold text-fg-heading tabular-nums">
              {showLoading ? shimmer : stats.claimed.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-fg-dim">Listed </span>
            <span className="font-semibold text-fg-heading tabular-nums">
              {showLoading ? shimmer : stats.forSale.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {stats?.uivk && (
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
    </>
  );
}
