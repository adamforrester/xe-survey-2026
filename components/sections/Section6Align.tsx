"use client";

import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { QuestionFrame } from "./QuestionFrame";
import { AnswerEcho } from "./AnswerEcho";
import { TextInput } from "../inputs/TextInput";
import { type SurveyAnswers } from "@/lib/survey-schema";

interface Section6Props {
  answers: SurveyAnswers;
  onUpdate: (patch: Partial<SurveyAnswers>) => void;
  onComplete: () => void;
}

const SECTION_6_LOADING = [
  "aligning vision vector",
  "opening final channel",
];

const Q17_PROMPT =
  "in 1–2 sentences: what would make XE feel like a real, valuable thing for you 6 months from now?";
const Q18_PROMPT =
  "(optional) anything else we should know — questions, ideas, concerns, hopes?";

type Step = "header" | "q17" | "q18" | "done";

export function Section6Align({ answers, onUpdate, onComplete }: Section6Props) {
  const [step, setStep] = useState<Step>("header");

  return (
    <div>
      <SectionHeader
        command="align"
        flag="vision"
        title="Section 6 — Looking Forward"
        loadingLines={SECTION_6_LOADING}
        onReady={() => setStep("q17")}
      />

      {step === "q17" && (
        <QuestionFrame number="Q17" prompt={Q17_PROMPT}>
          <TextInput
            ariaLabel="6-month vision"
            multiline
            placeholder="1–2 sentences"
            initial={answers.q17 ?? ""}
            onSubmit={(v) => {
              onUpdate({ q17: v });
              setStep("q18");
            }}
          />
        </QuestionFrame>
      )}
      {(step === "q18" || step === "done") && answers.q17 && (
        <AnswerEcho number="Q17" prompt={Q17_PROMPT} answer={answers.q17} />
      )}

      {step === "q18" && (
        <QuestionFrame number="Q18" prompt={Q18_PROMPT}>
          <TextInput
            ariaLabel="Final notes"
            multiline
            optional
            placeholder="anything else on your mind"
            initial={answers.q18 ?? ""}
            onSubmit={(v) => {
              onUpdate({ q18: v || undefined });
              setStep("done");
              setTimeout(onComplete, 200);
            }}
          />
        </QuestionFrame>
      )}
      {step === "done" && (
        <AnswerEcho number="Q18" prompt={Q18_PROMPT} answer={answers.q18 || "(skipped)"} />
      )}
    </div>
  );
}
