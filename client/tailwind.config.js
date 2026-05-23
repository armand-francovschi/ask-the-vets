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
        "carbon-black": "#172121",
        "charcoal-blue": "#444554",
        "rosy-granite": "#7f7b82",
        "lilac-ash": "#bfacb5",
        "almond-silk": "#e5d0cc",
        primary: {
          DEFAULT: "#444554",
          dark: "#172121",
          light: "#bfacb5",
        },
        accent: {
          DEFAULT: "#e5d0cc",
          dark: "#7f7b82",
        },
        background: "#e5d0cc",
      },
    },
  },
  plugins: [],
};
