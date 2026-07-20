/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // important
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Avenir Next", "Segoe UI", "sans-serif"],
        serif: ["Fraunces", "Iowan Old Style", "Palatino Linotype", "serif"],
      },
    },
  },
  plugins: [],
}