"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sound-manager";
import type { Option } from "@/lib/survey-schema";

interface MultiSelectProps {
  options: Option[];
  ariaLabel: string;
  max?: number;
  onSubmit: (values: string[], otherText?: string) => void;
  initial?: string[];
}

export function MultiSelect({
  options,
  ariaLabel,
  max,
  onSubmit,
  initial = [],
}: MultiSelectProps) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [otherText, setOtherText] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [errorFlash, setErrorFlash] = useState(false);

  function toggle(value: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(value)) {
        next.delete(value);
      } else {
        if (max !== undefined && next.size >= max) {
          sound.play("beep-error");
          setErrorFlash(true);
          setTimeout(() => setErrorFlash(false), 600);
          return s;
        }
        next.add(value);
        sound.playKeystroke();
      }
      return next;
    });
  }

  useEffect(() => {
    const mountedAt = performance.now();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && performance.now() - mountedAt < 200) return;
      if (showOtherInput) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setIdx((i) => (i + 1) % options.length);
        sound.playKeystroke();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setIdx((i) => (i - 1 + options.length) % options.length);
        sound.playKeystroke();
      } else if (e.key === " " || e.key === "x") {
        e.preventDefault();
        const opt = options[idx];
        if (!opt) return;
        if (opt.value === "other" && !selected.has("other")) {
          setShowOtherInput(true);
          return;
        }
        toggle(opt.value);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selected.size === 0) {
          sound.play("beep-error");
          setErrorFlash(true);
          setTimeout(() => setErrorFlash(false), 600);
          return;
        }
        sound.play("key-enter");
        onSubmit(Array.from(selected), otherText || undefined);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, selected, options, onSubmit, showOtherInput, otherText, max]);

  return (
    <div role="group" aria-label={ariaLabel} className="space-y-1">
      {max !== undefined && (
        <div
          className={`text-xs mb-1 ${
            errorFlash ? "text-phosphor-error" : "text-phosphor-dim"
          }`}
        >
          {errorFlash
            ? `> error: limit_exceeded — max ${max} vectors selectable`
            : `select up to ${max} (${selected.size}/${max})`}
        </div>
      )}
      {options.map((opt, i) => {
        const active = i === idx;
        const checked = selected.has(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={() => {
              setIdx(i);
              if (opt.value === "other" && !selected.has("other")) {
                setShowOtherInput(true);
              } else {
                toggle(opt.value);
              }
            }}
            onMouseEnter={() => setIdx(i)}
            className={`block w-full text-left px-2 py-0.5 ${
              active
                ? "bg-phosphor text-terminal-bg"
                : "text-phosphor hover:bg-phosphor-dimmer/50"
            }`}
          >
            <span className="select-none mr-2">
              {active ? "▸" : " "}
              {checked ? "[x]" : "[ ]"}
            </span>
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
                setShowOtherInput(false);
                if (max === undefined || selected.size < max) {
                  setSelected((s) => new Set(s).add("other"));
                }
              }
              if (e.key === "Escape") setShowOtherInput(false);
            }}
            aria-label={`${ariaLabel} — other`}
            className="flex-1 border-b border-phosphor-dim text-phosphor"
          />
        </div>
      )}
      <div className="text-phosphor-dim text-xs pt-2">
        ↑/↓ to move · space to toggle · enter to confirm
      </div>
      <button
        type="button"
        onClick={() => {
          if (selected.size === 0) {
            sound.play("beep-error");
            setErrorFlash(true);
            setTimeout(() => setErrorFlash(false), 600);
            return;
          }
          sound.play("key-enter");
          onSubmit(Array.from(selected), otherText || undefined);
        }}
        className="mt-2 inline-flex items-center gap-2 border border-phosphor/40 bg-transparent px-3 py-1 text-phosphor-bright hover:bg-phosphor/10 focus:outline-none focus:ring-1 focus:ring-phosphor cursor-pointer text-sm"
        aria-label="confirm selection"
      >
        confirm ▸
      </button>
    </div>
  );
}
