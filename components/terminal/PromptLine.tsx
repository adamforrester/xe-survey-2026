"use client";

import { TypewriterText } from "./TypewriterText";

interface PromptLineProps {
  command: string;
  flag?: string;
  animate?: boolean;
  onDone?: () => void;
}

// Renders a "> command --flag" prompt header, optionally typewriter-animated.
export function PromptLine({ command, flag, animate = true, onDone }: PromptLineProps) {
  const text = flag ? `> ${command} --${flag}` : `> ${command}`;
  if (!animate) {
    return <div className="phosphor-glow text-phosphor-bright">{text}</div>;
  }
  return (
    <div className="phosphor-glow text-phosphor-bright">
      <TypewriterText text={text} speed={22} jitter={10} onDone={onDone} />
    </div>
  );
}
