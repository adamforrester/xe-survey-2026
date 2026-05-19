"use client";

import { useEffect } from "react";

interface CheatSheetProps {
  open: boolean;
  onClose: () => void;
}

const ENTRIES: { cmd: string; desc: string }[] = [
  { cmd: "?", desc: "open this cheatsheet" },
  { cmd: "esc", desc: "switch to standard form" },
  { cmd: "↑/↓ ←/→", desc: "navigate / set rating" },
  { cmd: "space", desc: "toggle (multi-select)" },
  { cmd: "enter", desc: "submit / advance" },
  { cmd: "1–9", desc: "jump to option N" },
  { cmd: "shift+enter", desc: "new line in multiline text" },
  { cmd: "screen on/off", desc: "toggle CRT effect (status bar)" },
  { cmd: "sound on/off", desc: "toggle audio (status bar)" },
];

export function CheatSheet({ open, onClose }: CheatSheetProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "?" || e.key === "Enter") {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      }
    }
    // Capture phase so we beat other listeners
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard reference"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-terminal-bg/85 p-4"
      onClick={onClose}
    >
      <div
        className="border border-phosphor-dim bg-terminal-bg p-5 max-w-md w-full font-mono text-phosphor"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-phosphor-bright mb-3">// keyboard reference</div>
        <div className="space-y-1.5 text-sm">
          {ENTRIES.map((e) => (
            <div key={e.cmd} className="flex gap-3">
              <span className="text-phosphor-bright min-w-[6.5rem]">{e.cmd}</span>
              <span className="text-phosphor-dim">{e.desc}</span>
            </div>
          ))}
        </div>
        <div className="text-phosphor-dim text-xs mt-4">
          press ? or esc to dismiss
        </div>
      </div>
    </div>
  );
}
