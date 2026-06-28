/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./frontend/src/app/**/*.{js,ts,jsx,tsx}",
    "./frontend/src/components/**/*.{js,ts,jsx,tsx}",
    "./frontend/src/pages/**/*.{js,ts,jsx,tsx}",
    "./frontend/src/styles/**/*.{css}" // include if you keep styles here
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
