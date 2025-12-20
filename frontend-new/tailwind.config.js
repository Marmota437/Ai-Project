/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        //'blob': "float 6s ease-in-out infinite",
        'float': "float 6s ease-in-out infinite",
        'float-delayed': "float 6s ease-in-out 3s infinite",
        
        'fade-in-up': "fadeInUp 0.8s ease-out forwards",
        
        'pulse-slow': "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" }, 
        },
        fadeInUp: {
          "0%": { 
            opacity: "0",
            transform: "translateY(20px)" 
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0)" 
          },
        },
      },
    },
  },
  plugins: [],
}