
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
        // Custom colors based on the Sherrod Sports Visas branding
        custom: {
          "background": "#111111",
          "card": "#1A1A1A",
          "primary-accent": "#8B1E3F", // Burgundy from logo
          "secondary-accent": "#00274C", // Navy blue from logo
          "tertiary-accent": "#D4AF37", // Gold/yellow from logo
          "text-primary": "#F2F2F2",
          "text-secondary": "#B3B3B3",
          "border": "#2D2D2D",
          "warning": "#FFD580",
          "success": "#4AFFB2",
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
            boxShadow: "0 0 10px 2px rgba(139, 30, 63, 0.5), 0 0 20px 4px rgba(0, 39, 76, 0.3)"
          },
          "50%": { 
            boxShadow: "0 0 15px 3px rgba(139, 30, 63, 0.7), 0 0 30px 6px rgba(0, 39, 76, 0.5)" 
          }
        },
        "pulse-strong": {
          "0%, 100%": { 
            boxShadow: "0 0 15px 5px rgba(212, 175, 55, 0.7), 0 0 30px 8px rgba(158, 198, 184, 0.6)"
          },
          "50%": { 
            boxShadow: "0 0 25px 10px rgba(212, 175, 55, 0.9), 0 0 40px 15px rgba(158, 198, 184, 0.8)" 
          }
        },
        "home-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 10px 2px rgba(158, 198, 184, 0.5), 0 0 20px 4px rgba(125, 145, 166, 0.3)"
          },
          "50%": { 
            boxShadow: "0 0 15px 3px rgba(158, 198, 184, 0.7), 0 0 30px 6px rgba(125, 145, 166, 0.5)" 
          }
        },
        "shine": {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" }
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
        "pulse-strong": "pulse-strong 3s ease-in-out infinite",
        "home-pulse": "home-pulse 2s ease-in-out infinite",
        "shine": "shine 3s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "shimmer": "shimmer 2s linear infinite"
      },
      backgroundImage: {
        "gradient-shimmer": "linear-gradient(90deg, transparent, rgba(139, 30, 63, 0.2), transparent)",
        "gradient-score": "linear-gradient(90deg, #9EC6B8, #7D91A6)",
        "gradient-gold": "linear-gradient(90deg, #D4AF37, #FFC857)",
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

