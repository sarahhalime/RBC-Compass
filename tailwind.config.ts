import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Same values as the CSS variables in globals.css. Hex here so opacity modifiers like /60 work.
        rbc: {
          blue: "#005DAA",
          navy: "#0A2A5E",
          ink: "#06142E",
          yellow: "#FFDF01",
          gold: "#C9A961",
          sky: "#4DA3FF",
          white: "#FFFFFF",
          mist: "#E8EEF7",
        },
        success: "#2ECC8F",
        warning: "#FFB020",
        danger: "#FF5C6C",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
        xl2: "20px",
        xl3: "28px",
      },
      boxShadow: {
        glow: "0 0 32px -6px rgba(255, 223, 1, 0.45)",
        "glow-blue": "0 0 40px -8px rgba(77, 163, 255, 0.55)",
        card: "0 24px 60px -24px rgba(0, 0, 0, 0.65)",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(4%, -3%, 0) scale(1.08)" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        shimmer: "shimmer 1.4s linear infinite",
        drift: "drift 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
