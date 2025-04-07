/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./App.tsx",
    "./screens/**/*.{tsx,ts}",
    "./components/**/*.{tsx,ts}" // Добавляем эту строку
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#fafcfd", // Синий цвет
        accent: "#FFFFFF", // Желтый цвет
        backPrimary: "#011019", // Красный цвет
      },
      fontFamily: {
        "poppins-regular": ["Poppins-Regular", "sans-serif"],
        "poppins-bold": ["Poppins-Bold", "sans-serif"],
        "poppins-italic": ["Poppins-Italic", "sans-serif"],
        "poppins-black": ["Poppins-Black", "sans-serif"],
        "poppins-light": ["Poppins-Light", "sans-serif"],
        "poppins-medium": ["Poppins-Medium", "sans-serif"],
        "poppins-semibold": ["Poppins-SemiBold", "sans-serif"],
        "poppins-extrabold": ["Poppins-ExtraBold", "sans-serif"],
        "poppins-thin": ["Poppins-Thin", "sans-serif"],

        "manrope-bold": ["Manrope-Bold", "sans-serif"],
        "manrope-extrabold": ["Manrope-ExtraBold", "sans-serif"],
        "manrope-extralight": ["Manrope-ExtraLight", "sans-serif"],
        "manrope-light": ["Manrope-Light", "sans-serif"],
        "manrope-medium": ["Manrope-Medium", "sans-serif"],
        "manrope-regular": ["Manrope-Regular", "sans-serif"],
        "manrope-semibold": ["Manrope-SemiBold", "sans-serif"],
      }
    },
  },
  plugins: [],
}