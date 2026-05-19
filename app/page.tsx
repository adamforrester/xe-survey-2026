"use client";

import { useCallback, useEffect, useState } from "react";
import { Terminal } from "@/components/terminal/Terminal";
import { BootSequence } from "@/components/terminal/BootSequence";
import { StatusBar } from "@/components/terminal/StatusBar";
import { CRTOverlay } from "@/components/terminal/CRTOverlay";
import { CheatSheet } from "@/components/terminal/CheatSheet";
import { Section1Identify } from "@/components/sections/Section1Identify";
import { Section2Calibrate } from "@/components/sections/Section2Calibrate";
import { Section3Scan } from "@/components/sections/Section3Scan";
import { Section4Map } from "@/components/sections/Section4Map";
import { Section5Sync } from "@/components/sections/Section5Sync";
import { Section6Align } from "@/components/sections/Section6Align";
import { InterSection } from "@/components/sections/InterSection";
import { SubmitScreen } from "@/components/sections/SubmitScreen";
import { StandardForm } from "@/components/fallback/StandardForm";
import { sound } from "@/lib/sound-manager";
import type { SurveyAnswers } from "@/lib/survey-schema";

const CRT_KEY = "xe.crt";

// Phase is the *current* furthest step. Anything below it stays mounted as
// scrollback (sections render their own AnswerEchoes when internally "done").
type Phase =
  | "boot"
  | "section-1"
  | "inter-1"
  | "section-2"
  | "inter-2"
  | "section-3"
  | "inter-3"
  | "section-4"
  | "inter-4"
  | "section-5"
  | "inter-5"
  | "section-6"
  | "submit";

const PHASE_ORDER: Phase[] = [
  "boot",
  "section-1",
  "inter-1",
  "section-2",
  "inter-2",
  "section-3",
  "inter-3",
  "section-4",
  "inter-4",
  "section-5",
  "inter-5",
  "section-6",
  "submit",
];

function reached(current: Phase, target: Phase): boolean {
  return PHASE_ORDER.indexOf(current) >= PHASE_ORDER.indexOf(target);
}

const INTER_MESSAGES: Record<string, string> = {
  "inter-1": "// section 1 sealed. compiling identity vector.",
  "inter-2": "// stack calibrated. you're cleared for the next channel.",
  "inter-3": "// teach registry updated. mapping growth vectors next.",
  "inter-4": "// growth vectors logged. calibrating cadence handshake.",
  "inter-5": "// sync preferences captured. final alignment ahead.",
};

