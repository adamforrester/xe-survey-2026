"use client";

import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { QuestionFrame } from "./QuestionFrame";
import { AnswerEcho } from "./AnswerEcho";
import { TextInput } from "../inputs/TextInput";
import { SingleSelect } from "../inputs/SingleSelect";
import { MultiSelect } from "../inputs/MultiSelect";
import {
  Q2_OPTIONS,
  Q3_OPTIONS,
  Q4_OPTIONS,
  type SurveyAnswers,
} from "@/lib/survey-schema";

interface Section1Props {
  answers: SurveyAnswers;
  onUpdate: (patch: Partial<SurveyAnswers>) => void;
  onComplete: () => void;
}

type Step = "header" | "q1" | "q2" | "q3" | "q4" | "done";

const SECTION_1_LOADING = ["loading identity profile", "preparing intake form"];

const Q1_PROMPT = "name? (leave blank to submit anonymously)";
const Q2_PROMPT = "what's your primary capability or skillset? (XE is in addition to this)";
const Q3_PROMPT =
  "how long have you been doing XE-style work — rapid prototyping, AI-enabled builds, design systems, interactive experiences, development, or similar?";
const Q4_PROMPT =
  "which of XE's five focus areas feel most like your strength(s)? (multi-select)";

function labelFor(value: string | undefined, opts: { value: string; label: string }[]) {
  return opts.find((o) => o.value === value)?.label ?? value ?? "";
}

export function Section1Identify({ answers, onUpdate, onComplete }: Section1Props) {
  const [step, setStep] = useState<Step>("header");

  return (
    <div>
      <SectionHeader
        command="identify"
        flag="user"
        title="Section 1 — About You"
        loadingLines={SECTION_1_LOADING}
        onReady={() => setStep("q1")}
      />

      {/* Q1 — name (optional) */}
      {step === "q1" && (
        <QuestionFrame number="Q1" prompt={Q1_PROMPT}>
          <TextInput
            ariaLabel="Name (optional)"
            optional
            placeholder="anonymous"
            initial={answers.q1 ?? ""}
            onSubmit={(v) => {
              onUpdate({ q1: v || undefined });
              setStep("q2");
            }}
          />
        </QuestionFrame>
      )}
      {(step === "q2" || step === "q3" || step === "q4" || step === "done") && (
        <AnswerEcho
          number="Q1"
          prompt={Q1_PROMPT}
          answer={answers.q1 || "(anonymous)"}
        />
      )}

      {/* Q2 — capability single-select */}
      {step === "q2" && (
        <QuestionFrame number="Q2" prompt={Q2_PROMPT}>
          <SingleSelect
            options={Q2_OPTIONS}
            ariaLabel="Primary capability"
            initial={answers.q2}
            onSubmit={(v, otherText) => {
              onUpdate({ q2: v, q2_other: otherText });
              setStep("q3");
            }}
          />
        </QuestionFrame>
      )}
      {(step === "q3" || step === "q4" || step === "done") && (
        <AnswerEcho
          number="Q2"
          prompt={Q2_PROMPT}
          answer={
            answers.q2 === "other"
              ? `Other — ${answers.q2_other ?? ""}`
              : labelFor(answers.q2, Q2_OPTIONS)
          }
        />
      )}

      {/* Q3 — tenure */}
      {step === "q3" && (
        <QuestionFrame number="Q3" prompt={Q3_PROMPT}>
          <SingleSelect
            options={Q3_OPTIONS}
            ariaLabel="XE tenure"
            initial={answers.q3}
            onSubmit={(v) => {
              onUpdate({ q3: v });
              setStep("q4");
            }}
          />
        </QuestionFrame>
      )}
      {(step === "q4" || step === "done") && (
        <AnswerEcho
          number="Q3"
          prompt={Q3_PROMPT}
          answer={labelFor(answers.q3, Q3_OPTIONS)}
        />
      )}

      {/* Q4 — focus areas */}
      {step === "q4" && (
        <QuestionFrame number="Q4" prompt={Q4_PROMPT}>
          <MultiSelect
            options={Q4_OPTIONS}
            ariaLabel="XE focus areas"
            initial={answers.q4 ?? []}
            onSubmit={(values) => {
              onUpdate({ q4: values });
              setStep("done");
              setTimeout(onComplete, 250);
            }}
          />
        </QuestionFrame>
      )}
      {step === "done" && answers.q4 && (
        <AnswerEcho
          number="Q4"
          prompt={Q4_PROMPT}
          answer={answers.q4
            .map((v) => labelFor(v, Q4_OPTIONS))
            .join(", ")}
        />
      )}
    </div>
  );
}
