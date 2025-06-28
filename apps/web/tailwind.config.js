/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'steel-blue': '#336699',
        'carbon-black': '#121212',
        'concrete-gray': '#333333',
        'equipment-yellow': '#F9D71C',
        'blueprint-blue': '#0D47A1',
        'warning-red': '#D32F2F',
        'success-green': '#388E3C',
        'industrial-silver': '#9E9E9E',
        'background-dark': '#121212',
        'background-medium': '#1E1E1E',
        'background-light': '#333333',
        'primary-blue': '#3b82f6',
      },
      fontFamily: {
        'condensed': ['Roboto Condensed', 'sans-serif'],
        'sans': ['Roboto', 'sans-serif'],
        'mono': ['Roboto Mono', 'monospace'],
      },
      keyframes: {
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' }
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'slide-out': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        'progress-fill': 'progress-fill 0.5s ease-out forwards',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'slide-out': 'slide-out 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s ease-out infinite'
      }
    },
  },
  plugins: [],
};