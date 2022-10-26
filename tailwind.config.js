const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      boxShadow: {
        inputRed: ["0 0 0 1px #ef4444"],
        input: ["0 0 0 1px #6366f1"],
      },
    },
    screens: {
      xs: "475px",
      ...defaultTheme.screens,
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
