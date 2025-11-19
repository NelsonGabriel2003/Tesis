export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        cormorant: ["Cormorant Garamond", "serif"],
      },
      colors: {
        primaryClr: "#7A5AF8",
      }
    }
  },
  plugins: [],
};
