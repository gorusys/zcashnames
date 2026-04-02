"use client";

import { useRef, useState } from "react";
import { useStatus } from "@/components/StatusToggle";
import ExplorerSearch, { type ExplorerSearchHandle } from "./ExplorerSearch";
import ExplorerActivity from "./ExplorerActivity";
import ExplorerStatsBar from "./ExplorerStatsBar";

export default function ExplorerShell() {
  const { network } = useStatus();
  const searchRef = useRef<ExplorerSearchHandle>(null);
  const [searchActive, setSearchActive] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-fg-heading sm:text-3xl">Name Explorer</h1>
      <ExplorerSearch ref={searchRef} network={network} onActiveChange={setSearchActive} />
      {!searchActive && <ExplorerActivity network={network} onNameClick={(name) => searchRef.current?.searchFor(name)} />}
      <ExplorerStatsBar />
    </div>
  );
}
