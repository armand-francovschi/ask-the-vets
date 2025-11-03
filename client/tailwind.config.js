/** @type {import('tailwindcss').Config} */

module.exports = {
  'at-rule-no-unknown': [true, {
    ignoreAtRules: ['tailwind', 'apply', 'variants', 'screen', 'layer'],
  }],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C3AED", // pleasant purple
          dark: "#5B21B6",
          light: "#C4B5FD",
        },
        accent: {
          DEFAULT: "#FDE68A", // light yellow
          dark: "#FACC15",
        },
        background: "#F5F3FF", // very light purple background
      },
    },
  },
  plugins: [],
};
