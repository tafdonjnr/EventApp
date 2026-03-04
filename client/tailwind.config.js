/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primaryStart: "#93A5CF",
        primaryEnd: "#E4EFE9",
        primaryText: "#1F2937",
        mutedText: "#6B7280",
        softBorder: "#E5E7EB",
      },
      backgroundImage: {
        primaryGradient: "linear-gradient(to right, #93A5CF, #E4EFE9)",
      },
      borderRadius: {
        xl: "1rem",
      },
      spacing: {
        section: "4rem",
      },
    },
  },
  plugins: [],
};

