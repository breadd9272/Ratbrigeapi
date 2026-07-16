import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        bg: {
          base: "#0a0a0f",
          card: "#12121a",
          hover: "#1a1a24",
        },
        accent: {
          cyan: "#00f0ff",
          purple: "#a855f7",
          green: "#22c55e",
          red: "#ef4444",
          amber: "#f59e0b",
        },
        border: "#2a2a3a",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 240, 255, 0.15)",
        "glow-purple": "0 0 20px rgba(168, 85, 247, 0.15)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(34,197,94,0.6)" },
          "50%": { opacity: "0.6", boxShadow: "0 0 0 6px rgba(34,197,94,0)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.8s infinite",
        fadeIn: "fadeIn 0.25s ease-out",
        scan: "scan 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
