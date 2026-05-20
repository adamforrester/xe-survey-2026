import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XE Intake Terminal",
  description:
    "Experience Engineering team intake — boot up your XE workstation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href={`data:image/svg+xml;utf8,${encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0A0A0A"/><text x="16" y="22" font-family="JetBrains Mono,monospace" font-size="18" font-weight="700" fill="#FFB000" text-anchor="middle">XE</text></svg>'
          )}`}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
