import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "475px",
      },
      boxShadow: { pop: "var(--shadow-pop)" },
      fontFamily: {
        sans: ["var(--font-sans)"],
        heading: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        // shadcn "accent" is the hover fill of menus; the brand accent is `primary`
        accent: {
          DEFAULT: "hsl(var(--accent-hsl))",
          foreground: "hsl(var(--accent-foreground))",
          ink: "var(--accent-ink)",
          soft: "var(--accent-soft)",
        },
        // design tokens by name (no opacity modifiers on these)
        ground: "var(--ground)",
        surface: { DEFAULT: "var(--surface)", sunk: "var(--surface-sunk)" },
        line: { DEFAULT: "var(--line)", strong: "var(--line-strong)" },
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          faint: "var(--ink-faint)",
        },
        solved: { DEFAULT: "var(--solved)", soft: "var(--solved-soft)" },
        failed: { DEFAULT: "var(--failed)", soft: "var(--failed-soft)" },
        pending: { DEFAULT: "var(--pending)", soft: "var(--pending-soft)" },
        inverse: { DEFAULT: "var(--inverse)", muted: "var(--inverse-muted)" },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
