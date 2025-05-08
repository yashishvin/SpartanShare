/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sjsu-blue': '#0055A2',
        'sjsu-gold': '#E5A823'
      }
    },
  },
  plugins: [],
}