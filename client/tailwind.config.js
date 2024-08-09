module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        "helvetica-neue": ['"Helvetica Neue"', "Arial", "sans-serif"],
        "arial-black": ['"Arial Black"', "Arial", "sans-serif"],
        "roboto-mono": ['"Roboto Mono"', "monospace"],
        roboto: ['"Roboto"', "sans-serif"],
        "open-sans": ['"Open Sans"', "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
