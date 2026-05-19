"use client";

import { useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sound-manager";

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character, baseline
  jitter?: number; // ± ms jitter
  startDelay?: number;
  withSound?: boolean;
  onDone?: () => void;
  className?: string;
  // If true, allow user to skip typing by pressing any key.
  skippable?: boolean;
}

// Typewriter that respects prefers-reduced-motion (renders instantly) and
// supports a skip-on-keypress shortcut.
export function TypewriterText({
  text,
  speed = 28,
  jitter = 16,
  startDelay = 0,
  withSound = true,
  onDone,
  className,
  skippable = true,
}: TypewriterTextProps) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const cancelledRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    cancelledRef.current = false;
    indexRef.current = 0;
    setShown("");
    setDone(false);

    if (typeof window !== "undefined") {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        setShown(text);
        setDone(true);
        onDoneRef.current?.();
        return;
      }
    }
    // Run once per text change. Intentionally exclude callbacks/refs from deps.

    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastSoundAt = 0;

    function step() {
      if (cancelledRef.current) return;
      const i = indexRef.current;
      if (i >= text.length) {
        setDone(true);
        onDoneRef.current?.();
        return;
      }
      indexRef.current = i + 1;
      setShown(text.slice(0, i + 1));
      const ch = text[i];

      if (withSound && ch && ch !== " " && ch !== "\n") {
        const now = performance.now();
        if (now - lastSoundAt > 28) {
          sound.playKeystroke();
          lastSoundAt = now;
        }
      }

      const j = jitter > 0 ? (Math.random() - 0.5) * 2 * jitter : 0;
      // Pause longer on punctuation
      const punctPause = /[.,!?:]/.test(ch ?? "") ? 80 : 0;
      const next = Math.max(8, speed + j + punctPause);
      timer = setTimeout(step, next);
    }

    timer = setTimeout(step, startDelay);

    return () => {
      cancelledRef.current = true;
      if (timer) clearTimeout(timer);
    };
  }, [text, speed, jitter, startDelay, withSound]);

  useEffect(() => {
    if (!skippable || done) return;
    function onKey(e: KeyboardEvent) {
      // Skip on Enter or Escape; don't intercept other keys
      if (e.key === "Enter" || e.key === "Escape") {
        cancelledRef.current = true;
        setShown(text);
        setDone(true);
        onDoneRef.current?.();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [text, done, skippable]);

  return <span className={className}>{shown}</span>;
}
