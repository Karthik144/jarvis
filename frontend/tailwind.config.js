/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        pulse: {
          "0%, 100%": {
            opacity: 1,
            transform: "scale(1)", // No scale at 0% and 100%
          },
          "50%": {
            opacity: 0.1, // More dramatic opacity change
            transform: "scale(1.05)", // Slightly larger at 50%
          },
        },
      },
      animation: {
        "pulse-slow": "pulse 1.5s ease-in-out infinite", // Faster and using ease-in-out
      },
    },
  },
  plugins: [],
};
