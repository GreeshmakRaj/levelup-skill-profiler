/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d6ff',
          400: '#7e93fb',
          500: '#4f6ef7',
          600: '#3b55e6',
          700: '#2e44cc',
          900: '#1a2a7a',
        },
        // Semantic, theme-aware tokens (driven by CSS variables in index.css).
        surface: 'rgb(var(--bg) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        line: 'rgb(var(--border) / <alpha-value>)',
        ink: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(15 22 41 / 0.04)',
        card: '0 1px 3px 0 rgb(15 22 41 / 0.06), 0 1px 2px -1px rgb(15 22 41 / 0.04)',
        lift: '0 10px 30px -12px rgb(15 22 41 / 0.18)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: 0, transform: 'scale(.97)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        fadeIn: 'fadeIn .2s ease',
        scaleIn: 'scaleIn .15s ease',
      },
    },
  },
  plugins: [],
}
