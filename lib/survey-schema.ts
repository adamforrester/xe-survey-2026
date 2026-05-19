// Survey schema — the typed source of truth for question text, ordering,
// branching, and constraints. Mirror docs/xe-team-survey-draft.md exactly.

export type QuestionId =
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q2a"
  | "q2b"
  | "q5"
  | "q6"
  | "q7"
  | "q8"
  | "q9"
  | "q10"
  | "q11"
  | "q12"
  | "q13"
  | "q14"
  | "q15"
  | "q16"
  | "q17"
  | "q18";

export type SectionId = "1" | "2" | "3" | "4" | "5" | "6";

export interface SectionMeta {
  id: SectionId;
  command: string;
  title: string;
  preamble?: string;
}

export const SECTIONS: SectionMeta[] = [
  { id: "1", command: "identify --user", title: "About You" },
  { id: "2", command: "calibrate --stack", title: "Current Skills" },
  { id: "3", command: "scan --teach", title: "Leading Learning Sessions" },
  { id: "4", command: "map --learning", title: "Learning, Growth & Access" },
  { id: "5", command: "sync --cadence", title: "How We Meet & Connect" },
  { id: "6", command: "align --vision", title: "Looking Forward" },
];

export interface Option {
  value: string;
  label: string;
  description?: string;
}

export const Q2_OPTIONS: Option[] = [
  { value: "ui", label: "UI" },
  { value: "ux", label: "UX" },
  { value: "ux-ui", label: "Hybrid: UX / UI" },
  { value: "design-dev", label: "Hybrid: design + dev" },
  { value: "copy", label: "Copy" },
  { value: "development", label: "Development" },
  { value: "strategy", label: "Strategy / product / planning" },
  { value: "other", label: "Other" },
];

export const Q3_OPTIONS: Option[] = [
  { value: "<6m", label: "Less than 6 months" },
  { value: "6-12m", label: "6–12 months" },
  { value: "1-2y", label: "1–2 years" },
  { value: "2y+", label: "2+ years" },
];

export const Q4_OPTIONS: Option[] = [
  {
    value: "prototypes",
    label: "Interactive Prototypes & Experiences",
    description: "functional, interactive demos that clients can actually use",
  },
  {
    value: "agentic",
    label: "Agentic Interfaces & AI-Powered Systems",
    description: "products built with LLMs, function calling, real-time orchestration",
  },
  {
    value: "rfps",
    label: "Interactive RFPs & Pitches",
    description: "pitches that are working prototypes, not presentations",
  },
  {
    value: "narrative",
    label: "Narrative Systems & Story-Driven Platforms",
    description: "story-driven, dynamic, personalized content platforms",
  },
  {
    value: "experience-os",
    label: "Experience OS Platforms & IP Systems",
    description: "reusable platforms designed to power multiple experiences",
  },
  { value: "tbd", label: "Still figuring this out" },
];

export const RATING_SCALE_LEGEND =
  "1 Never used · 2 Tried it · 3 Comfortable on guided work · 4 Confident leading · 5 Could teach it";

export const Q2A_ROWS: { id: string; label: string }[] = [
  { id: "ai-code", label: "AI-assisted code building (Claude Code, Cursor, building with Claude API, agents)" },
  { id: "prompt", label: "Prompt engineering" },
  { id: "mcps", label: "MCPs (Model Context Protocol)" },
  { id: "wpp-open", label: "WPP Open" },
  { id: "media-gen", label: "Image & video asset generation (Midjourney, Sora, Runway, etc.)" },
  { id: "web-stack", label: "Web development stack (Next.js, React, TypeScript, Tailwind)" },
  { id: "3d", label: "3D & Immersive (Three.js, Blender, Spline, WebGL)" },
  { id: "figma-ds", label: "Figma / design systems" },
  { id: "aem-cms", label: "AEM / CMS component architecture" },
  { id: "rapid-proto", label: "Rapid prototyping tools (Framer, Lovable, Replit, v0, Figma Make, etc.)" },
  { id: "deploy", label: "Deployment platforms (Vercel, Netlify)" },
  { id: "git", label: "Git (GitHub, GitLab)" },
  { id: "motion", label: "Motion & animation (Rive, Motion.dev, After Effects)" },
];

