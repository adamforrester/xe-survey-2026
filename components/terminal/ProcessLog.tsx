"use client";

import { useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sound-manager";

interface ProcessLogProps {
  lines: string[];
  perLineMs?: number;
  okSuffix?: boolean;
  onDone?: () => void;
}

// Sequential "doing thing... ok" log lines for transitions.
// onDone is captured via ref so re-renders don't restart the effect.
export function ProcessLog({
  lines,
  perLineMs = 110,
  okSuffix = true,
  onDone,
}: ProcessLogProps) {
  const [shown, setShown] = useState<string[]>([]);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  // Snapshot inputs once on mount so React Strict Mode's double-effect doesn't
  // care about reference equality.
  const linesRef = useRef(lines);
  const perLineRef = useRef(perLineMs);
  const suffixRef = useRef(okSuffix);

  useEffect(() => {
    const totalLines = linesRef.current.slice();
    const ms = perLineRef.current;
    const suffix = suffixRef.current;
    let i = 0;
    setShown([]);
    const id = setInterval(() => {
      const line = totalLines[i];
      if (line === undefined) {
        clearInterval(id);
        onDoneRef.current?.();
        return;
      }
      const text = suffix ? `${line}... ok` : line;
      setShown((s) => [...s, text]);
      sound.playKeystroke();
      i += 1;
      if (i >= totalLines.length) {
        clearInterval(id);
        setTimeout(() => onDoneRef.current?.(), ms);
      }
    }, ms);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-0.5">
      {shown.map((line, i) => {
        const okIdx = line.lastIndexOf("... ok");
        if (okIdx > -1) {
          return (
            <div key={i} className="text-phosphor-dim">
              {line.slice(0, okIdx)}
              <span className="text-phosphor-dim">... </span>
              <span className="text-phosphor-ok">ok</span>
            </div>
          );
        }
        return (
          <div key={i} className="text-phosphor-dim">
            {line}
          </div>
        );
      })}
    </div>
  );
}
