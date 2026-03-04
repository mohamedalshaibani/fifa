import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Add custom breakpoints
    screens: {
      'xs': '400px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // BRIGHT BROADCAST THEME: Electric Blue + Neon Accents
        background: "#ffffff",
        foreground: "#050816",

        // Primary Brand: Electric Blue (Scoreboard)
        primary: {
          DEFAULT: "#005CFF",
          dark: "#0034B3",
          light: "#3385FF",
          foreground: "#ffffff",
        },

        // Secondary Brand: Vibrant Orange (Highlight)
        secondary: {
          DEFAULT: "#FF8A00",
          dark: "#E67600",
          light: "#FFB347",
          foreground: "#ffffff",
        },

        // Neon Accent: Live / On-Air
        accent: {
          DEFAULT: "#00E676", // neon green
          bg: "rgba(0, 230, 118, 0.08)",
          glow: "rgba(0, 230, 118, 0.3)",
        },

        // Additional highlight for chips/cards
        magenta: "#FF2E93",

        // Surfaces & Borders
        surface: "#ffffff",
        "surface-2": "#F3F6FF",
        border: "#E2E8F0",
        muted: "#94A3B8",

        // Status Colors
        success: "#00E676",
        warning: "#FFB020",
        danger: "#FF3B4E",
        info: "#3385FF",

        // Podium Colors
        gold: "#FFB020",
        silver: "#CBD5F5",
        bronze: "#F59E0B",

        // Legacy support for existing classes
        live: "#00E676",
        navy: "#050816",
      },
      fontFamily: {
        cairo: [
          "var(--font-cairo)", 
          "system-ui", 
          "-apple-system", 
          "BlinkMacSystemFont", 
          "Segoe UI", 
          "Roboto", 
          "Helvetica Neue", 
          "Arial", 
          "sans-serif"
        ],
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        glow: "var(--shadow-glow)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-in-up": "slideInUp 0.6s ease-out",
        "slide-in-down": "slideInDown 0.6s ease-out",
        "bounce-in": "bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "trophy-bounce": "trophyBounce 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(0, 230, 118, 0.3), inset 0 0 20px rgba(0, 230, 118, 0.1)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(0, 230, 118, 0.6), inset 0 0 30px rgba(0, 230, 118, 0.2)",
          },
        },
        trophyBounce: {
          "0%, 100%": { transform: "translateY(0) scale(1) rotate(0deg) translateZ(0)" },
          "25%": { transform: "translateY(-10px) scale(1.05) rotate(2deg) translateZ(0)" },
          "75%": { transform: "translateY(-5px) scale(1.02) rotate(-1deg) translateZ(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) translateZ(0)" },
          "50%": { transform: "translateY(-15px) translateZ(0)" },
        },
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
};
export default config;