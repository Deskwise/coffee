/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"], // Body text
        display: ["Roboto Condensed", "sans-serif"], // Headlines
      },
      colors: {
        // PRIMARY: Red
        primary: {
          DEFAULT: "var(--col-primary)",
          dark: "var(--col-primary-dark)",
          light: "var(--col-primary-light)",
          glow: "rgba(214, 24, 31, 0.6)",
        },
        // COFFEE PALETTE
        espresso: {
          DEFAULT: "var(--col-espresso)",
          dark: "#1a0f0a", // Keeping static for deep shadows
          light: "var(--col-espresso-light)",
        },
        caramel: {
          DEFAULT: "var(--col-caramel)",
          dark: "var(--col-caramel-dark)",
          light: "#F59E0B",
        },
        burnt: {
          DEFAULT: "var(--col-burnt)",
          dark: "#C2410C",
          light: "#FB923C",
        },
        copper: {
          DEFAULT: "var(--col-copper)",
          dark: "#78350F",
          light: "#D97706",
        },
        forest: {
          DEFAULT: "#14532D",
          dark: "#052e16",
          light: "#166534",
        },
        // UI SEMANTICS
        background: "var(--bg-main)",
        surface: "var(--bg-surface)",
        surfaceHighlight: "var(--bg-surface-highlight)",
        text: "var(--text-main)",
        "text-secondary": "var(--text-muted)",
        "text-inverse": "var(--text-inverse)",

        accent: "var(--col-primary-light)",
        danger: "#B91C1C",
      },
      boxShadow: {
        glow: "0 0 20px rgba(214, 24, 31, 0.5)",
        card: "var(--shadow-card)",
      },
      backgroundImage: {
        carbon:
          "repeating-linear-gradient(45deg, #111 0, #111 2px, #000 2px, #000 4px)",
        "wood-grain":
          "repeating-linear-gradient(90deg, #3E2723 0px, #5D4037 2px, #3E2723 4px)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pop-in": "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
      },
      keyframes: {
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
};
