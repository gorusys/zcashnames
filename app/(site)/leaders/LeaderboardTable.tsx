"use client";

import { useState } from "react";
import type { LeaderboardEntry } from "@/lib/leaders/leaders";

const ROWS_PER_PAGE = 7;

/* ── Rank badge ──────────────────────────────────────────────────── */

const rankGradients: Record<number, string> = {
  1: "var(--leaders-rank-gold)",
  2: "var(--leaders-rank-silver)",
  3: "var(--leaders-rank-bronze)",
};

function RankBadge({ rank }: { rank: number }) {
  const gradient = rankGradients[rank];
  if (!gradient) return <>{rank}</>;
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
      style={{ background: gradient, color: "var(--leaders-rank-text)" }}
    >
      {rank}
    </span>
  );
}

/* ── ZEC symbol ──────────────────────────────────────────────────── */

function ZecSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} style={{ width: "0.6em", height: "0.6em", verticalAlign: "baseline", marginBottom: "0.05em" }}>
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
      <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 6H14L6 14H14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Copy button ─────────────────────────────────────────────────── */

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://zcashnames.com/?ref=${code}`;

  return (
    <button
      type="button"
      title="Copy referral link"
      className="ml-1.5 inline-flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8l4 4 8-8" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
      )}
    </button>
  );
}

/* ── Table ────────────────────────────────────────────────────────── */

export default function LeaderboardTable({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  const [visibleRows, setVisibleRows] = useState(ROWS_PER_PAGE);

  const displayed = leaderboard.slice(0, visibleRows);
  const canExpand = visibleRows < leaderboard.length;
  const canCollapse = visibleRows > ROWS_PER_PAGE;

  return (
    <section
      className="overflow-hidden rounded-2xl border"
      style={{ background: "var(--leaders-card-bg)", borderColor: "var(--leaders-card-border)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr
              className="border-b text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-fg-dim"
              style={{ borderColor: "var(--leaders-card-border)" }}
            >
              <th className="px-4 py-3 sm:px-6">Rank</th>
              <th className="px-4 py-3 sm:px-6">ZcashName</th>
              <th className="px-4 py-3 text-right sm:px-6">
                <span className="hidden sm:inline">Referrals</span>
                <span className="sm:hidden">Refers</span>
              </th>
              <th className="px-4 py-3 text-right sm:px-6">24h</th>
              <th className="px-4 py-3 text-right sm:px-6">Max. Pay</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-fg-muted">No referrals yet.</td>
              </tr>
            ) : (
              displayed.map((entry) => (
                <tr
                  key={entry.rank}
                  className="border-b last:border-b-0 transition-colors"
                  style={{ borderColor: "var(--leaders-card-border)" }}
                >
                  <td className="px-4 py-3 font-semibold text-fg-heading sm:px-6">
                    <RankBadge rank={entry.rank} />
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <span className="font-semibold text-fg-heading">{entry.name}</span>
                    {entry.streak && <span className="ml-1" title="2+ day streak at #1">🔥</span>}
                    {entry.topRecent && <span className="ml-1" title="#1 in last 24h">💙</span>}
                    <CopyButton code={entry.referral_code} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-fg-heading sm:px-6">
                    {entry.referrals}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-fg-body sm:px-6">
                    {entry.recent > 0 ? `+${entry.recent}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-fg-body sm:px-6">
                    <ZecSymbol className="mr-0.5 inline-block" />{" "}{entry.potential_rewards}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(canExpand || canCollapse) && (
        <div className="flex justify-center border-t px-4 py-3" style={{ borderColor: "var(--leaders-card-border)" }}>
          {canExpand && (
            <button
              type="button"
              onClick={() => setVisibleRows((v) => v + ROWS_PER_PAGE)}
              className="text-xs font-semibold text-fg-muted hover:text-fg-heading transition-colors cursor-pointer"
            >
              Show {Math.min(ROWS_PER_PAGE, leaderboard.length - visibleRows)} more ▼
            </button>
          )}
          {canCollapse && !canExpand && (
            <button
              type="button"
              onClick={() => setVisibleRows(ROWS_PER_PAGE)}
              className="text-xs font-semibold text-fg-muted hover:text-fg-heading transition-colors cursor-pointer"
            >
              Collapse ▲
            </button>
          )}
        </div>
      )}
    </section>
  );
}
