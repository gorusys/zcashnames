"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FeedbackPanelBody from "./FeedbackPanelBody";

interface Props {
  /** Optional pre-loaded tester name. Otherwise the panel fetches on first open. */
  initialTesterName?: string | null;
  /** Active stage from StatusToggle — drives both checklist scoping and the report's stage column. */
  defaultNetwork: "testnet" | "mainnet";
  /** Open the panel once after mount, used when entering search mode. */
  openOnMount?: boolean;
}

const PANEL_WIDTH_PX = 440;
const PANEL_BREAKPOINT_PX = 900; // below this, panel goes full-width
type TooltipStep = "popout" | "report" | "checkbox" | "readme" | "contact" | "collapse";

function nextTooltipStep(step: TooltipStep | null): TooltipStep | null {
  switch (step) {
    case "popout":
      return "report";
    case "report":
      return "checkbox";
    case "checkbox":
      return "readme";
    case "readme":
      return "contact";
    case "contact":
      return "collapse";
    default:
      return null;
  }
}

export default function FeedbackModal({ initialTesterName, defaultNetwork, openOnMount = false }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const [tooltipStep, setTooltipStep] = useState<TooltipStep | null>(null);
  const [hasShownTooltipSequence, setHasShownTooltipSequence] = useState(false);
  const hasAppliedOpenOnMount = useRef(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia(`(min-width: ${PANEL_BREAKPOINT_PX}px)`);
    setIsWide(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsWide(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!mounted || !openOnMount || hasAppliedOpenOnMount.current) return;
    hasAppliedOpenOnMount.current = true;
    setOpen(true);
    if (!hasShownTooltipSequence) {
      setTooltipStep("popout");
      setHasShownTooltipSequence(true);
    }
  }, [mounted, openOnMount, hasShownTooltipSequence]);

  // ESC closes the panel.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const primaryBtnStyle: React.CSSProperties = {
    background: "var(--home-result-primary-bg)",
    color: "var(--home-result-primary-fg)",
    boxShadow: "var(--home-result-primary-shadow)",
  };

  function openPanel() {
    setOpen(true);
    if (!hasShownTooltipSequence) {
      setTooltipStep("popout");
      setHasShownTooltipSequence(true);
    }
  }

  return (
    <>
      {/* Floating launcher — hidden while the panel is open */}
      {!open && (
        <button
          type="button"
          onClick={openPanel}
          className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold cursor-pointer transition-transform hover:-translate-y-px"
          style={primaryBtnStyle}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Submit Feedback
        </button>
      )}

      {mounted &&
        createPortal(
          <aside
            aria-label="Beta feedback panel"
            aria-hidden={!open}
            className="fixed top-0 right-0 z-[9998]"
            style={{
              height: "100dvh",
              width: isWide ? `${PANEL_WIDTH_PX}px` : "100vw",
              borderLeft: "1px solid var(--faq-border)",
              boxShadow: "-12px 0 32px rgba(0,0,0,0.35)",
              transform: open ? "translateX(0)" : "translateX(100%)",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              willChange: "transform",
            }}
          >
            <FeedbackPanelBody
              mode="panel"
              stage={defaultNetwork}
              initialTesterName={initialTesterName}
              onClose={() => setOpen(false)}
              tooltipStep={tooltipStep}
              onTooltipNext={() => setTooltipStep((step) => nextTooltipStep(step))}
              onTooltipClose={() => setTooltipStep(null)}
              onTooltipRestart={() => setTooltipStep("popout")}
            />
          </aside>,
          document.body,
        )}
    </>
  );
}
