"use client";

import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { QuestionFrame } from "./QuestionFrame";
import { AnswerEcho } from "./AnswerEcho";
import { SingleSelect } from "../inputs/SingleSelect";
import { MultiSelect } from "../inputs/MultiSelect";
import {
  Q15_OPTIONS,
  Q16_OPTIONS,
  type SurveyAnswers,
} from "@/lib/survey-schema";

interface Section5Props {
  answers: SurveyAnswers;
  onUpdate: (patch: Partial<SurveyAnswers>) => void;
  onComplete: () => void;
}

const SECTION_5_LOADING = ["negotiating cadence handshake", "tuning meeting protocol"];

const Q15_PROMPT = "how often would you want to meet as an XE group?";
const Q16_PROMPT =
  "what kinds of group meetings would you find most valuable? (multi-select)";

type Step = "header" | "q15" | "q16" | "done";

function labelFor(value: string | undefined, opts: { value: string; label: string }[]) {
  return opts.find((o) => o.value === value)?.label ?? value ?? "";
}

export function Section5Sync({ answers, onUpdate, onComplete }: Section5Props) {
  const [step, setStep] = useState<Step>("header");

  return (
    <div>
      <SectionHeader
        command="sync"
        flag="cadence"
        title="Section 5 — How We Meet & Connect"
        loadingLines={SECTION_5_LOADING}
        onReady={() => setStep("q15")}
      />

      {step === "q15" && (
        <QuestionFrame number="Q15" prompt={Q15_PROMPT}>
          <SingleSelect
            options={Q15_OPTIONS}
            ariaLabel="Group meeting cadence"
            initial={answers.q15}
            onSubmit={(v) => {
              onUpdate({ q15: v });
              setStep("q16");
            }}
          />
        </QuestionFrame>
      )}
      {(step === "q16" || step === "done") && answers.q15 && (
        <AnswerEcho
          number="Q15"
          prompt={Q15_PROMPT}
          answer={labelFor(answers.q15, Q15_OPTIONS)}
        />
      )}

      {step === "q16" && (
        <QuestionFrame number="Q16" prompt={Q16_PROMPT}>
          <MultiSelect
            options={Q16_OPTIONS}
            ariaLabel="Valuable meeting types"
            initial={answers.q16 ?? []}
            onSubmit={(values, otherText) => {
              onUpdate({ q16: values, q16_other: otherText });
              setStep("done");
              setTimeout(onComplete, 200);
            }}
          />
        </QuestionFrame>
      )}
      {step === "done" && answers.q16 && answers.q16.length > 0 && (
        <AnswerEcho
          number="Q16"
          prompt={Q16_PROMPT}
          answer={answers.q16
            .map((v) =>
              v === "other"
                ? `Other — ${answers.q16_other ?? ""}`
                : labelFor(v, Q16_OPTIONS)
            )
            .join(", ")}
        />
      )}
    </div>
  );
}
