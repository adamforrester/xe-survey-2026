"use client";

import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { QuestionFrame } from "./QuestionFrame";
import { AnswerEcho } from "./AnswerEcho";
import { RatingTable } from "../inputs/RatingTable";
import { TextInput } from "../inputs/TextInput";
import {
  Q2A_ROWS,
  Q2B_ROWS,
  RATING_SCALE_LEGEND,
  type SurveyAnswers,
  type Rating,
} from "@/lib/survey-schema";

interface Section2Props {
  answers: SurveyAnswers;
  onUpdate: (patch: Partial<SurveyAnswers>) => void;
  onComplete: () => void;
}

const SECTION_2_LOADING = [
  "calibrating sensor array",
  "tuning rating channels",
  "ready to scan stack",
];

const Q2A_PROMPT = "calibrate yourself on each — tech stack proficiency.";
const Q2B_PROMPT = "calibrate yourself on each — foundational XE skills.";
const Q5_PROMPT = "what are your most-used or favorite tools in the XE space?";

type Step = "header" | "q2a" | "q2b" | "q5" | "done";

export function Section2Calibrate({ answers, onUpdate, onComplete }: Section2Props) {
  const [step, setStep] = useState<Step>("header");

  return (
    <div>
      <SectionHeader
        command="calibrate"
        flag="stack"
        title="Section 2 — Current Skills"
        loadingLines={SECTION_2_LOADING}
        onReady={() => setStep("q2a")}
      />

      {step === "q2a" && (
        <QuestionFrame number="2A" prompt={Q2A_PROMPT}>
          <RatingTable
            rows={Q2A_ROWS}
            legend={RATING_SCALE_LEGEND}
            ariaLabel="Tech stack proficiency ratings"
            initial={answers.q2a ?? {}}
            onSubmit={(values) => {
              onUpdate({ q2a: values });
              setStep("q2b");
            }}
          />
        </QuestionFrame>
      )}
      {(step === "q2b" || step === "q5" || step === "done") && answers.q2a && (
        <AnswerEcho
          number="2A"
          prompt={Q2A_PROMPT}
          answer={summarizeRatings(Q2A_ROWS, answers.q2a)}
        />
      )}

      {step === "q2b" && (
        <QuestionFrame number="2B" prompt={Q2B_PROMPT}>
          <RatingTable
            rows={Q2B_ROWS}
            legend={RATING_SCALE_LEGEND}
            ariaLabel="Foundational XE skill ratings"
            initial={answers.q2b ?? {}}
            onSubmit={(values) => {
              onUpdate({ q2b: values });
              setStep("q5");
            }}
          />
        </QuestionFrame>
      )}
      {(step === "q5" || step === "done") && answers.q2b && (
        <AnswerEcho
          number="2B"
          prompt={Q2B_PROMPT}
          answer={summarizeRatings(Q2B_ROWS, answers.q2b)}
        />
      )}

      {step === "q5" && (
        <QuestionFrame number="Q5" prompt={Q5_PROMPT}>
          <TextInput
            ariaLabel="Most-used XE tools"
            multiline
            optional
            placeholder="Cursor, Claude Code, Figma, v0..."
            initial={answers.q5 ?? ""}
            onSubmit={(v) => {
              onUpdate({ q5: v || undefined });
              setStep("done");
              setTimeout(onComplete, 200);
            }}
          />
        </QuestionFrame>
      )}
      {step === "done" && (
        <AnswerEcho number="Q5" prompt={Q5_PROMPT} answer={answers.q5 || "(skipped)"} />
      )}
    </div>
  );
}

function summarizeRatings(
  rows: { id: string; label: string }[],
  values: Record<string, Rating | undefined>
) {
  const top = rows
    .map((r) => ({ label: r.label, v: values[r.id] ?? 0 }))
    .filter((r) => r.v >= 4)
    .sort((a, b) => b.v - a.v)
    .slice(0, 3)
    .map((r) => `${r.label} (${r.v}/5)`);
  if (top.length === 0) return "calibrated · no 4+ ratings";
  return `top ${top.length}: ${top.join(", ")}`;
}
