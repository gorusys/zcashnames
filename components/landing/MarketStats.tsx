"use client";

import { useEffect, useState } from "react";
import { getHomeStats } from "@/lib/zns/resolve";
import { getWaitlistStats } from "@/lib/waitlist/waitlist";
import { useStatus } from "@/components/StatusToggle";

type HomeStats = {
  claimed: number;
  forSale: number;
  verifiedOnZcashMe: number;
};
type WaitlistStats = {
  waitlist: number;
  referred: number;
  rewardsPot: number;
};
type StatKey = "claimed" | "forSale" | "authenticated" | "waitlist" | "referred" | "rewardsPot";

const DEFAULT_HOME_STATS: HomeStats = { claimed: 0, forSale: 0, verifiedOnZcashMe: 0 };
const DEFAULT_WAITLIST_STATS: WaitlistStats = { waitlist: 0, referred: 0, rewardsPot: 0 };

export default function MarketStats({ refreshKey = 0 }: { refreshKey?: number }) {
  const { status } = useStatus();
  const [homeStats, setHomeStats] = useState<HomeStats>(DEFAULT_HOME_STATS);
  const [waitlistStats, setWaitlistStats] = useState<WaitlistStats>(DEFAULT_WAITLIST_STATS);
  const [activeKey, setActiveKey] = useState<StatKey | null>(null);
  const [hoverKey, setHoverKey] = useState<StatKey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const isSearchMode = status === "testnet" || status === "mainnet";

    (async () => {
      try {
        if (!isSearchMode) {
          const next = await getWaitlistStats();
          if (!cancelled) {
            setWaitlistStats(next);
            setLoading(false);
          }
        } else {
          const network = status === "mainnet" ? "mainnet" : "testnet";
          const next = await getHomeStats(network);
          if (!cancelled) {
            setHomeStats(next);
            setLoading(false);
          }
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    const interval = setInterval(async () => {
      try {
        if (!isSearchMode) {
          const next = await getWaitlistStats();
          if (!cancelled) setWaitlistStats(next);
        } else {
          const network = status === "mainnet" ? "mainnet" : "testnet";
          const next = await getHomeStats(network);
          if (!cancelled) setHomeStats(next);
        }
      } catch {
        // ignore polling errors
      }
    }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [status, refreshKey]);

  const isSearchMode = status === "testnet" || status === "mainnet";

  const items =
    !isSearchMode
      ? [
          {
            key: "waitlist" as const,
            label: "Waitlist",
            value: waitlistStats.waitlist.toLocaleString(),
            helpText: "Total number of people on the ZcashNames waitlist.",
          },
          {
            key: "referred" as const,
            label: "Referred",
            value: waitlistStats.referred.toLocaleString(),
            helpText: "Number of waitlist members who were referred by someone.",
          },
          {
            key: "rewardsPot" as const,
            label: "Rewards",
            value: (
              <>
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-0.5 inline-block align-baseline"
                  style={{ width: "0.6em", height: "0.6em", verticalAlign: "baseline", marginBottom: "0.05em" }}
                >
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                  <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 6H14L6 14H14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                {" "}{waitlistStats.rewardsPot}
              </>
            ),
            helpText: "Get 0.05 ZEC for every name sold using your waitlist referral link.",
          },
        ]
      : [
          {
            key: "claimed" as const,
            label: "Claimed",
            value: homeStats.claimed.toLocaleString(),
            helpText:
              "Claimed means this .zcash name is already registered to an owner on-chain.",
          },
          {
            key: "forSale" as const,
            label: "For Sale",
            value: homeStats.forSale.toLocaleString(),
            helpText:
              "For Sale means the current owner has listed the name and can accept a purchase.",
          },
          {
            key: "authenticated" as const,
            label: "Authenticated",
            value: homeStats.verifiedOnZcashMe.toLocaleString(),
            helpText:
              "Authenticated means ownership has been confirmed with a linked zcashme identity.",
          },
        ];

  const activeItem = items.find((item) => item.key === activeKey);
  const isHelpVisible = Boolean(activeItem);

  return (
    <section className="relative z-[2] w-full px-4 pb-10 sm:px-6 sm:pb-12 max-[700px]:pb-8">
      <div
        className="mx-auto w-full max-w-2xl rounded-[24px] p-3 backdrop-blur-md sm:max-w-3xl sm:p-4 xl:max-w-4xl"
        style={{
          background: "transparent",
          border: "none",
          boxShadow: "none",
        }}
      >
        <div className="grid grid-cols-3">
          {items.map((item, index) => {
            const isHighlighted = hoverKey === item.key || activeKey === item.key;

            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={activeKey === item.key}
                aria-controls="market-stats-help"
                onClick={() => {
                  setActiveKey((curr) => (curr === item.key ? null : item.key));
                }}
                onMouseEnter={() => setHoverKey(item.key)}
                onMouseLeave={() => {
                  setHoverKey((curr) => (curr === item.key ? null : curr));
                }}
                onFocus={() => setHoverKey(item.key)}
                onBlur={() => {
                  setHoverKey((curr) => (curr === item.key ? null : curr));
                }}
                className={`cursor-pointer px-3 py-2 text-center transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--partner-card-border-hover)] sm:px-5 sm:py-3 ${
                  index > 0 ? "border-l" : ""
                }`}
                style={{
                  borderColor: "var(--partner-card-border)",
                }}
              >
                <div
                  className="mx-1 rounded-[0.8rem] px-2 py-2 transition-colors duration-200 ease-out sm:px-3 sm:py-2.5"
                  style={{
                    background: isHighlighted
                      ? "var(--market-stats-segment-active-bg)"
                      : "transparent",
                  }}
                >
                  <div className="tabular-nums text-[clamp(1.25rem,2.5vw,1.85rem)] font-semibold leading-none tracking-[-0.015em] text-fg-heading">
                    {loading ? (
                      <span className="inline-block h-[0.85em] w-12 animate-pulse rounded-md bg-fg-dim/20 align-middle" />
                    ) : (
                      item.value
                    )}
                  </div>
                  <div className="mt-1 text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-fg-dim sm:mt-1.5 sm:text-[0.78rem]">
                    {item.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div
          id="market-stats-help"
          aria-live="polite"
          className={`overflow-hidden transition-all duration-300 ease-out ${
            isHelpVisible
              ? "mt-3 max-h-32 translate-y-0 opacity-100"
              : "max-h-0 -translate-y-1 opacity-0 pointer-events-none"
          }`}
        >
          <p
            className="rounded-xl border px-4 py-2 text-[0.78rem] font-medium leading-relaxed sm:text-sm"
            style={{
              background: "var(--market-stats-help-bg)",
              borderColor: "var(--market-stats-help-border)",
              color: "var(--market-stats-help-text)",
            }}
          >
            {activeItem?.helpText}
          </p>
        </div>
      </div>
    </section>
  );
}
