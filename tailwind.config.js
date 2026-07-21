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
          950: '#05070F',
          900: '#0A0F1F',
          800: '#111A33',
          700: '#1B2747',
        },
        amber: {
          400: '#FFD466',
          500: '#F5B400',
        },
        teal: {
          400: '#4FC3F7',
          500: '#0EA5E9',
        },
      },
      backgroundImage: {
        'grid-lines': 'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
        'joy-gradient': 'radial-gradient(circle at 15% 20%, rgba(14,165,233,0.20), transparent 40%), radial-gradient(circle at 85% 75%, rgba(245,180,0,0.16), transparent 40%), radial-gradient(circle at 50% 50%, rgba(79,195,247,0.10), transparent 55%)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      boxShadow: {
        glow: '0 0 40px rgba(14,165,233,0.35)',
        glass: '0 8px 32px rgba(0,0,0,0.4)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-18px) rotate(8deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-14px) translateX(10px)' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.35 },
          '50%': { opacity: 0.8 },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 9s ease-in-out infinite',
        'spin-slow': 'spinSlow 22s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
