"use client";

import { useEffect, useRef } from "react";

interface TerminalProps {
  children: React.ReactNode;
}

// Scrolling history container. Autoscrolls to bottom whenever its
// content size changes (using ResizeObserver — works for both new lines
// and within-component growth like typewriter text).
export function Terminal({ children }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = innerRef.current;
    const scroller = scrollRef.current;
    if (!node || !scroller) return;
    const ro = new ResizeObserver(() => {
      scroller.scrollTop = scroller.scrollHeight;
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={scrollRef}
      className="terminal-scroll flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6"
    >
      <div
        ref={innerRef}
        className="max-w-3xl mx-auto text-[13px] sm:text-[15px] leading-relaxed phosphor-glow space-y-3"
      >
        {children}
      </div>
    </div>
  );
}
