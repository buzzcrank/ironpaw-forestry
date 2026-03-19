/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0f7f0',
          100: '#dceede',
          200: '#baddbe',
          300: '#8ec390',
          400: '#5fa362',
          500: '#3d8440',
          600: '#2f6832',
          700: '#265529',
          800: '#204424',
          900: '#1a3820',
          950: '#0d1f12',
        },
        bark: {
          400: '#8B6F47',
          600: '#6B4F2E',
          800: '#3D2B1A',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
