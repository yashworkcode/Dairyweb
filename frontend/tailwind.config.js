/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FBFAF5",
          50: "#FFFFFF",
          100: "#FBFAF5",
          200: "#F3F0E6",
        },
        /* Dark-mode palette — deep coffee/charcoal with warm gold accents */
        noir: {
          50: "#EFE9E1",
          100: "#E4DCD0",
          400: "#5C4F3F",
          700: "#2A2118",
          800: "#1F1810",
          850: "#1A140D",
          900: "#170F09",
          950: "#120B06",
        },
        gold: {
          100: "#F6E8C6",
          200: "#EDD9A0",
          300: "#E2C078",
          400: "#D4A655",
          500: "#C4923C",
          600: "#A87830",
          700: "#8A6326",
        },
        pasture: {
          50: "#EAF6EE",
          100: "#CFEBD9",
          300: "#7FC79B",
          500: "#2F9461",
          600: "#247A4E",
          700: "#1B5E3C",
          900: "#123F28",
        },
        milk: {
          50: "#EAF3FB",
          100: "#CFE4F6",
          300: "#86BBE8",
          500: "#2E7FC9",
          600: "#2566A3",
          700: "#1B4E80",
        },
        butter: {
          300: "#F6D483",
          500: "#EFB73E",
          600: "#D69A1F",
        },
        ink: {
          DEFAULT: "#1C2521",
          700: "#33403A",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 24px -8px rgba(28, 37, 33, 0.12)",
        card: "0 2px 12px rgba(28, 37, 33, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        pour: {
          "0%": { transform: "scaleY(0)", opacity: "0" },
          "100%": { transform: "scaleY(1)", opacity: "1" },
        },
        floatUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(5px)" },
        },
      },
      animation: {
        pour: "pour 0.6s ease-out forwards",
        floatUp: "floatUp 0.5s ease-out forwards",
        bounceSlow: "bounceSlow 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
