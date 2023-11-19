import type { Config } from "tailwindcss";
const defaultTheme = require("tailwindcss/defaultTheme");

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins Regular"],
        "poppins-light": ["Poppins Light"],
        "poppins-bold": ["Poppins Bold"],
        "poppins-semibold": ["Poppins Semibold"],
        "poppins-medium": ["Poppins Medium"],
        "poppins-extralight": ["Poppins ExtraLight"],
      },
      colors: {
        primary: "#14425F",
        secondary: "#010101",
        blue: "#1CA1F2",
      },
    },
  },
  plugins: [],
};
export default config;
