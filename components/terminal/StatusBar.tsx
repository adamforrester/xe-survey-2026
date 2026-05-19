"use client";

import { useEffect, useState } from "react";

interface StatusBarProps {
  crtOn: boolean;
  soundOn: boolean;
  onToggleCrt: () => void;
  onToggleSound: () => void;
  onFallback: () => void;
  onHelp: () => void;
}

function formatUptime(secs: number) {
  const h = Math.floor(secs / 3600).toString().padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function StatusBar({
  crtOn,
  soundOn,
  onToggleCrt,
  onToggleSound,
  onFallback,
  onHelp,
}: StatusBarProps) {
  const [uptime, setUptime] = useState(0);
  const [memory, setMemory] = useState(47);
  const [uplink, setUplink] = useState<"stable" | "drifting" | "syncing">("stable");

  useEffect(() => {
    const id = setInterval(() => {
      setUptime((u) => u + 1);
      setMemory((m) => {
        const drift = (Math.random() - 0.5) * 1.4;
        return Math.max(35, Math.min(72, m + drift));
      });
      if (Math.random() < 0.04) {
        setUplink((u) => (u === "stable" ? "drifting" : "stable"));
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="border-t border-terminal-border px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs text-phosphor-dim flex flex-wrap gap-x-3 gap-y-1 items-center">
      <span>uptime: {formatUptime(uptime)}</span>
      <span className="hidden sm:inline">memory: {memory.toFixed(0)}% / 64MB</span>
      <span>
        uplink:{" "}
        <span className={uplink === "stable" ? "text-phosphor-ok" : "text-phosphor"}>
          {uplink}
        </span>
      </span>
      <span className="ml-auto flex flex-wrap gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={onHelp}
          className="hover:text-phosphor focus-visible:text-phosphor"
          aria-label="Keyboard reference"
        >
          [?]
        </button>
        <button
          type="button"
          onClick={onToggleCrt}
          className="hover:text-phosphor focus-visible:text-phosphor"
          aria-pressed={crtOn}
        >
          [screen {crtOn ? "off" : "on"}]
        </button>
        <button
          type="button"
          onClick={onToggleSound}
          className="hover:text-phosphor focus-visible:text-phosphor"
          aria-pressed={soundOn}
        >
          [sound {soundOn ? "off" : "on"}]
        </button>
        <button
          type="button"
          onClick={onFallback}
          className="hover:text-phosphor focus-visible:text-phosphor"
        >
          [esc: standard form]
        </button>
      </span>
    </footer>
  );
}
