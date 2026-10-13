import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#070d1c",
          900: "#0B1530",
          800: "#13244D",
          700: "#1c336b",
        },
        gold: {
          DEFAULT: "#D4A84B",
          soft: "#f0d48a",
        },
        teal: {
          DEFAULT: "#2EC4B6",
          deep: "#1a8f86",
        },
        ink: "#f4f7fb",
        muted: "#b7c3d9",
      },
      borderRadius: {
        card: "20px",
        xl2: "24px",
      },
      boxShadow: {
        glass: "0 20px 60px rgba(0,0,0,0.35)",
        glow: "0 0 40px rgba(212,168,75,0.18)",
        lift: "0 30px 80px rgba(5,10,24,0.45)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-tamil)", "sans-serif"],
        tamil: ["var(--font-tamil)", "var(--font-inter)", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      transitionDuration: {
        fast: "160ms",
        base: "280ms",
        slow: "560ms",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
