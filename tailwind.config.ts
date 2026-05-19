import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#0A0A0A",
          surface: "#121212",
          border: "#2A1F00",
        },
        phosphor: {
          DEFAULT: "#FFB000",
          dim: "#A87400",
          dimmer: "#5C3F00",
          bright: "#FFD060",
          error: "#FF4040",
          ok: "#00FF88",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "IBM Plex Mono",
          "Berkeley Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      animation: {
        "blink": "blink 530ms steps(2, start) infinite",
        "scan": "scan 8s linear infinite",
        "flicker": "flicker 5s infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        flicker: {
          "0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%": { opacity: "1" },
          "20%, 21.999%, 63%, 63.999%, 65%, 69.999%": { opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
