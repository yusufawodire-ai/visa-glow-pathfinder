import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        visa: {
          "background": "#0C0A04", // Darker, richer black background
          "dark-gray": "#1E2A44",
          "lilac": "#6A4E7F",
          "light-lilac": "#A78BFA",
          "burgundy": "#842A4A",
          "navy": "#092145",
          "gold": "#EBC250", // Gold color for buttons/highlights
          "blue": "#0066FF",
          "bright-blue": "#00C2FF",
          "light-brown": "#e2d1c3",
          "deep-brown": "#32281E", // Darker brown
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 10px 2px rgba(235, 194, 80, 0.4), 0 0 20px 4px rgba(235, 194, 80, 0.2)"
          },
          "50%": { 
            boxShadow: "0 0 15px 3px rgba(235, 194, 80, 0.6), 0 0 30px 6px rgba(235, 194, 80, 0.3)" 
          }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "shimmer": "shimmer 2s linear infinite"
      },
      backgroundImage: {
        "gradient-shimmer": "linear-gradient(90deg, transparent, rgba(0, 102, 255, 0.2), transparent)",
      },
      boxShadow: {
        'circle-glow': '0 0 20px 5px rgba(235, 194, 80, 0.3), 0 0 40px 10px rgba(235, 194, 80, 0.1)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
