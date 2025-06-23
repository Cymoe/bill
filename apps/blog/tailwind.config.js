/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
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
    },
  },
  plugins: [],
}