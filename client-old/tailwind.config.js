/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a',   // green — fits the ESG/sustainability theme
        secondary: '#0ea5e9',
      },
    },
  },
  plugins: [],
};
