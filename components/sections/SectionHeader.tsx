"use client";

import { useEffect, useRef, useState } from "react";
import { PromptLine } from "../terminal/PromptLine";
import { ProcessLog } from "../terminal/ProcessLog";

interface SectionHeaderProps {
  command: string;
  flag: string;
  title: string;
  loadingLines?: string[];
  onReady: () => void;
}

// Plays a transition: "> command --flag" then a short process log → ready.
export function SectionHeader({
  command,
  flag,
  title,
  loadingLines = [],
  onReady,
}: SectionHeaderProps) {
  const [phase, setPhase] = useState<"prompt" | "log" | "title" | "ready">(
    "prompt"
  );
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  // For the no-log case, just schedule a brief delay after the prompt finishes.
  useEffect(() => {
    if (phase !== "log" || loadingLines.length > 0) return;
    const t = setTimeout(() => {
      setPhase("ready");
      onReadyRef.current?.();
    }, 280);
    return () => clearTimeout(t);
  }, [phase, loadingLines.length]);

  return (
    <div className="space-y-2 border-l-2 border-phosphor-ok pl-4 py-2 mt-8">
      <PromptLine
        command={command}
        flag={flag}
        animate
        onDone={() => setPhase("log")}
      />
      {(phase === "log" || phase === "title" || phase === "ready") &&
        loadingLines.length > 0 && (
          <ProcessLog
            lines={loadingLines}
            perLineMs={120}
            onDone={() => {
              setPhase("title");
              setTimeout(() => {
                setPhase("ready");
                onReadyRef.current?.();
              }, 250);
            }}
          />
        )}
      {(phase === "title" || phase === "ready") && (
        <div className="text-phosphor-bright pt-2 text-base sm:text-lg">// {title}</div>
      )}
    </div>
  );
}
