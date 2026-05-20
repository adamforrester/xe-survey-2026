"use client";

import { useEffect, useRef, useState } from "react";
import { Cursor } from "../terminal/Cursor";
import { sound } from "@/lib/sound-manager";

interface TextInputProps {
  prompt?: string;
  placeholder?: string;
  ariaLabel: string;
  multiline?: boolean;
  optional?: boolean;
  initial?: string;
  onSubmit: (value: string) => void;
}

// Survey free-text input. Submits on Enter (Shift+Enter for newline in multiline).
export function TextInput({
  prompt = ">",
  placeholder,
  ariaLabel,
  multiline = false,
  optional = false,
  initial = "",
  onSubmit,
}: TextInputProps) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const submitted = useRef(false);
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = performance.now();
    // Slight delay so autofocus doesn't grab the same Enter that mounted us.
    const t = setTimeout(() => ref.current?.focus(), 180);
    return () => clearTimeout(t);
  }, []);

  function commit() {
    if (submitted.current) return;
    submitted.current = true;
    sound.play("key-enter");
    onSubmit(value.trim());
  }

  function tapSubmit() {
    if (submitted.current) return;
    if (performance.now() - mountedAt.current < 220) return;
    if (!optional && !value.trim()) {
      sound.play("beep-error");
      return;
    }
    commit();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (performance.now() - mountedAt.current < 200) {
        e.preventDefault();
        return;
      }
      if (multiline && e.shiftKey) return;
      e.preventDefault();
      if (!optional && !value.trim()) {
        sound.play("beep-error");
        return;
      }
      commit();
    }
  }

  return (
    <div className="flex items-start gap-2">
      <span className="text-phosphor-bright select-none pt-[1px]">{prompt}</span>
      <div className="relative flex-1 min-w-0">
        <div
          aria-hidden="true"
          className="whitespace-pre-wrap break-words min-h-[1.4em]"
        >
          {value || (
            <span className="text-phosphor-dim/70 italic">{placeholder ?? ""}</span>
          )}
        </div>
        <Cursor />
        {multiline ? (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (e.target.value.length > value.length) sound.playKeystroke();
            }}
            onKeyDown={onKeyDown}
            aria-label={ariaLabel}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            rows={1}
            className="absolute inset-0 w-full h-full opacity-0 resize-none"
          />
        ) : (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (e.target.value.length > value.length) sound.playKeystroke();
            }}
            onKeyDown={onKeyDown}
            aria-label={ariaLabel}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="absolute inset-0 w-full opacity-0"
          />
        )}
      </div>
      {optional && (
        <span className="text-phosphor-dim text-xs whitespace-nowrap pt-[3px]">
          [optional · enter to skip]
        </span>
      )}
      <button
        type="button"
        onClick={tapSubmit}
        className="text-phosphor-bright text-sm border border-phosphor/40 hover:bg-phosphor/10 px-2 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-phosphor whitespace-nowrap"
        aria-label="submit"
      >
        ▸
      </button>
    </div>
  );
}
