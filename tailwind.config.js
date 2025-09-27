// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Define your custom font families
      fontFamily: {
        // This is the primary font from the HTML: font-family: "Plus Jakarta Sans", ...
        'jakarta-sans': ['PlusJakartaSans-Regular'],
        // This is the secondary font, used as a fallback or for specific elements
        'noto-sans': ['NotoSans-Regular'], 
      },
    },
  },
  plugins: [],
};