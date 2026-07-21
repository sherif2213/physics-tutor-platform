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
        navy: {
          950: '#070B1A',
          900: '#0B1220',
          800: '#111A2E',
          700: '#182644',
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
