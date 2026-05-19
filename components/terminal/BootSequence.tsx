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

  useEffect(() => {
    if (phase !== "press-any") return;
    const mountedAt = performance.now();
    let fired = false;
    function onKey(e: KeyboardEvent) {
      if (fired) return;
      if (e.key === "Enter" && performance.now() - mountedAt < 150) return;
      if (
        e.key === "Enter" ||
        e.key === " " ||
        e.key === "ArrowDown" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        fired = true;
        window.removeEventListener("keydown", onKey);
        sound.play("key-enter");
        onComplete();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onComplete]);

  return (
    <div className="space-y-3">
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
          <div className="text-phosphor-dim space-y-0.5">
            <div>mounting /xe/capabilities... ok</div>
            <div>loading skill registry... ok</div>
            <div>establishing uplink... ok</div>
            <div>spinning up intake daemon... ok</div>
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
          <div className="text-phosphor-dim space-y-0.5">
            <div>mounting /xe/capabilities... ok</div>
            <div>loading skill registry... ok</div>
            <div>establishing uplink... ok</div>
            <div>spinning up intake daemon... ok</div>
            <div>checking auth (vibes-based)... ok</div>
            <div>ready... ok</div>
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
          <div className="text-phosphor-dim space-y-0.5">
            <div>mounting /xe/capabilities... ok</div>
            <div>loading skill registry... ok</div>
            <div>establishing uplink... ok</div>
            <div>spinning up intake daemon... ok</div>
            <div>checking auth (vibes-based)... ok</div>
            <div>ready... ok</div>
          </div>
          <div className="pt-2">welcome, operative. this is the XE intake terminal.</div>
          <div className="pt-3 text-phosphor-dim text-sm">
            takes about 10 minutes. honest answers beat polished ones.
          </div>
          <div className="pt-2 flex items-center gap-2">
            <span className="text-phosphor-bright">press enter to begin</span>
            <Cursor />
          </div>
        </>
      )}
    </div>
  );
}
