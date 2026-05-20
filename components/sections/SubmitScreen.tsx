"use client";

import { useEffect, useRef, useState } from "react";
import { ProcessLog } from "../terminal/ProcessLog";
import { TypewriterText } from "../terminal/TypewriterText";
import { Cursor } from "../terminal/Cursor";
import { MatrixRain } from "../terminal/MatrixRain";
import { sound } from "@/lib/sound-manager";
import { submitSurvey } from "@/lib/submit";
import type { SurveyAnswers } from "@/lib/survey-schema";

interface SubmitScreenProps {
  answers: SurveyAnswers;
  onRestart: () => void;
}

const COMPILE_LINES = [
  "compiling profile",
  "syncing to network",
  "writing to /xe/registry",
  "broadcasting handshake",
];

type Phase = "compile" | "submitting" | "rain" | "success" | "error";

export function SubmitScreen({ answers, onRestart }: SubmitScreenProps) {
  const [phase, setPhase] = useState<Phase>("compile");
  const [error, setError] = useState<string | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);
  const fired = useRef(false);

  useEffect(() => {
    if (phase !== "submitting") return;
    let cancelled = false;
    submitSurvey(answers).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        sound.play("modem-sync");
        setPhase("rain");
      } else {
        setError(res.error);
        sound.play("beep-error");
        setPhase("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [phase, answers, attempt]);

  useEffect(() => {
    if (phase !== "success") return;
    const t = setTimeout(() => sound.play("boot-chime"), 600);
    return () => clearTimeout(t);
  }, [phase]);

  function onCompileDone() {
    if (fired.current) return;
    fired.current = true;
    sound.play("beep-section");
    setPhase("submitting");
  }

  function retry() {
    fired.current = false;
    setError(undefined);
    setAttempt((a) => a + 1);
    setPhase("compile");
  }

  return (
    <div className="space-y-3 mt-4">
      <div className="text-phosphor-bright">$ submit --xe-profile</div>

      {(phase === "compile" || phase === "submitting") && (
        <ProcessLog lines={COMPILE_LINES} perLineMs={220} onDone={onCompileDone} />
      )}

      {phase === "submitting" && (
        <div className="text-phosphor-dim flex items-center gap-2">
          <span>uplink active</span>
          <Cursor />
        </div>
      )}

      {phase === "rain" && (
        <div className="space-y-3 pt-2">
          <div className="text-phosphor-ok">[ok] handshake complete · joining mesh</div>
          <MatrixRain onDone={() => setPhase("success")} />
        </div>
      )}

      {phase === "success" && (
        <div className="space-y-2">
          <div className="text-phosphor-ok">[ok] profile synced · node online</div>
          <div className="text-phosphor-bright">
            <TypewriterText
              text="welcome to the XE network, operative."
              speed={32}
              jitter={14}
            />
          </div>
          <div className="text-phosphor-dim text-sm pt-2">
            your signal is added to the mesh. honest answers, well received.
          </div>
          <div className="text-phosphor-dim text-sm">
            you can close this terminal. responses are recorded.
          </div>
          <div className="pt-3">
            <button
              type="button"
              onClick={onRestart}
              className="text-phosphor-bright underline underline-offset-4 hover:text-phosphor"
            >
              [restart session]
            </button>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div className="space-y-2">
          <div className="text-phosphor-error">
            [error] uplink failed{error ? ` — ${error}` : ""}
          </div>
          <div className="text-phosphor-dim text-sm">
            your answers are still in memory. nothing was lost.
          </div>
          <div className="pt-2 flex gap-4">
            <button
              type="button"
              onClick={retry}
              className="text-phosphor-bright underline underline-offset-4 hover:text-phosphor"
            >
              [retry submit]
            </button>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([JSON.stringify(answers, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "xe-intake-response.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-phosphor underline underline-offset-4 hover:text-phosphor-bright"
            >
              [download local copy]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
