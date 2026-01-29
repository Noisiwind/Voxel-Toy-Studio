/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          sky: '#f0f2f5',
          ground: '#e2e8f0',
        }
      }
    },
  },
  plugins: [],
}
