import {
  Q2_OPTIONS,
  Q3_OPTIONS,
  Q4_OPTIONS,
  Q6_OPTIONS,
  Q12_OPTIONS,
  Q13_OPTIONS,
  Q15_OPTIONS,
  Q16_OPTIONS,
  TOPIC_OPTIONS,
  type Option,
  type Rating,
  type SurveyAnswers,
} from "./survey-schema";

// Apps Script POST gotcha: text/plain;charset=utf-8 to skip CORS preflight.
// The body is still JSON-stringified — Apps Script parses it fine.

export interface SubmitResult {
  ok: boolean;
  error?: string;
}

// Webhook payload shape — keys must match exactly. The sheet's header row maps
// directly to these keys; renames or new keys silently produce empty cells.
export interface SubmitPayload {
  name: string;
  primaryCapability: string;
  experienceLength: string;
  focusAreas: string[];

  techStack: {
    aiCodeBuilding: number | null;
    promptEngineering: number | null;
    mcps: number | null;
    wppOpen: number | null;
    imageVideoGen: number | null;
    webDev: number | null;
    threeD: number | null;
    figmaDesignSystems: number | null;
    aemCms: number | null;
    rapidPrototyping: number | null;
    deployment: number | null;
    git: number | null;
    motionAnimation: number | null;
  };

  foundationalSkills: {
    systemsThinking: number | null;
    rapidPrototyping: number | null;
    aiWorkflowDesign: number | null;
    designToCode: number | null;
    clientPitching: number | null;
  };

  topTools: string;
  sessionInterest: string;
  topicsToLead: string[];
  leadingAngle: string;
  nicheSkill: string;
  topicsToLearn: string[];
  blockingGap: string;
  learnStyles: string[];
  adminAccess: string;
  toolWishlist: string;
  meetingFrequency: string;
  meetingFormats: string[];
  groupVision: string;
  anythingElse: string;
}

function labelOf(value: string | undefined, opts: Option[]): string {
  if (!value) return "";
  return opts.find((o) => o.value === value)?.label ?? value;
}

// Multi-select with optional "other — text" inlining.
function multiLabels(
  values: string[] | undefined,
  opts: Option[],
  otherText?: string
): string[] {
  if (!values) return [];
  return values.map((v) => {
    if (v === "other") {
      return otherText ? `Other — ${otherText}` : "Other";
    }
    return labelOf(v, opts);
  });
}

function rating(r: Rating | undefined): number | null {
  return r ?? null;
}

export function toPayload(a: SurveyAnswers): SubmitPayload {
  // Q2 has its own "other" — fold it into the single string when selected.
  const primaryCapability =
    a.q2 === "other" && a.q2_other
      ? `Other — ${a.q2_other}`
      : labelOf(a.q2, Q2_OPTIONS);

  return {
    name: a.q1?.trim() ?? "",
    primaryCapability,
    experienceLength: labelOf(a.q3, Q3_OPTIONS),
    focusAreas: multiLabels(a.q4, Q4_OPTIONS),

    techStack: {
      aiCodeBuilding: rating(a.q2a?.["ai-code"]),
      promptEngineering: rating(a.q2a?.["prompt"]),
      mcps: rating(a.q2a?.["mcps"]),
      wppOpen: rating(a.q2a?.["wpp-open"]),
      imageVideoGen: rating(a.q2a?.["media-gen"]),
      webDev: rating(a.q2a?.["web-stack"]),
      threeD: rating(a.q2a?.["3d"]),
      figmaDesignSystems: rating(a.q2a?.["figma-ds"]),
      aemCms: rating(a.q2a?.["aem-cms"]),
      rapidPrototyping: rating(a.q2a?.["rapid-proto"]),
      deployment: rating(a.q2a?.["deploy"]),
      git: rating(a.q2a?.["git"]),
      motionAnimation: rating(a.q2a?.["motion"]),
    },

    foundationalSkills: {
      systemsThinking: rating(a.q2b?.["systems"]),
      rapidPrototyping: rating(a.q2b?.["rapid"]),
      aiWorkflowDesign: rating(a.q2b?.["ai-workflow"]),
      designToCode: rating(a.q2b?.["design-to-code"]),
      clientPitching: rating(a.q2b?.["pitching"]),
    },

    topTools: a.q5?.trim() ?? "",
    sessionInterest: labelOf(a.q6, Q6_OPTIONS),
    topicsToLead: multiLabels(a.q7, TOPIC_OPTIONS, a.q7_other),
    leadingAngle: a.q8?.trim() ?? "",
    nicheSkill: a.q9?.trim() ?? "",
    topicsToLearn: multiLabels(a.q10, TOPIC_OPTIONS, a.q10_other),
    blockingGap: a.q11?.trim() ?? "",
    learnStyles: multiLabels(a.q12, Q12_OPTIONS),
    adminAccess: labelOf(a.q13, Q13_OPTIONS),
    toolWishlist: a.q14?.trim() ?? "",
    meetingFrequency: labelOf(a.q15, Q15_OPTIONS),
    meetingFormats: multiLabels(a.q16, Q16_OPTIONS, a.q16_other),
    groupVision: a.q17?.trim() ?? "",
    anythingElse: a.q18?.trim() ?? "",
  };
}

export async function submitSurvey(answers: SurveyAnswers): Promise<SubmitResult> {
  const url = process.env.NEXT_PUBLIC_SUBMIT_URL;
  const payload = toPayload(answers);

  if (!url) {
    // No backend wired — simulate success and stash locally so dev isn't blocked.
    await new Promise((r) => setTimeout(r, 1200));
    if (typeof window !== "undefined") {
      try {
        const stash = window.localStorage.getItem("xe.lastSubmit");
        const list = stash ? JSON.parse(stash) : [];
        list.push({ ts: new Date().toISOString(), payload });
        window.localStorage.setItem("xe.lastSubmit", JSON.stringify(list));
      } catch {
        // ignore
      }
    }
    return { ok: true };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const result = await res.json().catch(() => null);
    if (!result || result.status !== "success") {
      return {
        ok: false,
        error: result?.message ?? "submission failed",
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "network error",
    };
  }
}
