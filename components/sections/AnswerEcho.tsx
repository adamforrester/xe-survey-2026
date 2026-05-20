"use client";

interface AnswerEchoProps {
  number: string;
  prompt: string;
  answer: string;
}

// Read-only display of a previously answered question. Sits in the scrollback.
export function AnswerEcho({ number, prompt, answer }: AnswerEchoProps) {
  return (
    <div className="space-y-1 mt-4">
      <div className="flex flex-wrap gap-x-2 text-phosphor-dim">
        <span>[{number}]</span>
        <span className="flex-1 min-w-0">{prompt}</span>
      </div>
      <div className="pl-9 text-phosphor">
        <span className="text-phosphor-ok">›</span>{" "}
        <span className="whitespace-pre-wrap">{answer}</span>
      </div>
    </div>
  );
}
