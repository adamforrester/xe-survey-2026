// One-off sanity check: build a payload from a sample SurveyAnswers and POST
// it to the live endpoint. Confirms key shape lands correctly in the sheet.
//
// Run: node scripts/test-payload.mjs

const URL =
  "https://script.google.com/macros/s/AKfycbwBR1zohGdJCKcfoeJxbbkJMQ7q2EbXVgP7tm80NMOUqBcxnR0z1hF0yBGYZKhzOhze/exec";

const payload = {
  name: "[test row — payload sanity check]",
  primaryCapability: "UI",
  experienceLength: "Less than 6 months",
  focusAreas: ["Interactive Prototypes & Experiences"],

  techStack: {
    aiCodeBuilding: 3,
    promptEngineering: 3,
    mcps: 3,
    wppOpen: 3,
    imageVideoGen: 3,
    webDev: 3,
    threeD: 3,
    figmaDesignSystems: 3,
    aemCms: 3,
    rapidPrototyping: 3,
    deployment: 3,
    git: 3,
    motionAnimation: 4,
  },

  foundationalSkills: {
    systemsThinking: 4,
    rapidPrototyping: 4,
    aiWorkflowDesign: 4,
    designToCode: 3,
    clientPitching: 3,
  },

  topTools: "",
  sessionInterest: "Not at this time",
  topicsToLead: [],
  leadingAngle: "",
  nicheSkill: "",
  topicsToLearn: [
    "AI-assisted code building (Claude Code, Cursor, Claude API, agents)",
    "Prompt engineering",
  ],
  blockingGap: "test answer for E2E verification",
  learnStyles: ["1:1 pairing with a more senior person"],
  adminAccess: "Yes — full admin access",
  toolWishlist: "",
  meetingFrequency: "Bi-weekly",
  meetingFormats: [
    "Internal training / learning sessions",
    "Casual hangout (coffee, drinks, etc.)",
  ],
  groupVision: "validating XE delivers real working systems within 6 months",
  anythingElse: "",
};

const res = await fetch(URL, {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body: JSON.stringify(payload),
});
console.log("HTTP", res.status);
const txt = await res.text();
console.log("body:", txt);
