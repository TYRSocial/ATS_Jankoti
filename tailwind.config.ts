import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080D1A",
        jankoti: {
          navy: "#0A2540",
          deep: "#001A3D",
          orange: "#E67E22",
          amber: "#F39C12",
          purple: "#7C3AED",
          cyan: "#0EA5E9",
        },
        surface: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          800: "#111827",
          900: "#0F172A",
          950: "#090D16",
        },
        primary: {
          50: "#EEF2FF",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
        },
        accent: {
          purple: "#8B5CF6",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#EF4444",
          sky: "#0EA5E9",
          orange: "#E67E22",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
