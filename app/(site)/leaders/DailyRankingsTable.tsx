"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DailyRow, RankingEntry } from "@/lib/leaders/leaders";

const ROWS_PER_PAGE = 7;

function EntryCell({ entry, badgeType }: { entry?: RankingEntry; badgeType?: "red" | "blue" | null }) {
  if (!entry) return <span className="text-fg-muted">—</span>;
  return (
    <span className="text-fg-heading font-semibold">
      {entry.name}
      {badgeType === "red" && <span className="ml-1" title="2+ day streak">🔥</span>}
      {badgeType === "blue" && <span className="ml-1" title="#1 today">💙</span>}
      <span className="ml-1.5 text-fg-muted font-normal">({entry.count})</span>
    </span>
  );
}

export default function DailyRankingsTable({ dailyRankings }: { dailyRankings: DailyRow[] }) {
  const [mode, setMode] = useState<"daily" | "allTime">("daily");
  const [visibleRows, setVisibleRows] = useState(ROWS_PER_PAGE);

  const rows = useMemo(() => [...dailyRankings].reverse(), [dailyRankings]);
  const displayed = rows.slice(0, visibleRows);
  const canExpand = visibleRows < rows.length;
  const canCollapse = visibleRows > ROWS_PER_PAGE;

  return (
    <section
      className="overflow-hidden rounded-2xl border"
      style={{ background: "var(--leaders-card-bg)", borderColor: "var(--leaders-card-border)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <h2 className="font-semibold" style={{ fontSize: "var(--type-section-subtitle)", color: "var(--fg-heading)" }}>
          Daily Rankings
        </h2>
        <div className="flex rounded-full" style={{ background: "var(--color-raised)" }}>
          <button
            type="button"
            onClick={() => setMode("daily")}
            className="px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all"
            style={{
              background: mode === "daily" ? "var(--leaders-rank-gold)" : "transparent",
              color: mode === "daily" ? "var(--leaders-rank-text)" : "var(--fg-muted)",
            }}
          >
            24h
          </button>
          <button
            type="button"
            onClick={() => setMode("allTime")}
            className="px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all"
            style={{
              background: mode === "allTime" ? "var(--leaders-rank-gold)" : "transparent",
              color: mode === "allTime" ? "var(--leaders-rank-text)" : "var(--fg-muted)",
            }}
          >
            All-time
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr
              className="border-b text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-fg-dim"
              style={{ borderColor: "var(--leaders-card-border)" }}
            >
              <th className="px-4 py-3 sm:px-6">Date</th>
              <th className="px-4 py-3 sm:px-6">1st</th>
              <th className="px-4 py-3 sm:px-6">2nd</th>
              <th className="px-4 py-3 sm:px-6">3rd</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-fg-muted">No data yet.</td>
              </tr>
            ) : (
              displayed.map((row) => {
                const entries = mode === "daily" ? row.daily : row.allTime;
                const topBadge = mode === "daily" ? row.topBadge : null;
                return (
                  <tr
                    key={row.date}
                    className="border-b last:border-b-0 transition-colors"
                    style={{ borderColor: "var(--leaders-card-border)" }}
                  >
                    <td className="px-4 py-3 sm:px-6">
                      <Link
                        href={`/leaders/${row.date}`}
                        className="font-mono text-fg-body hover:text-fg-heading transition-colors underline underline-offset-4 decoration-transparent hover:decoration-current"
                      >
                        {row.date}
                      </Link>
                    </td>
                    <td className="px-4 py-3 sm:px-6"><EntryCell entry={entries[0]} badgeType={topBadge} /></td>
                    <td className="px-4 py-3 sm:px-6"><EntryCell entry={entries[1]} /></td>
                    <td className="px-4 py-3 sm:px-6"><EntryCell entry={entries[2]} /></td>
                  </tr>
                );
              })
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
              Show {Math.min(ROWS_PER_PAGE, rows.length - visibleRows)} more ▼
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
