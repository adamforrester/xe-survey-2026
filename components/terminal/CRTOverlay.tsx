"use client";

interface CRTOverlayProps {
  on: boolean;
}

// Renders the scanlines + vignette + sweep when CRT mode is on.
// Sweep uses inline keyframe via Tailwind (animate-scan).
export function CRTOverlay({ on }: CRTOverlayProps) {
  if (!on) return null;
  return (
    <>
      <div className="crt-scanlines" aria-hidden="true" />
      <div className="crt-vignette" aria-hidden="true" />
      <div className="crt-sweep animate-scan" aria-hidden="true" />
    </>
  );
}
