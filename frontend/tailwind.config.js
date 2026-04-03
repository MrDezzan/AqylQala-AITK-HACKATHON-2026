/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#EDF2F7', // Soft off-white with blue/gray hint
        surface: '#FFFFFF',
        primary: '#0055BB', 
        primaryHover: '#004499',
        accent: '#00AEEF',
        danger: '#DC2626',
        warning: '#D97706',
        success: '#059669',
        border: '#CBD5E1', // Stronger border contrast
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
