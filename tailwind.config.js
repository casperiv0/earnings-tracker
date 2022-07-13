/* eslint-disable quotes */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#131517",
        secondary: "#1a1c20",
        tertiary: "#2d2f33",
        quaternary: "#3f4148",
        accent: "#0262ff",
      },
      borderRadius: {
        sm: "4px",
      },
      fontFamily: {
        sans: 'Raleway, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        serif: 'RobotoSlab, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
        mono: '"FiraCode", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      },
    },
  },
  plugins: [],
};
