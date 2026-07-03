import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0c0c12",
          raised: "#13131c",
          overlay: "#1a1a26",
          border: "#2a2a3a",
        },
        accent: {
          green: "#22c55e",
          "green-dim": "#166534",
          red: "#ef4444",
          "red-dim": "#7f1d1d",
          purple: "#a78bfa",
          cyan: "#22d3ee",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(167, 139, 250, 0.25)",
        card: "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
