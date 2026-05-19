"use client";

import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { QuestionFrame } from "./QuestionFrame";
import { AnswerEcho } from "./AnswerEcho";
import { SingleSelect } from "../inputs/SingleSelect";
import { MultiSelect } from "../inputs/MultiSelect";
import { TextInput } from "../inputs/TextInput";
import {
  Q6_OPTIONS,
  TOPIC_OPTIONS,
  shouldShowQ7,
  shouldShowQ8,
  type SurveyAnswers,
} from "@/lib/survey-schema";

interface Section3Props {
  answers: SurveyAnswers;
  onUpdate: (patch: Partial<SurveyAnswers>) => void;
  onComplete: () => void;
}

const SECTION_3_LOADING = [
  "scanning teach permissions",
  "indexing topic registry",
];

const Q6_PROMPT =
  "interested in leading a learning session in the next 6–12 months?";
const Q7_PROMPT = "which topics would you want to lead? (multi-select)";
const Q8_PROMPT =
  "(optional) specific angle or framing for what you'd want to lead?";
const Q9_PROMPT =
  "(optional) any niche skill or experience the group should know about?";

type Step = "header" | "q6" | "q7" | "q8" | "q9" | "done";

function labelFor(value: string | undefined, opts: { value: string; label: string }[]) {
  return opts.find((o) => o.value === value)?.label ?? value ?? "";
}

export function Section3Scan({ answers, onUpdate, onComplete }: Section3Props) {
  const [step, setStep] = useState<Step>("header");

  function nextAfterQ6() {
    if (shouldShowQ7(answers)) {
      setStep("q7");
    } else {
      setStep("q9");
    }
  }

  function nextAfterQ7() {
    if (shouldShowQ8(answers)) {
      setStep("q8");
    } else {
      setStep("q9");
    }
  }

  return (
    <div>
      <SectionHeader
        command="scan"
        flag="teach"
        title="Section 3 — Leading Learning Sessions"
        loadingLines={SECTION_3_LOADING}
        onReady={() => setStep("q6")}
      />

      {step === "q6" && (
        <QuestionFrame number="Q6" prompt={Q6_PROMPT}>
          <SingleSelect
            options={Q6_OPTIONS}
            ariaLabel="Interest in leading a learning session"
            initial={answers.q6}
            onSubmit={(v) => {
              onUpdate({ q6: v });
              if (v === "no") {
                setStep("q9");
              } else {
                setStep("q7");
              }
            }}
          />
        </QuestionFrame>
      )}
      {step !== "q6" && step !== "header" && answers.q6 && (
        <AnswerEcho
          number="Q6"
          prompt={Q6_PROMPT}
          answer={labelFor(answers.q6, Q6_OPTIONS)}
        />
      )}

      {step === "q7" && (
        <QuestionFrame number="Q7" prompt={Q7_PROMPT}>
          <MultiSelect
            options={TOPIC_OPTIONS}
            ariaLabel="Topics to lead"
            initial={answers.q7 ?? []}
            onSubmit={(values, otherText) => {
              onUpdate({ q7: values, q7_other: otherText });
              setStep("q8");
            }}
          />
        </QuestionFrame>
      )}
      {(step === "q8" || step === "q9" || step === "done") &&
        answers.q7 &&
        answers.q7.length > 0 && (
          <AnswerEcho
            number="Q7"
            prompt={Q7_PROMPT}
            answer={answers.q7
              .map((v) =>
                v === "other"
                  ? `Other — ${answers.q7_other ?? ""}`
                  : labelFor(v, TOPIC_OPTIONS)
              )
              .join(", ")}
          />
        )}

      {step === "q8" && (
        <QuestionFrame number="Q8" prompt={Q8_PROMPT}>
          <TextInput
            ariaLabel="Angle or framing"
            multiline
            optional
            placeholder="e.g. 'Claude API specifically for non-engineers'"
            initial={answers.q8 ?? ""}
            onSubmit={(v) => {
              onUpdate({ q8: v || undefined });
              setStep("q9");
            }}
          />
        </QuestionFrame>
      )}
      {(step === "q9" || step === "done") && answers.q8 !== undefined && (
        <AnswerEcho number="Q8" prompt={Q8_PROMPT} answer={answers.q8 || "(skipped)"} />
      )}

      {step === "q9" && (
        <QuestionFrame number="Q9" prompt={Q9_PROMPT}>
          <TextInput
            ariaLabel="Niche skill or experience"
            multiline
            optional
            placeholder="e.g. 'Built indie games for 5 years'"
            initial={answers.q9 ?? ""}
            onSubmit={(v) => {
              onUpdate({ q9: v || undefined });
              setStep("done");
              setTimeout(onComplete, 200);
            }}
          />
        </QuestionFrame>
      )}
      {step === "done" && (
        <AnswerEcho number="Q9" prompt={Q9_PROMPT} answer={answers.q9 || "(skipped)"} />
      )}
    </div>
  );
}
