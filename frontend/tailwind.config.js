/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#ff8a00",
          orangeDark: "#e66f00",
          blue: "#006bff",
          blueDark: "#003bb5"
        },
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #ff8a00 0%, #ff5200 20%, #006bff 80%, #003bb5 100%)"
      },
      boxShadow: {
        card: "0 8px 20px rgba(0,0,0,0.08)"
      },
      borderRadius: {
        xl: "1rem"
      }
    },
  },
};
