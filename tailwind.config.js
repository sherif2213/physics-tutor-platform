/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-tajawal)', 'Tajawal', 'sans-serif'],
        body: ['var(--font-cairo)', 'Cairo', 'sans-serif'],
      },
      colors: {
        white: 'rgb(var(--overlay-rgb) / <alpha-value>)',
        navy: {
          950: 'rgb(var(--navy-950) / <alpha-value>)',
          900: 'rgb(var(--navy-900) / <alpha-value>)',
          800: 'rgb(var(--navy-800) / <alpha-value>)',
          700: 'rgb(var(--navy-700) / <alpha-value>)',
        },
        slate: {
          100: 'rgb(var(--text-100) / <alpha-value>)',
          200: 'rgb(var(--text-200) / <alpha-value>)',
          300: 'rgb(var(--text-300) / <alpha-value>)',
          400: 'rgb(var(--text-400) / <alpha-value>)',
          500: 'rgb(var(--text-500) / <alpha-value>)',
          600: 'rgb(var(--text-600) / <alpha-value>)',
        },
        amber: {
          400: '#F5B942',
          500: '#F0A500',
        },
        teal: {
          400: '#2DD4BF',
          500: '#14B8A6',
        },
      },
      backgroundImage: {
        'grid-lines': 'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      boxShadow: {
        glow: '0 0 40px rgba(240,165,0,0.15)',
        glass: '0 8px 32px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};
