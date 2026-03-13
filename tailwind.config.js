/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        stress: {
          yellow: '#4FC3F7',
          dark: '#0B1120',
          gray: '#131B2E',
          mint: '#4AE8A0',
          purple: '#7B5EA7',
          cyan: '#4FC3F7',
        },
      },
    },
  },
  plugins: [],
};