/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0A0F',
          card: '#13131A',
          elevated: '#1A1A26',
          border: '#1E1E2E',
        },
        light: {
          bg: '#F5F6FA',
          card: '#FFFFFF',
          elevated: '#F0F1F8',
          border: '#E0E2F0',
        },
        accent: {
          primary: '#6C5CE7',
          secondary: '#A29BFE',
        },
        success: '#00D68F',
        warning: '#FFB800',
        danger: '#FF4D6A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}