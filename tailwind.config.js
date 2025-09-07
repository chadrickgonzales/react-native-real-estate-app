/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        rubik: ["Rubik-Regular"],
        "rubik-bold": ["Rubik-Bold"],
        "rubik-extraBold": ["Rubik-ExtraBold"],
        "rubik-semiBold": ["Rubik-SemiBold"],
        "rubik-medium": ["Rubik-Medium"],
        "rubik-light": ["Rubik-Light"],
      },

      colors: {
        "primary" : {
          100: '#0061ff0a',
          200: '#0061ff1a',
          300: '#0061ff2a',
        },
        "accent" : {
          DEFAULT: '#000000',
          100: '#8c8e98',
          200: '#666876',
          300: '#191d31',
        },
        danger: '#f75555'
      }
    },
  },
  plugins: [],
}