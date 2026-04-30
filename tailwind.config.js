/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        sidebar: {
          DEFAULT: "#0b1324",
          hover: "#131f36",
          active: "#1f2f4a",
          border: "#1b2742",
        },
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        sand: {
          50: "#fcfaf7",
          100: "#f6efe7",
          200: "#efe3d5",
          300: "#e7d2be",
          400: "#ddbea0",
          500: "#d0a77f",
          600: "#b98b60",
          700: "#946a46",
          800: "#6f4f36",
          900: "#513a28",
        },
      },
      animation: {
        "fade-in": "fade-in 0.14s ease-out",
        "slide-in": "slide-in 0.16s ease-out",
        "slide-up": "slide-up 0.18s ease-out",
        "spin-slow": "spin 3s linear infinite",
        "pulse-gentle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "auth-hero-in": "auth-hero-in 1.2s ease-out both",
        "auth-text-in": "auth-text-in 0.8s 0.3s ease-out both",
        "auth-form-in": "auth-form-in 0.6s 0.15s ease-out both",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "auth-hero-in": {
          from: { opacity: "0", transform: "scale(1.08)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "auth-text-in": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "auth-form-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15, 23, 42, 0.2)",
        card: "0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.08)",
        "card-hover": "0 12px 40px rgba(15, 23, 42, 0.16)",
        soft: "0 20px 60px rgba(15, 23, 42, 0.12)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
