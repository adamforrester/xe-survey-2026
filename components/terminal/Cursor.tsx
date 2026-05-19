"use client";

interface CursorProps {
  inline?: boolean;
}

// 530ms blink, block style. Pure CSS so it doesn't compound with React renders.
export function Cursor({ inline = true }: CursorProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block w-[0.55em] h-[1.1em] bg-phosphor align-baseline animate-blink ${
        inline ? "ml-0.5" : ""
      }`}
      style={{ verticalAlign: "-0.18em" }}
    />
  );
}
