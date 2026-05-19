// Easter eggs — recognized while user is between questions OR always-on as a
// low-priority listener. Returns response lines to print, plus optional side effects.

export type EasterEggEffect =
  | { type: "none" }
  | { type: "clear" }
  | { type: "screen"; on: boolean }
  | { type: "sound"; on: boolean };

export interface EasterEggResult {
  matched: boolean;
  lines: string[];
  effect: EasterEggEffect;
}

const HELP_LINES = [
  "available commands:",
  "  help              show this list",
  "  whoami            current user identity",
  "  clear             clear the screen and restart",
  "  screen on/off     toggle CRT effect",
  "  sound on/off      toggle audio",
  "  ls /xe            list capability surfaces",
  "  cat manifesto     print the XE manifesto",
  "  exit              attempt to leave (you can't)",
];

const NO_MATCH: EasterEggResult = {
  matched: false,
  lines: [],
  effect: { type: "none" },
};

export function runCommand(raw: string): EasterEggResult {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return NO_MATCH;

  if (cmd === "help" || cmd === "?") {
    return { matched: true, lines: HELP_LINES, effect: { type: "none" } };
  }
  if (cmd === "whoami") {
    return {
      matched: true,
      lines: [
        "user: operative",
        "role: experience engineer (in training)",
        "auth: vibes-based",
        "uptime: long enough to know better",
      ],
      effect: { type: "none" },
    };
  }
  if (cmd === "sudo make me a sandwich") {
    return {
      matched: true,
      lines: [
        "🥪 ok.",
        "(see https://xkcd.com/149)",
      ],
      effect: { type: "none" },
    };
  }
  if (cmd === "make me a sandwich") {
    return {
      matched: true,
      lines: ["What? Make it yourself."],
      effect: { type: "none" },
    };
  }
  if (cmd === "clear" || cmd === "cls") {
    return {
      matched: true,
      lines: [],
      effect: { type: "clear" },
    };
  }
  if (cmd === "screen off") {
    return { matched: true, lines: ["> CRT off"], effect: { type: "screen", on: false } };
  }
  if (cmd === "screen on") {
    return { matched: true, lines: ["> CRT on"], effect: { type: "screen", on: true } };
  }
  if (cmd === "sound off" || cmd === "mute") {
    return { matched: true, lines: ["> sound muted"], effect: { type: "sound", on: false } };
  }
  if (cmd === "sound on" || cmd === "unmute") {
    return { matched: true, lines: ["> sound enabled"], effect: { type: "sound", on: true } };
  }
  if (cmd === "ls /xe" || cmd === "ls") {
    return {
      matched: true,
      lines: [
        "prototypes/        agentic-interfaces/",
        "rfps-and-pitches/  narrative-systems/",
        "experience-os/     manifesto.txt",
      ],
      effect: { type: "none" },
    };
  }
  if (cmd === "cat manifesto" || cmd === "cat manifesto.txt") {
    return {
      matched: true,
      lines: [
        "we don't make decks. we make working systems.",
        "if it doesn't run, it isn't real.",
        "the prototype is the pitch.",
      ],
      effect: { type: "none" },
    };
  }
  if (cmd === "exit" || cmd === "quit" || cmd === ":q") {
    return {
      matched: true,
      lines: ["nice try."],
      effect: { type: "none" },
    };
  }
  if (cmd === "rm -rf /") {
    return {
      matched: true,
      lines: [
        "permission denied.",
        "(also: please don't.)",
      ],
      effect: { type: "none" },
    };
  }
  if (cmd === "vim" || cmd === "emacs") {
    return {
      matched: true,
      lines: ["take it outside."],
      effect: { type: "none" },
    };
  }

  return NO_MATCH;
}

export function isCommandLike(raw: string): boolean {
  // Heuristic: short string starting with a letter, no spaces or one space.
  // Used by the global listener to avoid intercepting normal text input.
  if (!raw) return false;
  if (raw.length > 32) return false;
  return /^[a-z][a-z0-9 \-/.:?]*$/.test(raw);
}
