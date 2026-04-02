"use client";

import { useEffect, useState } from "react";
import { getEvents } from "@/lib/zns/resolve";
import { useStatus } from "@/components/StatusToggle";
import type { Network } from "@/lib/zns/name";
import type { ZnsEvent } from "@/lib/zns/client";
import ActionBadge from "@/components/ActionBadge";

export default function ExplorerActivity({
  network,
  onNameClick,
}: {
  network: Network;
  onNameClick: (name: string) => void;
}) {
  const { data } = useStatus();
  const [tab, setTab] = useState<"activity" | "forsale">("activity");
  const [events, setEvents] = useState<ZnsEvent[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsOffset, setEventsOffset] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setEventsLoading(true);
    setEventsOffset(0);
    getEvents({ limit: 20 }, network).then((r) => {
      if (cancelled) return;
      setEvents(r.events);
      setEventsTotal(r.total);
      setEventsLoading(false);
    });
    return () => { cancelled = true; };
  }, [network]);

  async function loadMoreEvents() {
    const newOffset = eventsOffset + 20;
    const r = await getEvents({ limit: 20, offset: newOffset }, network);
    setEvents((prev) => [...prev, ...r.events]);
    setEventsOffset(newOffset);
  }

  return (
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
                    onClick={() => onNameClick(ev.name)}
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

      {tab === "forsale" && (
        <p className="text-sm text-fg-muted">
          {data?.mode === "search" && data.stats.forSale > 0
            ? `${data.stats.forSale} name${data.stats.forSale === 1 ? "" : "s"} listed.`
            : "No names listed for sale."}
        </p>
      )}
    </>
  );
}
