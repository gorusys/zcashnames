"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/leaders/leaders";

/* ── Custom tooltip ──────────────────────────────────────────────── */

function formatDelta(n?: number) {
  if (n === undefined) return "";
  return n > 0 ? ` (+${n})` : n < 0 ? ` (${n})` : "";
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string; payload: TimeSeriesPoint }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const nonReferred = payload.find((p) => p.name === "nonReferred");
  const referred = payload.find((p) => p.name === "referred");
  const total = (nonReferred?.value ?? 0) + (referred?.value ?? 0);

  return (
    <div
      className="rounded-xl border px-4 py-3 text-sm backdrop-blur-md"
      style={{
        background: "var(--leaders-tooltip-bg)",
        borderColor: "var(--leaders-tooltip-border)",
        color: "var(--fg-body)",
      }}
    >
      <p className="mb-1.5 font-semibold text-fg-heading">{label}</p>
      <p>
        Total: <span className="font-semibold text-fg-heading">{total}</span>
        <span style={{ color: "var(--fg-muted)" }}>{formatDelta(point?.totalDelta)}</span>
      </p>
      <p>
        Referred:{" "}
        <span className="font-semibold" style={{ color: "var(--leaders-area-referred)" }}>
          {referred?.value ?? 0}
        </span>
        <span style={{ color: "var(--fg-muted)" }}>{formatDelta(point?.referredDelta)}</span>
      </p>
      <p>
        Non-referred:{" "}
        <span className="font-semibold" style={{ color: "var(--leaders-area-non-referred)" }}>
          {nonReferred?.value ?? 0}
        </span>
        <span style={{ color: "var(--fg-muted)" }}>{formatDelta(point?.nonReferredDelta)}</span>
      </p>
      {point?.topReferrer && (
        <p className="mt-1.5 border-t pt-1.5" style={{ borderColor: "var(--leaders-tooltip-border)" }}>
          Top: <span className="font-semibold text-fg-heading">{point.topReferrer.name}</span>
          {" "}({point.topReferrer.count})
          {point.topReferrer.streak && " 🔥"}
        </p>
      )}
    </div>
  );
}

/* ── Chart ────────────────────────────────────────────────────────── */

export default function WaitlistChart({ data }: { data: TimeSeriesPoint[] }) {
  if (data.length === 0) {
    return <p className="py-20 text-center text-fg-muted">No data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="gradReferred" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--leaders-area-referred)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--leaders-area-referred)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="gradNonReferred" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--leaders-area-non-referred)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--leaders-area-non-referred)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "var(--fg-muted)", fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          tick={{ fill: "var(--fg-muted)", fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="referred"
          stackId="1"
          stroke="var(--leaders-area-referred)"
          fill="url(#gradReferred)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="nonReferred"
          stackId="1"
          stroke="var(--leaders-area-non-referred)"
          fill="url(#gradNonReferred)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