export default function Page() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [crtOn, setCrtOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [bootDone, setBootDone] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    sound.init();
    setSoundOn(sound.enabled);
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(CRT_KEY);
      if (stored === "off") setCrtOn(false);
    }
  }, []);

  function setCrt(next: boolean) {
    setCrtOn(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CRT_KEY, next ? "on" : "off");
    }
  }

  function toggleCrt() {
    setCrt(!crtOn);
  }

  function setSoundEnabled(next: boolean) {
    sound.setEnabled(next);
    setSoundOn(next);
  }

  function toggleSound() {
    setSoundEnabled(!soundOn);
  }

  // Global "?" opens CheatSheet; Escape opens fallback (unless CheatSheet open
  // or focus is in an editable field).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      const isEditable = tag === "input" || tag === "textarea";

      if (e.key === "?" && !isEditable && !helpOpen) {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }
      if (e.key === "Escape" && !helpOpen && !fallback && !isEditable) {
        e.preventDefault();
        setFallback(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [helpOpen, fallback]);

  const updateAnswers = useCallback(
    (patch: Partial<SurveyAnswers>) => setAnswers((a) => ({ ...a, ...patch })),
    []
  );

  function clearScreen() {
    setBootDone(false);
    setAnswers({});
    setPhase("boot");
  }

  function restart() {
    setAnswers({});
    setBootDone(false);
    setPhase("boot");
  }

  // Each section's onComplete should only fire once. We guard by checking
  // whether the current phase has already moved past this section.
  function advanceTo(target: Phase) {
    return () => {
      if (reached(phase, target)) return;
      sound.play("beep-section");
      setPhase(target);
    };
  }

  if (fallback) {
    return (
      <main className="min-h-screen bg-terminal-bg text-phosphor">
        <StandardForm initial={answers} onCancel={() => setFallback(false)} />
      </main>
    );
  }

  // Sections stay mounted once reached. Their internal "done" state renders
  // AnswerEchoes — that becomes the scrollback. The currently-active section
  // is whichever section's phase === current. Past sections still render but
  // their step is already "done" so they're read-only.
  return (
    <main
      className={`h-screen flex flex-col font-mono text-phosphor ${
        crtOn ? "" : "crt-off"
      }`}
    >
      <Terminal>
        <BootSequence
          onComplete={() => {
            if (bootDone) return;
            setBootDone(true);
            sound.play("beep-section");
            setPhase("section-1");
          }}
        />

        {bootDone && reached(phase, "section-1") && (
          <Section1Identify
            answers={answers}
            onUpdate={updateAnswers}
            onComplete={advanceTo("inter-1")}
          />
        )}

        {reached(phase, "inter-1") && phase === "inter-1" && (
          <InterSection
            message={INTER_MESSAGES["inter-1"]}
            onContinue={() => setPhase("section-2")}
            onClear={clearScreen}
            onSetCrt={setCrt}
            onSetSound={setSoundEnabled}
          />
        )}

        {reached(phase, "section-2") && (
          <Section2Calibrate
            answers={answers}
            onUpdate={updateAnswers}
            onComplete={advanceTo("inter-2")}
          />
        )}

        {reached(phase, "inter-2") && phase === "inter-2" && (
          <InterSection
            message={INTER_MESSAGES["inter-2"]}
            onContinue={() => setPhase("section-3")}
            onClear={clearScreen}
            onSetCrt={setCrt}
            onSetSound={setSoundEnabled}
          />
        )}

        {reached(phase, "section-3") && (
          <Section3Scan
            answers={answers}
            onUpdate={updateAnswers}
            onComplete={advanceTo("inter-3")}
          />
        )}

        {reached(phase, "inter-3") && phase === "inter-3" && (
          <InterSection
            message={INTER_MESSAGES["inter-3"]}
            onContinue={() => setPhase("section-4")}
            onClear={clearScreen}
            onSetCrt={setCrt}
            onSetSound={setSoundEnabled}
          />
        )}

        {reached(phase, "section-4") && (
          <Section4Map
            answers={answers}
            onUpdate={updateAnswers}
            onComplete={advanceTo("inter-4")}
          />
        )}

        {reached(phase, "inter-4") && phase === "inter-4" && (
          <InterSection
            message={INTER_MESSAGES["inter-4"]}
            onContinue={() => setPhase("section-5")}
            onClear={clearScreen}
            onSetCrt={setCrt}
            onSetSound={setSoundEnabled}
          />
        )}

        {reached(phase, "section-5") && (
          <Section5Sync
            answers={answers}
            onUpdate={updateAnswers}
            onComplete={advanceTo("inter-5")}
          />
        )}

        {reached(phase, "inter-5") && phase === "inter-5" && (
          <InterSection
            message={INTER_MESSAGES["inter-5"]}
            onContinue={() => setPhase("section-6")}
            onClear={clearScreen}
            onSetCrt={setCrt}
            onSetSound={setSoundEnabled}
          />
        )}

        {reached(phase, "section-6") && (
          <Section6Align
            answers={answers}
            onUpdate={updateAnswers}
            onComplete={advanceTo("submit")}
          />
        )}

        {phase === "submit" && (
          <SubmitScreen answers={answers} onRestart={restart} />
        )}
      </Terminal>

      <StatusBar
        crtOn={crtOn}
        soundOn={soundOn}
        onToggleCrt={toggleCrt}
        onToggleSound={toggleSound}
        onFallback={() => setFallback(true)}
        onHelp={() => setHelpOpen(true)}
      />

      <CRTOverlay on={crtOn} />
      <CheatSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </main>
  );
}
