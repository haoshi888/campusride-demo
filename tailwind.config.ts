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
        ink: "#15231f",
        canvas: "#f4f7f5",
        brand: {
          50: "#effaf5",
          100: "#dcf5e9",
          200: "#bbe9d4",
          300: "#8bd6b6",
          400: "#57bb94",
          500: "#339d78",
          600: "#247f61",
          700: "#1f664f",
          800: "#1d5241",
          900: "#1a4437"
        },
        coral: {
          500: "#f26b4f",
          600: "#dc5238"
        }
      },
      boxShadow: {
        card: "0 1px 2px rgba(21, 35, 31, 0.04), 0 12px 32px rgba(21, 35, 31, 0.06)",
        float: "0 20px 55px rgba(21, 35, 31, 0.18)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".55" }
        }
      },
      animation: {
        "fade-up": "fade-up .35s ease-out both",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite"
      }
    },
  },
  plugins: [],
};

export default config;
