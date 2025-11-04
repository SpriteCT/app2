/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0e27',
          surface: '#131636',
          card: '#1a1f3f',
          border: '#252a50',
          purple: {
            primary: '#6b46c1',
            secondary: '#8b5cf6',
            accent: '#a78bfa',
            dark: '#4c1d95',
          }
        }
      },
    },
  },
  plugins: [],
}

