import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.35" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "banner-fade": {
          "0%":   { opacity: "0", transform: "scale(1.03)" },
          "10%":  { opacity: "1", transform: "scale(1)" },
          "90%":  { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.98)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
      animation: {
        "fade-in":    "fade-in 0.4s ease-out both",
        "pulse-dot":  "pulse-dot 1.6s ease-in-out infinite",
        "slide-in":   "slide-in 0.3s ease-out both",
        "banner-fade":"banner-fade 6s ease-in-out infinite",
        shimmer:      "shimmer 2s linear infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "orange-glow":
          "radial-gradient(ellipse at center, rgba(249,115,22,0.18) 0%, transparent 70%)",
      },
      boxShadow: {
        "card":        "0 2px 8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        "card-hover":  "0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.3)",
        "orange-glow": "0 0 20px rgba(249,115,22,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
