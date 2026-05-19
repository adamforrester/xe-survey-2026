# XE Intake Terminal

A one-off prototype: the VML Experience Engineering team survey delivered as a terminal/hacker-style boot experience. Single-page Next.js app, batch-submits to a Google Apps Script web app.

Survey content lives at `docs/xe-team-survey-draft.md` — it is the source of truth for question text, ordering, branching, and constraints. Do not paraphrase; mirror exactly.

## Project rules

1. **Apps Script POST gotcha:** the submit fetch must use `Content-Type: text/plain;charset=utf-8`. JSON content type triggers a CORS preflight that Apps Script web apps don't answer. The body is still JSON-stringified — Apps Script parses it fine.
2. **No auto-deploy.** Build and run locally only. Do not push to Vercel without explicit instruction.
3. **No real LLM calls.** All "AI" personality is scripted. Zero API costs, zero latency.
4. **Batch submit only.** Do not persist partial responses. State lives in React.
5. **Submit failures must not lose answers.** On network error, show an in-terminal error and let the user retry.
6. **Sound preference persists** in `localStorage` (`xe.sound = on|off`). Default ON.
7. **CRT effect is toggleable** via a footer link. Default OFF if it harms readability; otherwise default ON. Persist in `localStorage` (`xe.crt`).
8. **Mobile responsive is required.** Effects that don't make sense on touch (multi-line keystroke logs, hover, keyboard-only shortcuts) degrade — they don't break.
9. **Accessibility:**
   - All interactive elements keyboard-navigable.
   - Screen-reader labels on every input even when visually styled as a prompt.
   - `Esc` opens a "Switch to standard form" fallback at any point.
10. **Color tokens:** `#FFB000` (amber phosphor) and `#0A0A0A` (terminal bg) are the only literals allowed in source — and only inside `tailwind.config.ts`. Everywhere else, use the Tailwind theme tokens (`text-phosphor`, `bg-terminal`, etc.).

## Survey structure (do not deviate)

- **Section 1 — Identification** — Q1 (optional name), Q2 capability single-select, Q3 tenure single-select, Q4 focus areas multi-select.
- **Section 2 — Skills calibration** — Section 2A (13 rows × 1–5), Section 2B (5 rows × 1–5), Q5 free-text.
- **Section 3 — Knowledge transfer** — Q6 single-select. Q7 multi-select and Q8 free-text **only if Q6 ≠ "Not at this time"**. Q9 free-text always.
- **Section 4 — Growth vectors** — Q10 multi-select **max 3**, Q11 free-text, Q12 multi-select, Q13 single-select, Q14 free-text.
- **Section 5 — Network sync** — Q15 single-select, Q16 multi-select.
- **Section 6 — Vision lock** — Q17 free-text, Q18 free-text optional.

## Tech stack

Next.js 14 App Router · TypeScript · Tailwind · Framer Motion · Howler.js. State is local React; no server components for the interactive flow.

## Easter eggs

`help` lists commands. `whoami` returns something playful. `sudo make me a sandwich` returns the xkcd reference. `clear` clears the screen and restarts. `screen on` / `screen off` toggle the CRT overlay. Surprise > completeness.
