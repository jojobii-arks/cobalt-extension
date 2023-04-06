/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        main: {
          content: '#fafafa',
          50: '#a3a3a3',
          100: '#262626',
          200: '#171717',
          300: '#0a0a0a',
        },
      },
    },
  },
  plugins: [],
};
