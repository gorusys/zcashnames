"use client";

import { createContext, useContext, useRef, useState } from "react";
import { checkNetworkPassword } from "@/lib/zns/transaction";

type StatusState = "mainnet" | "testnet" | "waitlist";

interface StatusContextValue {
  status: StatusState;
  setStatus: (s: StatusState) => void;
  networkPassword: string;
  setNetworkPassword: (v: string) => void;
}

const StatusContext = createContext<StatusContextValue>({
  status: "waitlist",
  setStatus: () => {},
  networkPassword: "",
  setNetworkPassword: () => {},
});

export function useStatus() {
  return useContext(StatusContext);
}

function applyStatus(s: StatusState) {
  document.documentElement.setAttribute("data-status", s);
}

export function StatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatusState] = useState<StatusState>("waitlist");
  const [networkPassword, setNetworkPassword] = useState("");

  function setStatus(s: StatusState) {
    setStatusState(s);
    applyStatus(s);
  }

  return (
    <StatusContext.Provider
      value={{ status, setStatus, networkPassword, setNetworkPassword }}
    >
      {children}
    </StatusContext.Provider>
  );
}

const TABS: { key: StatusState; label: string }[] = [
  { key: "mainnet", label: "Mainnet" },
  { key: "testnet", label: "Testnet" },
  { key: "waitlist", label: "Waitlist" },
];

export default function StatusToggle() {
  const { status, setStatus, setNetworkPassword } = useStatus();

  const [showModal, setShowModal] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<"testnet" | "mainnet">("testnet");
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeIndex = Math.max(0, TABS.findIndex((tab) => tab.key === status));

  function handleTabClick(key: StatusState) {
    if (key === status) return;

    if (key === "waitlist") {
      setStatus("waitlist");
      return;
    }

    setPendingTarget(key);
    setInput("");
    setError(false);
    setShowModal(true);
  }

  async function handleSubmit() {
    if (checking) return;
    setChecking(true);
    try {
      const { ok } = await checkNetworkPassword(pendingTarget, input);
      if (ok) {
        setNetworkPassword(input);
        setStatus(pendingTarget);
        setShowModal(false);
        setInput("");
        setError(false);
      } else {
        setError(true);
        setInput("");
        inputRef.current?.focus();
      }
    } finally {
      setChecking(false);
    }
  }

  function handleCancel() {
    setShowModal(false);
    setInput("");
    setError(false);
  }

  return (
    <>
      <div
        className="relative flex items-center rounded-full h-8 text-sm font-bold tracking-tight leading-none"
        style={{ isolation: "isolate", background: "var(--color-raised)" }}
      >
        <span
          className="absolute inset-y-0 rounded-full pointer-events-none"
          style={{
            left: 0,
            width: `${100 / TABS.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
            transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "transform",
            background: "var(--color-raised)",
            boxShadow: "0 0 0 2px var(--fg-heading)",
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className="relative z-10 flex items-center h-full px-2.5 rounded-full whitespace-nowrap transition-opacity duration-200 cursor-pointer"
            style={{ opacity: status === tab.key ? 1 : 0.4 }}
            aria-pressed={status === tab.key}
            onClick={() => handleTabClick(tab.key)}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
        >
          <div
            className="rounded-2xl px-8 py-7 w-full max-w-sm flex flex-col gap-5"
            style={{
              background: "var(--feature-card-bg)",
              border: "1px solid var(--faq-border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
            }}
          >
            <div>
              <h2 className="type-card-title text-fg-heading m-0">
                {pendingTarget === "mainnet" ? "Mainnet Access" : "Testnet Access"}
              </h2>
              <p className="type-body mt-1.5" style={{ color: "var(--fg-muted)" }}>
                Enter the {pendingTarget} password to continue.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <input
                ref={inputRef}
                type="password"
                autoFocus
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(false); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                  if (e.key === "Escape") handleCancel();
                }}
                placeholder="Password"
                className="w-full rounded-xl px-4 py-3 type-body outline-none"
                style={{
                  background: "var(--color-raised)",
                  border: error
                    ? "1.5px solid var(--accent-red, #e05252)"
                    : "1.5px solid var(--faq-border)",
                  color: "var(--fg-heading)",
                }}
              />
              {error && (
                <p className="type-chip" style={{ color: "var(--accent-red, #e05252)" }}>
                  Incorrect password.
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-full type-body font-bold transition-opacity duration-200 hover:opacity-60 cursor-pointer"
                style={{ color: "var(--fg-muted)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-full type-body font-bold cursor-pointer transition-opacity duration-200 hover:opacity-80"
                style={{
                  background: "var(--sf-search-btn-bg)",
                  color: "var(--sf-claim-text)",
                  boxShadow: "var(--sf-search-btn-shadow)",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
