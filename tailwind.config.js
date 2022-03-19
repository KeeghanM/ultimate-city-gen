module.exports = {
  content: [
    "./pages/**/*.{html,js,ts,jsx,tsx}",
    "./components/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      merri: ["Merriweather", "sans-serif"],
    },
    extend: {
      colors: {
        dark: "#0D1321",
        medium: "#434A42",
        light: "#F6F0ED",
        accent: "#7EA8BE",
        secondary: "#C2948A",
        white: "#fff",
      },
    },
  },
  plugins: [],
}
