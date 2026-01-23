/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#606C38", // Olive Green
          dark: "#283618", // Dark Forest Green
          light: "#8A9A5B", // Lighter Olive
        },
        secondary: {
          DEFAULT: "#FEFAE0", // Cream/Beige
          dark: "#F0EAD6", // Darker Cream
        },
        accent: {
          DEFAULT: "#BC6C25", // Earthy Orange/Brown
          light: "#DDA15E", // Gold/Earth
        },
        surface: "#FAFAF5", // Nearly white cream for cards
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
      },
    },
  },
  plugins: [],
};
