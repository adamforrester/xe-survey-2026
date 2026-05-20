"use client";

import { useEffect, useRef, useState } from "react";
import { TypewriterText } from "./TypewriterText";
import { ProcessLog } from "./ProcessLog";
import { Cursor } from "./Cursor";
import { XE_LOGO, BOOT_BANNER } from "@/lib/ascii-art";
import { sound } from "@/lib/sound-manager";

interface BootSequenceProps {
  onComplete: () => void;
}

type Phase =
  | "logo"
  | "load-line-1"
  | "load-list"
  | "ready-line"
  | "press-any";

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<Phase>("logo");
  const chimePlayed = useRef(false);

  useEffect(() => {
    if (phase === "logo" && !chimePlayed.current) {
      chimePlayed.current = true;
      sound.play("boot-chime");
    }
  }, [phase]);

  const firedRef = useRef(false);

  useEffect(() => {
    if (phase !== "press-any") return;
    const mountedAt = performance.now();
    firedRef.current = false;
    function onKey(e: KeyboardEvent) {
      if (firedRef.current) return;
      if (e.key === "Enter" && performance.now() - mountedAt < 150) return;
      if (
        e.key === "Enter" ||
        e.key === " " ||
        e.key === "ArrowDown" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        firedRef.current = true;
        window.removeEventListener("keydown", onKey);
        sound.play("key-enter");
        onComplete();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onComplete]);

  function handleBeginTap() {
    if (phase !== "press-any" || firedRef.current) return;
    firedRef.current = true;
    sound.play("key-enter");
    onComplete();
  }

  return (
    <div className="space-y-5">
      <pre className="text-phosphor-bright phosphor-glow leading-tight text-[11px] sm:text-[13px] whitespace-pre">
        {XE_LOGO}
      </pre>
      <pre className="text-phosphor-dim text-[10px] sm:text-xs whitespace-pre">
        {BOOT_BANNER}
      </pre>

      {phase === "logo" && (
        <div>
          <TypewriterText
            text="Loading XE intake module v1.0..."
            speed={26}
            jitter={10}
            startDelay={400}
            onDone={() => setPhase("load-line-1")}
          />
        </div>
      )}
      {phase !== "logo" && (
        <div className="text-phosphor">Loading XE intake module v1.0...</div>
      )}

      {phase === "load-line-1" && (
        <ProcessLog
          lines={[
            "mounting /xe/capabilities",
            "loading skill registry",
            "establishing uplink",
            "spinning up intake daemon",
          ]}
          perLineMs={140}
          onDone={() => setPhase("load-list")}
        />
      )}
      {phase === "load-list" && (
        <>
          <div className="space-y-0.5">
            <OkLine>mounting /xe/capabilities</OkLine>
            <OkLine>loading skill registry</OkLine>
            <OkLine>establishing uplink</OkLine>
            <OkLine>spinning up intake daemon</OkLine>
          </div>
          <ProcessLog
            lines={[
              "checking auth (vibes-based)",
              "ready",
            ]}
            perLineMs={180}
            onDone={() => setPhase("ready-line")}
          />
        </>
      )}
      {phase === "ready-line" && (
        <>
          <div className="space-y-0.5">
            <OkLine>mounting /xe/capabilities</OkLine>
            <OkLine>loading skill registry</OkLine>
            <OkLine>establishing uplink</OkLine>
            <OkLine>spinning up intake daemon</OkLine>
            <OkLine>checking auth (vibes-based)</OkLine>
            <OkLine>ready</OkLine>
          </div>
          <div className="pt-2">
            <TypewriterText
              text="welcome, operative. this is the XE intake terminal."
              speed={28}
              onDone={() => setPhase("press-any")}
            />
          </div>
        </>
      )}
      {phase === "press-any" && (
        <>
          <div className="space-y-0.5">
            <OkLine>mounting /xe/capabilities</OkLine>
            <OkLine>loading skill registry</OkLine>
            <OkLine>establishing uplink</OkLine>
            <OkLine>spinning up intake daemon</OkLine>
            <OkLine>checking auth (vibes-based)</OkLine>
            <OkLine>ready</OkLine>
          </div>
          <div className="pt-2">welcome, operative. this is the XE intake terminal.</div>
          <div className="pt-3 text-phosphor-dim text-sm">
            takes about 10 minutes. honest answers beat polished ones.
          </div>
          <button
            type="button"
            onClick={handleBeginTap}
            className="mt-2 inline-flex items-center gap-2 border border-phosphor/40 bg-transparent px-3 py-2 text-phosphor-bright hover:bg-phosphor/10 focus:outline-none focus:ring-1 focus:ring-phosphor cursor-pointer"
            aria-label="Begin survey"
          >
            <span>press enter / tap to begin</span>
            <Cursor />
          </button>
        </>
      )}
    </div>
  );
}

function OkLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-phosphor-dim">
      {children}
      <span>... </span>
      <span className="text-phosphor-ok">ok</span>
    </div>
  );
}
