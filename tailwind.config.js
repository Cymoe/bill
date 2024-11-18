/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' }
        }
      },
      animation: {
        'progress-fill': 'progress-fill 0.5s ease-out forwards'
      }
    },
  },
  plugins: [],
};