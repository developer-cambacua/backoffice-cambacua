import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layout/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        openSans: ["var(--font-openSans)"],
        geistSans: ['var(--font-geist-sans)'],
        geistMono: ['var(--font-geist-mono)'],
      },
      fontSize: {
        "3xl": "32px",
      },
      colors: {
        primary: {
          "500": "#8F8E2A",
          "600": "#7A7924",
          "700": "#67671D",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          "50": "#E8EEF5",
          "100": "#D1D7EB",
          "200": "#A8BFD8",
          "300": "#7EA7C5",
          "400": "#558FB3",
          "500": "#2B77A0",
          "600": "#276992",
          "700": "#235A85",
          "800": "#1F4C78",
          "900": "#1A446E",
          "950": "#2C3E50",
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        terciary: {
          "100": "#EEEEE3",
          "200": "#F0F0C9",
        },
        rojo: {
          "500": "#c0392b",
        },
        amarillo: {
          "400": "#C0392B",
          "500": "#FFA500",
        },
        verde: {
          "500": "#C0392B",
        },
        grisulado: {
          "900": "#38485C",
        },
        bgInputs: {
          "100": "#f8fafc",
        },
        gris: {
          "50": "#f7f8f9",
          "100": "#F8FAFC",
          "200": "#F6F6F6",
          "300": "#E6EBF0",
          "400": "#CBD5E1",
          "500": "#94A3B8",
        },
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
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
        sidebar: {
          DEFAULT: "#8F8E2A",
          foreground: "#fafafa",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
