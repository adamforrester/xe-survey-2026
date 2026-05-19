"use client";

import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { QuestionFrame } from "./QuestionFrame";
import { AnswerEcho } from "./AnswerEcho";
import { SingleSelect } from "../inputs/SingleSelect";
import { MultiSelect } from "../inputs/MultiSelect";
import { TextInput } from "../inputs/TextInput";
import {
  TOPIC_OPTIONS,
  Q12_OPTIONS,
  Q13_OPTIONS,
  Q10_MAX,
  type SurveyAnswers,
} from "@/lib/survey-schema";

interface Section4Props {
  answers: SurveyAnswers;
  onUpdate: (patch: Partial<SurveyAnswers>) => void;
  onComplete: () => void;
}

const SECTION_4_LOADING = [
  "mapping growth vectors",
  "loading learning topology",
  "fetching access matrix",
];

const Q10_PROMPT = `top 3 things you most want to learn (max ${Q10_MAX})`;
const Q11_PROMPT = "what gap is currently blocking your best work?";
const Q12_PROMPT = "how do you learn best? (multi-select)";
const Q13_PROMPT = "do you have admin access to your work laptop?";
const Q14_PROMPT =
  "if you could have access to any tool — AI or otherwise — that you don't currently have, what would it be?";

type Step = "header" | "q10" | "q11" | "q12" | "q13" | "q14" | "done";

function labelFor(value: string | undefined, opts: { value: string; label: string }[]) {
  return opts.find((o) => o.value === value)?.label ?? value ?? "";
}

export function Section4Map({ answers, onUpdate, onComplete }: Section4Props) {
  const [step, setStep] = useState<Step>("header");

  return (
    <div>
      <SectionHeader
        command="map"
        flag="learning"
        title="Section 4 — Learning, Growth & Access"
        loadingLines={SECTION_4_LOADING}
        onReady={() => setStep("q10")}
      />

      {step === "q10" && (
        <QuestionFrame number="Q10" prompt={Q10_PROMPT}>
          <MultiSelect
            options={TOPIC_OPTIONS}
            ariaLabel="Top things to learn (max 3)"
            max={Q10_MAX}
            initial={answers.q10 ?? []}
            onSubmit={(values, otherText) => {
              onUpdate({ q10: values, q10_other: otherText });
              setStep("q11");
            }}
          />
        </QuestionFrame>
      )}
      {(step === "q11" || step === "q12" || step === "q13" || step === "q14" || step === "done") &&
        answers.q10 && (
          <AnswerEcho
            number="Q10"
            prompt={Q10_PROMPT}
            answer={answers.q10
              .map((v) =>
                v === "other"
                  ? `Other — ${answers.q10_other ?? ""}`
                  : labelFor(v, TOPIC_OPTIONS)
              )
              .join(", ")}
          />
        )}

      {step === "q11" && (
        <QuestionFrame number="Q11" prompt={Q11_PROMPT}>
          <TextInput
            ariaLabel="Current blocker"
            multiline
            placeholder="1–2 sentences"
            initial={answers.q11 ?? ""}
            onSubmit={(v) => {
              onUpdate({ q11: v });
              setStep("q12");
            }}
          />
        </QuestionFrame>
      )}
      {(step === "q12" || step === "q13" || step === "q14" || step === "done") &&
        answers.q11 && (
          <AnswerEcho number="Q11" prompt={Q11_PROMPT} answer={answers.q11} />
        )}

      {step === "q12" && (
        <QuestionFrame number="Q12" prompt={Q12_PROMPT}>
          <MultiSelect
            options={Q12_OPTIONS}
            ariaLabel="Learning preferences"
            initial={answers.q12 ?? []}
            onSubmit={(values) => {
              onUpdate({ q12: values });
              setStep("q13");
            }}
          />
        </QuestionFrame>
      )}
      {(step === "q13" || step === "q14" || step === "done") &&
        answers.q12 &&
        answers.q12.length > 0 && (
          <AnswerEcho
            number="Q12"
            prompt={Q12_PROMPT}
            answer={answers.q12.map((v) => labelFor(v, Q12_OPTIONS)).join(", ")}
          />
        )}

      {step === "q13" && (
        <QuestionFrame number="Q13" prompt={Q13_PROMPT}>
          <SingleSelect
            options={Q13_OPTIONS}
            ariaLabel="Admin access on work laptop"
            initial={answers.q13}
            onSubmit={(v) => {
              onUpdate({ q13: v });
              setStep("q14");
            }}
          />
        </QuestionFrame>
      )}
      {(step === "q14" || step === "done") && answers.q13 && (
        <AnswerEcho
          number="Q13"
          prompt={Q13_PROMPT}
          answer={labelFor(answers.q13, Q13_OPTIONS)}
        />
      )}

      {step === "q14" && (
        <QuestionFrame number="Q14" prompt={Q14_PROMPT}>
          <TextInput
            ariaLabel="Tool wish list"
            multiline
            optional
            placeholder="1–2 sentences"
            initial={answers.q14 ?? ""}
            onSubmit={(v) => {
              onUpdate({ q14: v || undefined });
              setStep("done");
              setTimeout(onComplete, 200);
            }}
          />
        </QuestionFrame>
      )}
      {step === "done" && (
        <AnswerEcho number="Q14" prompt={Q14_PROMPT} answer={answers.q14 || "(skipped)"} />
      )}
    </div>
  );
}
