/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a1a1a",
        secondary: "#1e1e1e",
        tertiary: "#2f2f2f",
        quaternary: "#2b2b2b",
      },
      borderRadius: {
        sm: "4px",
      },
      fontFamily: {
        sans: 'Raleway, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        serif: 'Roboto Slab, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      },
    },
  },
  plugins: [],
};
