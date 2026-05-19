"use client";

import { useEffect, useRef, useState } from "react";
import { Cursor } from "../terminal/Cursor";
import { sound } from "@/lib/sound-manager";
import { runCommand, isCommandLike } from "@/lib/easter-eggs";

interface InterSectionProps {
  message: string;
  onContinue: () => void;
  onClear: () => void;
  onSetCrt: (on: boolean) => void;
  onSetSound: (on: boolean) => void;
}

// A between-sections command moment. User can type any easter egg command,
// or just press Enter to continue. This is the *only* place commands are
// accepted, so they don't fight survey navigation keys.
export function InterSection({
  message,
  onContinue,
  onClear,
  onSetCrt,
  onSetSound,
}: InterSectionProps) {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<{ id: number; prompt: string; lines: string[] }[]>(
    []
  );
  const ref = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = performance.now();
    const t = setTimeout(() => ref.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (performance.now() - mountedAt.current < 220) return;
    const raw = value.trim();
    setValue("");
    sound.play("key-enter");
    if (!raw) {
      onContinue();
      return;
    }
    if (isCommandLike(raw)) {
      const result = runCommand(raw);
      if (result.matched) {
        const id = idRef.current++;
        setHistory((h) => [...h, { id, prompt: raw, lines: result.lines }]);
        switch (result.effect.type) {
          case "clear":
            onClear();
            return;
          case "screen":
            onSetCrt(result.effect.on);
            return;
          case "sound":
            onSetSound(result.effect.on);
            return;
          default:
            return;
        }
      }
    }
    const id = idRef.current++;
    setHistory((h) => [
      ...h,
      { id, prompt: raw, lines: [`command not found: ${raw}`, "type ? for help"] },
    ]);
  }

  return (
    <div className="space-y-2 mt-4">
      <div className="text-phosphor">{message}</div>
      <div className="text-phosphor-dim text-xs">
        press enter to continue · type a command (try: help, whoami, ls /xe)
      </div>
      {history.map((h) => (
        <div key={h.id}>
          <div className="text-phosphor-bright">$ {h.prompt}</div>
          {h.lines.map((l, i) => (
            <div key={i} className="text-phosphor pl-2">
              {l}
            </div>
          ))}
        </div>
      ))}
      <form onSubmit={onSubmit} className="flex items-baseline gap-2">
        <span className="text-phosphor-bright select-none">$</span>
        <div className="relative flex-1 min-w-0">
          <span aria-hidden="true" className="whitespace-pre">
            {value}
          </span>
          <Cursor />
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (e.target.value.length > value.length) sound.playKeystroke();
            }}
            aria-label="command (or enter to continue)"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="absolute inset-0 w-full opacity-0"
          />
        </div>
      </form>
    </div>
  );
}
