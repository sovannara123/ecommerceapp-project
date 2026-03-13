import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e7ff",
          500: "#1f5eff",
          700: "#1747c4"
        }
      },
      boxShadow: {
        card: "0 12px 30px -16px rgba(9, 25, 71, 0.3)"
      }
    }
  },
  plugins: []
};

export default config;
