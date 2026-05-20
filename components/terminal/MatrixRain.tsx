"use client";

import { useEffect, useRef, useState } from "react";

// Phosphor "matrix rain" closing animation. Renders to a <pre> on rAF, runs
// for ~RUN_MS, then fades to a single resolved line via onDone.
//
// Pure DOM — no canvas, so it inherits the terminal's phosphor glow + CRT
// overlay automatically. Glyphs are drawn from XE/network vocabulary so it
// feels like the team's signature, not generic katakana.

const GLYPHS = "XEVML01·.//\\|<>{}[]_=*+#@";
const RUN_MS = 4200;

interface MatrixRainProps {
  onDone?: () => void;
}

export function MatrixRain({ onDone }: MatrixRainProps) {
  const ref = useRef<HTMLPreElement>(null);
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Prefer reduced motion: skip the rain, jump to resolved state.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDone(true);
      onDoneRef.current?.();
      return;
    }

    // Sample monospace cell size off a live element so the grid maps to viewport.
    const probe = document.createElement("span");
    probe.style.cssText =
      "position:absolute;visibility:hidden;font-family:inherit;font-size:inherit;line-height:inherit;white-space:pre";
    probe.textContent = "M";
    node.appendChild(probe);
    const cellW = probe.getBoundingClientRect().width || 8;
    const cellH = probe.getBoundingClientRect().height || 16;
    node.removeChild(probe);

    const cols = Math.max(20, Math.floor(node.clientWidth / cellW));
    const rows = Math.max(10, Math.min(28, Math.floor(280 / cellH)));

    // One falling stream per column. Each has its own y position, speed, length.
    type Stream = { y: number; speed: number; length: number; nextSwap: number };
    const streams: Stream[] = Array.from({ length: cols }, () => ({
      y: -Math.floor(Math.random() * rows * 2),
      speed: 0.4 + Math.random() * 1.1,
      length: 4 + Math.floor(Math.random() * 8),
      nextSwap: Math.floor(Math.random() * 6),
    }));

    // Pre-fill a glyph buffer; cells get rerolled occasionally for shimmer.
    const glyphs: string[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () =>
        GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      )
    );

    let raf = 0;
    let cancelled = false;
    const start = performance.now();

    function tick(now: number) {
      if (cancelled) return;
      const t = now - start;
      const fade = t > RUN_MS - 700 ? Math.max(0, (RUN_MS - t) / 700) : 1;

      // Build a 2D intensity grid: 0 = empty, 1 = head (bright), 0.4 = trail (dim).
      const grid: number[][] = Array.from({ length: rows }, () =>
        Array(cols).fill(0)
      );

      for (let c = 0; c < cols; c++) {
        const s = streams[c];
        s.y += s.speed;
        s.nextSwap -= 1;
        if (s.nextSwap <= 0) {
          // reroll a couple of glyphs in this column for shimmer
          for (let i = 0; i < 2; i++) {
            const ry = Math.floor(Math.random() * rows);
            glyphs[ry][c] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          s.nextSwap = 4 + Math.floor(Math.random() * 8);
        }
        const head = Math.floor(s.y);
        if (head > rows + s.length) {
          s.y = -Math.floor(Math.random() * rows);
          s.length = 4 + Math.floor(Math.random() * 8);
          s.speed = 0.4 + Math.random() * 1.1;
        }
        for (let i = 0; i < s.length; i++) {
          const y = head - i;
          if (y < 0 || y >= rows) continue;
          // Head bright, trail dimmer
          grid[y][c] = i === 0 ? 1 : 0.4;
        }
      }

      // Render: build colored markup row by row using <span>. Class-based
      // colors so the only color literals remain in tailwind.config.ts.
      const rowsOut: string[] = [];
      for (let r = 0; r < rows; r++) {
        let row = "";
        for (let c = 0; c < cols; c++) {
          const v = grid[r][c];
          const ch = glyphs[r][c];
          if (v === 0) {
            row += " ";
          } else if (v === 1) {
            row += `<span class="text-phosphor-bright phosphor-glow">${escape(ch)}</span>`;
          } else {
            row += `<span class="text-phosphor-dimmer">${escape(ch)}</span>`;
          }
        }
        rowsOut.push(row);
      }

      if (node) {
        node.style.opacity = String(fade);
        node.innerHTML = rowsOut.join("\n");
      }

      if (t < RUN_MS) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
        onDoneRef.current?.();
      }
    }
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  if (done) {
    return (
      <div className="space-y-1 text-center py-6">
        <pre className="text-phosphor-ok phosphor-glow leading-tight text-[11px] sm:text-[13px] whitespace-pre inline-block text-left">
{`     X  E
   ─────────
   network sync complete.`}
        </pre>
      </div>
    );
  }

  return (
    <pre
      ref={ref}
      aria-hidden="true"
      className="font-mono whitespace-pre overflow-hidden leading-[1.1] text-[11px] sm:text-[13px] h-[280px]"
    />
  );
}

function escape(s: string) {
  // Defend against the rare regex/special-char glyph getting injected into HTML.
  return s.replace(/[<>&]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;"
  );
}
