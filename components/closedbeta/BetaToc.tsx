"use client";

import { useEffect, useState } from "react";

interface Section {
  id: string;
  label: string;
}

interface Props {
  sections: Section[];
}

export default function BetaToc({ sections }: Props) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [collapsed, setCollapsed] = useState(false);

  // Scroll-spy: highlight the section closest to the top of the viewport.
  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting entry.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -65% 0px",
        threshold: 0,
      },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [sections]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  }

  return (
    <nav
      aria-label="On this page"
      className="text-sm"
      style={{ color: "var(--fg-body)" }}
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 w-full text-left mb-3 cursor-pointer transition-opacity hover:opacity-80"
        style={{ color: "var(--fg-muted)" }}
        aria-expanded={!collapsed}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 transition-transform"
          style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider">On this page</span>
      </button>

      {!collapsed && (
        <ul className="flex flex-col gap-1 border-l" style={{ borderColor: "var(--faq-border)" }}>
          {sections.map((s) => {
            const active = s.id === activeId;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => handleClick(e, s.id)}
                  className="block py-1.5 pl-3 pr-2 text-sm transition-colors"
                  style={{
                    color: active ? "var(--fg-heading)" : "var(--fg-muted)",
                    fontWeight: active ? 600 : 400,
                    borderLeft: active ? "2px solid var(--fg-heading)" : "2px solid transparent",
                    marginLeft: "-1px",
                  }}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
