/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Theme-aware surface tokens (driven by CSS variables, alpha-enabled)
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        card: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--surface-2) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",

        // MANIT institutional navy (primary brand)
        primary: {
          50: "#eef4fc",
          100: "#d7e6f7",
          200: "#b0ccee",
          300: "#7faede",
          400: "#4d86c8",
          500: "#2a66ae",
          600: "#1e4f92",
          700: "#1a3f74",
          800: "#17345d",
          900: "#152b4c",
          950: "#0c1a30",
          DEFAULT: "#1e4f92",
        },
        // Heritage crimson (accent / emphasis)
        accent: {
          50: "#fdf2f3",
          100: "#fbe0e2",
          200: "#f6c5c9",
          300: "#ee9ba2",
          400: "#e36b75",
          500: "#d2434f",
          600: "#bb2735",
          700: "#9d1d2a",
          800: "#831b26",
          900: "#6f1a24",
          950: "#3d0a0f",
          DEFAULT: "#bb2735",
        },
        // Heritage gold (crest detail / premium touches)
        gold: {
          50: "#fbf6e9",
          100: "#f5e9c4",
          200: "#ecd389",
          300: "#e0ba4f",
          400: "#d6a32b",
          500: "#bd8a1e",
          600: "#996b18",
          700: "#7a5217",
          800: "#664419",
          900: "#583a1a",
          950: "#331f0b",
          DEFAULT: "#bd8a1e",
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        info: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
        display: ["Sora", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderColor: { DEFAULT: "rgb(var(--border) / <alpha-value>)" },
      divideColor: { DEFAULT: "rgb(var(--border) / <alpha-value>)" },
      ringColor: { DEFAULT: "rgb(var(--ring) / <alpha-value>)" },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.15rem",
        "3xl": "1.6rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,41,.04), 0 4px 16px rgba(15,23,41,.06)",
        card: "0 1px 3px rgba(15,23,41,.05), 0 10px 28px -12px rgba(15,23,41,.18)",
        lift: "0 18px 40px -14px rgba(15,23,41,.28)",
        brutal: "6px 6px 0 0 var(--brutal)",
        "brutal-lg": "10px 10px 0 0 var(--brutal)",
        glow: "0 0 0 1px rgba(30,79,146,.10), 0 10px 34px -8px rgba(30,79,146,.40)",
        inner: "inset 0 1px 0 0 rgba(255,255,255,.06)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-up": "fade-up .55s cubic-bezier(.16,1,.3,1) both",
        "fade-in": "fade-in .4s ease both",
        "scale-in": "scale-in .2s cubic-bezier(.16,1,.3,1) both",
        shimmer: "shimmer 1.6s infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
