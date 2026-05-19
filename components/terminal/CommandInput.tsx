"use client";

import { useEffect, useRef, useState } from "react";
import { Cursor } from "./Cursor";
import { sound } from "@/lib/sound-manager";

interface CommandInputProps {
  prompt?: string;
  onSubmit: (raw: string) => void;
  // If provided, takes priority over Enter — useful for global listeners
  // that intercept commands at any time.
  active?: boolean;
  ariaLabel?: string;
}

// Free-text command line (used for easter eggs and the "between questions"
// command surface). For survey answers we use TextInput / SingleSelect / etc.
export function CommandInput({
  prompt = "$",
  onSubmit,
  active = true,
  ariaLabel = "command",
}: CommandInputProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active) ref.current?.focus();
  }, [active]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!active) return;
        sound.play("key-enter");
        onSubmit(value);
        setValue("");
      }}
      className="flex items-baseline gap-2"
    >
      <span className="text-phosphor-bright select-none">{prompt}</span>
      <div className="relative flex-1">
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
          aria-label={ariaLabel}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="absolute inset-0 w-full opacity-0"
        />
      </div>
    </form>
  );
}
