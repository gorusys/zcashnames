"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function CabalLaunchBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(window.localStorage.getItem("cabal-launch-banner-dismissed") !== "true");
  }, []);

  if (!pathname.startsWith("/cabal") || !visible) return null;

  return (
    <div className="influencer-launch-banner">
      <a
        href="https://x.com/ZcashNames/status/2043720836197290392?s=20"
        target="_blank"
        rel="noreferrer"
      >
        <span className="influencer-launch-badge">NEW</span>
        <span className="influencer-launch-copy">
          Watch our launch video <span>&rarr;</span>
        </span>
      </a>
      <button
        type="button"
        onClick={() => {
          window.localStorage.setItem("cabal-launch-banner-dismissed", "true");
          setVisible(false);
        }}
        aria-label="Dismiss launch video banner"
      >
        x
      </button>
    </div>
  );
}