export const Q2B_ROWS: { id: string; label: string }[] = [
  { id: "systems", label: "Systems thinking — seeing how parts fit together" },
  { id: "rapid", label: "Rapid prototyping — building fast and iterating" },
  { id: "ai-workflow", label: "AI-augmented workflow design — knowing when and how to deploy AI in your work" },
  { id: "design-to-code", label: "Translating design intent into working code" },
  { id: "pitching", label: "Pitching / demoing prototypes live to clients" },
];

export const Q6_OPTIONS: Option[] = [
  { value: "yes-levelup", label: "Yes — a live Level Up session for the broader XD (or wider VML) audience" },
  { value: "yes-deepdive", label: "Yes — a live technical deep-dive for the XE group only" },
  { value: "yes-recorded", label: "Yes — record an internal training (not live)" },
  { value: "yes-multi", label: "Yes — open to multiple formats" },
  { value: "maybe", label: "Maybe — depends on the topic and timing" },
  { value: "no", label: "Not at this time" },
];

// Q7 + Q10 share most of the topic list.
export const TOPIC_OPTIONS: Option[] = [
  { value: "ai-code", label: "AI-assisted code building (Claude Code, Cursor, Claude API, agents)" },
  { value: "prompt", label: "Prompt engineering" },
  { value: "mcps", label: "MCPs (Model Context Protocol)" },
  { value: "wpp-open", label: "WPP Open" },
  { value: "media-gen", label: "Image & video asset generation (Midjourney, Sora, etc.)" },
  { value: "adaptive-ui", label: "Adaptive UI / intelligent interfaces (intelligent search, AI-personalized UIs)" },
  { value: "design-systems", label: "Design systems (Figma libraries, tokens, governance)" },
  { value: "aem-cms", label: "AEM / CMS component architecture" },
  { value: "3d", label: "3D & Immersive (Three.js, Blender, Spline, WebGL)" },
  { value: "rapid-proto", label: "Rapid prototyping tools (Lovable, Replit, v0, Figma Make, etc.)" },
  { value: "dev-handoff", label: "Dev handoff workflows" },
  { value: "pitching", label: "Pitching to clients with working prototypes" },
  { value: "design-to-code", label: "Translating design → code" },
  { value: "systems-arch", label: "Systems / architecture thinking" },
  { value: "other", label: "Something else" },
];

export const Q12_OPTIONS: Option[] = [
  { value: "1on1", label: "1:1 pairing with a more senior person" },
  { value: "cohort", label: "Cohort course / structured class" },
  { value: "self-paced", label: "Self-paced with hands-on exercises" },
  { value: "lunch-learn", label: "Internal lunch & learns" },
  { value: "hackathon", label: "Hackathons / build sprints" },
  { value: "conference", label: "Conferences / external training" },
  { value: "docs", label: "Reading docs / watching videos" },
];

export const Q13_OPTIONS: Option[] = [
  { value: "full", label: "Yes — full admin access" },
  { value: "partial", label: "Partial — admin for some things but not others" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

export const Q15_OPTIONS: Option[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "ad-hoc", label: "Ad hoc / when there's a reason" },
  { value: "less", label: "Less often than that is fine" },
];

export const Q16_OPTIONS: Option[] = [
  { value: "training", label: "Internal training / learning sessions" },
  { value: "casual", label: "Casual hangout (coffee, drinks, etc.)" },
  { value: "show-tell", label: "Project show-and-tell — what we're working on" },
  { value: "problem-solve", label: "Problem-solving / collaborative working sessions" },
  { value: "tools-tips", label: "Tools & tips share-out" },
  { value: "external", label: "External speakers / industry topics" },
  { value: "qa-leads", label: "Open Q&A with capability leads" },
  { value: "other", label: "Other" },
];

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface SurveyAnswers {
  q1?: string;
  q2?: string;
  q2_other?: string;
  q3?: string;
  q4?: string[];
  q2a?: Record<string, Rating | undefined>;
  q2b?: Record<string, Rating | undefined>;
  q5?: string;
  q6?: string;
  q7?: string[];
  q7_other?: string;
  q8?: string;
  q9?: string;
  q10?: string[];
  q10_other?: string;
  q11?: string;
  q12?: string[];
  q13?: string;
  q14?: string;
  q15?: string;
  q16?: string[];
  q16_other?: string;
  q17?: string;
  q18?: string;
}

export const Q10_MAX = 3;

export function shouldShowQ7(answers: SurveyAnswers): boolean {
  return !!answers.q6 && answers.q6 !== "no";
}

export function shouldShowQ8(answers: SurveyAnswers): boolean {
  return shouldShowQ7(answers);
}
