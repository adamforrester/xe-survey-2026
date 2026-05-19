"use client";

import { useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sound-manager";
import type { Rating } from "@/lib/survey-schema";

interface RatingTableProps {
  rows: { id: string; label: string }[];
  legend: string;
  ariaLabel: string;
  initial?: Record<string, Rating | undefined>;
  onSubmit: (values: Record<string, Rating>) => void;
}

const SCALE: Rating[] = [1, 2, 3, 4, 5];

// Row-by-row calibration. Left/right arrows pick a value (1–5 also work),
// Enter advances to the next row. After the final row, a brief "calibrating"
// sweep plays before submit.
export function RatingTable({
  rows,
  legend,
  ariaLabel,
  initial = {},
  onSubmit,
}: RatingTableProps) {
  const [activeRow, setActiveRow] = useState(0);
  const [values, setValues] = useState<Record<string, Rating | undefined>>(initial);
  const [sweep, setSweep] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    const mountedAt = performance.now();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && performance.now() - mountedAt < 200) return;
      if (sweep) return;
      const row = rows[activeRow];
      if (!row) return;

      if (e.key === "ArrowLeft" || e.key === "h") {
        e.preventDefault();
        setValues((v) => {
          const cur = v[row.id] ?? 3;
          const next = Math.max(1, cur - 1) as Rating;
          if (next !== cur) sound.playKeystroke();
          return { ...v, [row.id]: next };
        });
      } else if (e.key === "ArrowRight" || e.key === "l") {
        e.preventDefault();
        setValues((v) => {
          const cur = v[row.id] ?? 3;
          const next = Math.min(5, cur + 1) as Rating;
          if (next !== cur) sound.playKeystroke();
          return { ...v, [row.id]: next };
        });
      } else if (/^[1-5]$/.test(e.key)) {
        e.preventDefault();
        const n = Number(e.key) as Rating;
        setValues((v) => ({ ...v, [row.id]: n }));
        sound.playKeystroke();
      } else if (e.key === "Enter") {
        e.preventDefault();
        // Default missing to 3 if user just hits enter without picking
        setValues((v) => {
          if (v[row.id] === undefined) return { ...v, [row.id]: 3 as Rating };
          return v;
        });
        sound.play("key-enter");
        if (activeRow < rows.length - 1) {
          setActiveRow((i) => i + 1);
        } else {
          // Run final sweep then submit
          setSweep(true);
        }
      } else if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        if (activeRow < rows.length - 1) {
          setActiveRow((i) => i + 1);
          sound.playKeystroke();
        }
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        if (activeRow > 0) {
          setActiveRow((i) => i - 1);
          sound.playKeystroke();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeRow, rows, sweep]);

  // Sweep: rapid pulse across all rows then submit
  useEffect(() => {
    if (!sweep) return;
    const filled: Record<string, Rating> = {};
    for (const row of rows) {
      filled[row.id] = (values[row.id] ?? 3) as Rating;
    }
    sound.play("beep-section");
    const t = setTimeout(() => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      onSubmit(filled);
    }, Math.min(900, 80 * rows.length + 200));
    return () => clearTimeout(t);
  }, [sweep, rows, values, onSubmit]);

  return (
    <div role="group" aria-label={ariaLabel} className="space-y-2">
      <div className="text-phosphor-dim text-xs">{legend}</div>
      <div className="space-y-1.5">
        {rows.map((row, i) => {
          const v = values[row.id] ?? 0;
          const isActive = i === activeRow && !sweep;
          return (
            <div
              key={row.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-2 py-1 ${
                isActive ? "bg-phosphor-dimmer/40" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className={isActive ? "text-phosphor-bright" : "text-phosphor"}>
                  {isActive && <span className="select-none mr-1">▸</span>}
                  {row.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RatingBar
                  value={sweep ? (values[row.id] ?? 3) : v}
                  active={isActive}
                  sweepIndex={sweep ? i : -1}
                />
                <span className="text-phosphor-dim text-xs w-6 text-right tabular-nums">
                  {v ? `${v}/5` : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-phosphor-dim text-xs pt-2">
        ←/→ or 1–5 to set · ↑/↓ to move · enter to advance ·{" "}
        {sweep ? "calibrating..." : `${activeRow + 1}/${rows.length}`}
      </div>
    </div>
  );
}

function RatingBar({
  value,
  active,
  sweepIndex,
}: {
  value: number;
  active: boolean;
  sweepIndex: number;
}) {
  const cells = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {cells.map((n) => {
        const filled = value >= n;
        return (
          <span
            key={n}
            className={`inline-block w-3 sm:w-4 h-3 sm:h-4 border ${
              filled
                ? active
                  ? "bg-phosphor-bright border-phosphor-bright"
                  : "bg-phosphor border-phosphor"
                : "border-phosphor-dimmer"
            } ${sweepIndex >= 0 ? "transition-colors duration-150" : ""}`}
          />
        );
      })}
    </div>
  );
}
