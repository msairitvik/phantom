/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        phantom: {
          bg: "#070511",
          dark: "#0C071E",
          violet: "#170B2B",
          card: "rgba(23, 11, 43, 0.65)",
          purple: "#A855F7",
          purpleGlow: "#9333EA",
          green: "#39FF88",
          cyan: "#00E5FF",
          pink: "#FF3CAC",
          crimson: "#FF365E",
          amber: "#FFBF69",
          lavender: "#E9E3FF",
          muted: "#948FB3",
          border: "rgba(168, 85, 247, 0.25)"
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-purple': '0 0 25px rgba(168, 85, 247, 0.35)',
        'glow-green': '0 0 25px rgba(57, 255, 136, 0.35)',
        'glow-cyan': '0 0 25px rgba(0, 229, 255, 0.35)',
        'glow-pink': '0 0 25px rgba(255, 60, 172, 0.35)',
        'glow-crimson': '0 0 25px rgba(255, 54, 94, 0.35)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spectral-drift': 'drift 12s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        drift: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(20px, -20px) scale(1.08)' },
          '100%': { transform: 'translate(-15px, 15px) scale(0.95)' },
        }
      }
    },
  },
  plugins: [],
}
