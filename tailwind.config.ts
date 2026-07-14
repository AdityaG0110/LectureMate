import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { 50: "#eef2ff", 100: "#e0e7ff", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca" } },
      boxShadow: { glow: "0 16px 50px rgba(79, 70, 229, .18)" },
      animation: { float: "float 5s ease-in-out infinite" },
      keyframes: { float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } } }
    },
  },
  plugins: [],
};

export default config;
