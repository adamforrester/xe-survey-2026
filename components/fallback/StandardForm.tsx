"use client";

import { useState } from "react";
import {
  Q2_OPTIONS,
  Q3_OPTIONS,
  Q4_OPTIONS,
  Q2A_ROWS,
  Q2B_ROWS,
  Q6_OPTIONS,
  TOPIC_OPTIONS,
  Q12_OPTIONS,
  Q13_OPTIONS,
  Q15_OPTIONS,
  Q16_OPTIONS,
  Q10_MAX,
  RATING_SCALE_LEGEND,
  shouldShowQ7,
  shouldShowQ8,
  type SurveyAnswers,
  type Rating,
} from "@/lib/survey-schema";
import { submitSurvey } from "@/lib/submit";

interface StandardFormProps {
  initial: SurveyAnswers;
  onCancel: () => void;
}

// Plain accessible form. No terminal styling — this is the a11y escape hatch
// the brief calls for via Esc.
export function StandardForm({ initial, onCancel }: StandardFormProps) {
  const [answers, setAnswers] = useState<SurveyAnswers>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(p: Partial<SurveyAnswers>) {
    setAnswers((a) => ({ ...a, ...p }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await submitSurvey(answers);
    setSubmitting(false);
    if (res.ok) setSubmitted(true);
    else setError(res.error || "Submission failed");
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-phosphor">
        <h1 className="text-xl mb-2">Thanks — your responses are in.</h1>
        <p>You can close this tab.</p>
      </div>
    );
  }

  // Block implicit form submission: pressing Enter inside a single-line
  // <input> would otherwise submit the whole form before the user has
  // scrolled past the first few questions. Textareas keep their normal
  // Enter-for-newline behavior; the explicit Submit button still works.
  function blockImplicitSubmit(e: React.KeyboardEvent<HTMLFormElement>) {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      onKeyDown={blockImplicitSubmit}
      className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 text-phosphor"
    >
      <header className="flex items-center justify-between">
        <h1 className="text-xl">XE Intake — standard form</h1>
        <button
          type="button"
          onClick={onCancel}
          className="text-phosphor-dim underline"
        >
          back to terminal
        </button>
      </header>

      {/* Q1 */}
      <Field label="Name (optional)">
        <input
          type="text"
          value={answers.q1 ?? ""}
          onChange={(e) => patch({ q1: e.target.value })}
          className="bg-terminal-surface border border-phosphor-dim p-2 w-full"
        />
      </Field>

      {/* Q2 */}
      <RadioField
        label="Q2. Primary capability or skillset"
        name="q2"
        options={Q2_OPTIONS}
        value={answers.q2}
        onChange={(v) => patch({ q2: v })}
      />
      {answers.q2 === "other" && (
        <Field label="Other — please specify">
          <input
            type="text"
            value={answers.q2_other ?? ""}
            onChange={(e) => patch({ q2_other: e.target.value })}
            className="bg-terminal-surface border border-phosphor-dim p-2 w-full"
          />
        </Field>
      )}

      {/* Q3 */}
      <RadioField
        label="Q3. XE-style tenure"
        name="q3"
        options={Q3_OPTIONS}
        value={answers.q3}
        onChange={(v) => patch({ q3: v })}
      />

      {/* Q4 */}
      <CheckboxField
        label="Q4. XE focus areas (multi-select)"
        options={Q4_OPTIONS}
        values={answers.q4 ?? []}
        onChange={(vs) => patch({ q4: vs })}
      />

      {/* Q2A */}
      <RatingFields
        label="Section 2A — Tech stack proficiency"
        legend={RATING_SCALE_LEGEND}
        rows={Q2A_ROWS}
        values={answers.q2a ?? {}}
        onChange={(v) => patch({ q2a: v })}
      />

      {/* Q2B */}
      <RatingFields
        label="Section 2B — Foundational XE skills"
        legend={RATING_SCALE_LEGEND}
        rows={Q2B_ROWS}
        values={answers.q2b ?? {}}
        onChange={(v) => patch({ q2b: v })}
      />

      {/* Q5 */}
      <Field label="Q5. Most-used or favorite tools in the XE space (open-ended)">
        <textarea
          value={answers.q5 ?? ""}
          onChange={(e) => patch({ q5: e.target.value })}
          className="bg-terminal-surface border border-phosphor-dim p-2 w-full min-h-24"
        />
      </Field>

      {/* Q6 */}
      <RadioField
        label="Q6. Interested in leading a learning session in the next 6–12 months?"
        name="q6"
        options={Q6_OPTIONS}
        value={answers.q6}
        onChange={(v) => patch({ q6: v })}
      />

      {/* Q7 + Q8 conditional */}
      {shouldShowQ7(answers) && (
        <CheckboxField
          label="Q7. Topics you'd want to lead (multi-select)"
          options={TOPIC_OPTIONS}
          values={answers.q7 ?? []}
          onChange={(vs) => patch({ q7: vs })}
        />
      )}
      {shouldShowQ8(answers) && (
        <Field label="Q8. (Optional) Specific angle or framing">
          <textarea
            value={answers.q8 ?? ""}
            onChange={(e) => patch({ q8: e.target.value })}
            className="bg-terminal-surface border border-phosphor-dim p-2 w-full min-h-20"
          />
        </Field>
      )}

      {/* Q9 */}
      <Field label="Q9. (Optional) Niche skill or experience the group should know about">
        <textarea
          value={answers.q9 ?? ""}
          onChange={(e) => patch({ q9: e.target.value })}
          className="bg-terminal-surface border border-phosphor-dim p-2 w-full min-h-20"
        />
      </Field>

      {/* Q10 */}
      <CheckboxField
        label={`Q10. Top things you most want to learn (max ${Q10_MAX})`}
        options={TOPIC_OPTIONS}
        values={answers.q10 ?? []}
        max={Q10_MAX}
        onChange={(vs) => patch({ q10: vs })}
      />

      {/* Q11 */}
      <Field label="Q11. What gap is currently blocking your best work?">
        <textarea
          value={answers.q11 ?? ""}
          onChange={(e) => patch({ q11: e.target.value })}
          className="bg-terminal-surface border border-phosphor-dim p-2 w-full min-h-20"
        />
      </Field>

      {/* Q12 */}
      <CheckboxField
        label="Q12. How do you learn best?"
        options={Q12_OPTIONS}
        values={answers.q12 ?? []}
        onChange={(vs) => patch({ q12: vs })}
      />

      {/* Q13 */}
      <RadioField
        label="Q13. Admin access on your work laptop?"
        name="q13"
        options={Q13_OPTIONS}
        value={answers.q13}
        onChange={(v) => patch({ q13: v })}
      />

      {/* Q14 */}
      <Field label="Q14. If you could have access to any tool, what would it be?">
        <textarea
          value={answers.q14 ?? ""}
          onChange={(e) => patch({ q14: e.target.value })}
          className="bg-terminal-surface border border-phosphor-dim p-2 w-full min-h-20"
        />
      </Field>

      {/* Q15 */}
      <RadioField
        label="Q15. How often should we meet as an XE group?"
        name="q15"
        options={Q15_OPTIONS}
        value={answers.q15}
        onChange={(v) => patch({ q15: v })}
      />

      {/* Q16 */}
      <CheckboxField
        label="Q16. What kinds of group meetings would you find most valuable?"
        options={Q16_OPTIONS}
        values={answers.q16 ?? []}
        onChange={(vs) => patch({ q16: vs })}
      />

      {/* Q17 */}
      <Field label="Q17. What should XE be known for in 12 months?">
        <textarea
          value={answers.q17 ?? ""}
          onChange={(e) => patch({ q17: e.target.value })}
          className="bg-terminal-surface border border-phosphor-dim p-2 w-full min-h-20"
        />
      </Field>

      {/* Q18 */}
      <Field label="Q18. (Optional) Anything else you want us to know?">
        <textarea
          value={answers.q18 ?? ""}
          onChange={(e) => patch({ q18: e.target.value })}
          className="bg-terminal-surface border border-phosphor-dim p-2 w-full min-h-20"
        />
      </Field>

      {error && <div className="text-phosphor-error">Error: {error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-phosphor text-terminal-bg font-bold px-4 py-2 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-phosphor-dim block">{label}</span>
      {children}
    </label>
  );
}

function RadioField({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="space-y-1">
      <legend className="text-phosphor-dim">{label}</legend>
      {options.map((o) => (
        <label key={o.value} className="flex items-start gap-2">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

function CheckboxField({
  label,
  options,
  values,
  onChange,
  max,
}: {
  label: string;
  options: { value: string; label: string; description?: string }[];
  values: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  return (
    <fieldset className="space-y-1">
      <legend className="text-phosphor-dim">{label}</legend>
      {options.map((o) => {
        const checked = values.includes(o.value);
        return (
          <label key={o.value} className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => {
                if (checked) {
                  onChange(values.filter((v) => v !== o.value));
                } else {
                  if (max !== undefined && values.length >= max) return;
                  onChange([...values, o.value]);
                }
              }}
            />
            <span>
              {o.label}
              {o.description && (
                <span className="text-phosphor-dim"> — {o.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

function RatingFields({
  label,
  legend,
  rows,
  values,
  onChange,
}: {
  label: string;
  legend: string;
  rows: { id: string; label: string }[];
  values: Record<string, Rating | undefined>;
  onChange: (v: Record<string, Rating>) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-phosphor-dim">{label}</legend>
      <div className="text-phosphor-dim text-xs">{legend}</div>
      {rows.map((row) => (
        <div key={row.id} className="flex flex-wrap items-center gap-2">
          <span className="flex-1 min-w-[200px]">{row.label}</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="flex items-center gap-1">
              <input
                type="radio"
                name={`rating-${row.id}`}
                checked={values[row.id] === n}
                onChange={() => {
                  onChange({ ...(values as Record<string, Rating>), [row.id]: n as Rating });
                }}
              />
              <span>{n}</span>
            </label>
          ))}
        </div>
      ))}
    </fieldset>
  );
}
