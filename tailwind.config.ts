import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0D0D0D",
          secondary: "#141414",
          tertiary: "#1A1A1A",
          elevated: "#222222",
        },
        text: {
          primary: "#F5F0E8",
          secondary: "#A8A29E",
          muted: "#6B6B6B",
        },
        accent: {
          lime: "#C8FF00",
          limeDark: "#9ECC00",
          limeGlow: "rgba(200, 255, 0, 0.15)",
        },
        border: {
          DEFAULT: "#2A2A2A",
          hover: "#3A3A3A",
        },
      },
      fontFamily: {
        serif: ["Instrument Serif", "Georgia", "serif"],
        mono: ["DM Mono", "Menlo", "monospace"],
      },
      fontSize: {
        "display-xl": ["5.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-lg": ["4rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "display-md": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "heading-lg": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
        "heading-md": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body-md": ["0.9375rem", { lineHeight: "1.6" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.5" }],
        caption: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.05em" }],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
        34: "8.5rem",
      },
      borderRadius: {
        "2xs": "2px",
        xs: "4px",
        sm: "6px",
      },
      animation: {
        shimmer: "shimmer 2.5s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(200, 255, 0, 0.1)" },
          "100%": { boxShadow: "0 0 40px rgba(200, 255, 0, 0.25)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
