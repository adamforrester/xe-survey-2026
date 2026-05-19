"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sound-manager";
import type { Option } from "@/lib/survey-schema";

interface SingleSelectProps {
  options: Option[];
  ariaLabel: string;
  // If "other" is supported, the value `other` triggers a follow-up free-text.
  onSubmit: (value: string, otherText?: string) => void;
  initial?: string;
}

// Up/down to move, Enter to confirm, number keys 1-9 jump.
export function SingleSelect({ options, ariaLabel, onSubmit, initial }: SingleSelectProps) {
  const initialIdx = Math.max(
    0,
    options.findIndex((o) => o.value === initial)
  );
  const [idx, setIdx] = useState(initialIdx);
  const [otherText, setOtherText] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  useEffect(() => {
    const mountedAt = performance.now();
    function onKey(e: KeyboardEvent) {
      // Ignore Enter for the first 200ms — the Enter that mounted us
      // shouldn't be the Enter that submits an empty selection.
      if (e.key === "Enter" && performance.now() - mountedAt < 200) return;
      // Don't intercept when the "other" textbox is focused
      if (showOtherInput) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setIdx((i) => (i + 1) % options.length);
        sound.playKeystroke();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setIdx((i) => (i - 1 + options.length) % options.length);
        sound.playKeystroke();
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opt = options[idx];
        if (!opt) return;
        if (opt.value === "other") {
          sound.play("key-enter");
          setShowOtherInput(true);
          return;
        }
        sound.play("key-enter");
        onSubmit(opt.value);
      } else if (/^[1-9]$/.test(e.key)) {
        const n = Number(e.key) - 1;
        if (n < options.length) {
          setIdx(n);
          sound.playKeystroke();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, options, onSubmit, showOtherInput]);

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="space-y-1">
      {options.map((opt, i) => {
        const active = i === idx;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              setIdx(i);
              if (opt.value === "other") {
                setShowOtherInput(true);
                sound.play("key-enter");
              } else {
                sound.play("key-enter");
                onSubmit(opt.value);
              }
            }}
            onMouseEnter={() => setIdx(i)}
            className={`block w-full text-left px-2 py-0.5 ${
              active
                ? "bg-phosphor text-terminal-bg"
                : "text-phosphor hover:bg-phosphor-dimmer/50"
            }`}
          >
            <span className="select-none mr-2">{active ? "▸" : " "}</span>
            <span>
              {opt.label}
              {opt.description && (
                <span className={active ? "text-terminal-bg/80" : "text-phosphor-dim"}>
                  {" "}
                  — {opt.description}
                </span>
              )}
            </span>
          </button>
        );
      })}
      {showOtherInput && (
        <div className="pl-6 pt-2 flex gap-2 items-baseline">
          <span className="text-phosphor-bright">other:</span>
          <input
            type="text"
            autoFocus
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && otherText.trim()) {
                e.preventDefault();
                sound.play("key-enter");
                onSubmit("other", otherText.trim());
              }
              if (e.key === "Escape") setShowOtherInput(false);
            }}
            aria-label={`${ariaLabel} — other`}
            className="flex-1 border-b border-phosphor-dim text-phosphor"
          />
        </div>
      )}
      <div className="text-phosphor-dim text-xs pt-2">
        ↑/↓ to move · 1–{options.length} to jump · enter to select
      </div>
    </div>
  );
}
