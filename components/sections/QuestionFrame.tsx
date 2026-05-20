"use client";

import { useEffect, useState } from "react";
import { TypewriterText } from "../terminal/TypewriterText";

interface QuestionFrameProps {
  number: string; // "Q1", "Q2", ...
  prompt: string;
  hint?: string;
  children?: React.ReactNode;
  // When true, render the children only after the typewriter prompt finishes.
  awaitInput?: boolean;
}

// Renders a question prompt typewriter-style, then reveals its input.
// Past answers are immutable and rendered above by the parent.
export function QuestionFrame({
  number,
  prompt,
  hint,
  children,
  awaitInput = true,
}: QuestionFrameProps) {
  const [ready, setReady] = useState(!awaitInput);

  // Reset on prompt change so re-rendering re-types the next question.
  useEffect(() => {
    if (awaitInput) setReady(false);
  }, [prompt, awaitInput]);

  return (
    <div className="space-y-3 mt-6">
      <div className="flex flex-wrap gap-x-2">
        <span className="text-phosphor-dim">[{number}]</span>
        <span className="flex-1 min-w-0 text-phosphor-bright">
          <TypewriterText
            text={prompt}
            speed={22}
            jitter={8}
            onDone={() => setReady(true)}
          />
        </span>
      </div>
      {hint && ready && (
        <div className="text-phosphor-dim text-xs pl-9">{hint}</div>
      )}
      {ready && <div className="pt-2">{children}</div>}
    </div>
  );
}
