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
          950: '#120B29',
          900: '#1B1240',
          800: '#261A5C',
          700: '#332278',
        },
        amber: {
          400: '#FFA24C',
          500: '#FF7A3D',
        },
        teal: {
          400: '#2FE6C9',
          500: '#00C9A7',
        },
      },
      backgroundImage: {
        'grid-lines': 'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
        'joy-gradient': 'radial-gradient(circle at 15% 20%, rgba(255,122,61,0.18), transparent 40%), radial-gradient(circle at 85% 75%, rgba(0,201,167,0.18), transparent 40%), radial-gradient(circle at 50% 50%, rgba(139,92,246,0.12), transparent 55%)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      boxShadow: {
        glow: '0 0 40px rgba(255,122,61,0.25)',
        glass: '0 8px 32px rgba(0,0,0,0.25)',
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
          '50%': { opacity: 0.75 },
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
