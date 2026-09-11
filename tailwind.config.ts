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
        background: "#f6f7fb",
        jankoti: {
          purple: "#6d28d9",
          deepPurple: "#5b21b6",
          fuchsia: "#d946ef",
          amber: "#f59e0b",
          navy: "#111827",
          bg0: "#f6f7fb",
          bg1: "#eef1f8",
          surface2: "#f4f2ff",
        },
        surface: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      boxShadow: {
        glow: "0 18px 40px rgba(17, 24, 39, 0.08)",
        "purple-glow": "0 12px 35px rgba(109, 40, 217, 0.18)",
        card: "0 16px 30px rgba(17, 24, 39, 0.06)",
        "card-hover": "0 20px 40px rgba(109, 40, 217, 0.14)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
