/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        swift: {
          orange: '#EF9F27',
          'orange-hover': '#D85A30',
          blue: '#185FA5',
          'blue-dark': '#0C447C',
          green: '#3B6D11',
          red: '#A32D2D',
          dark: '#2C2C2A',
          mid: '#888780',
          bg: '#F7F5F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'button': '8px',
        'input': '8px',
        'card': '12px',
        'modal': '16px',
        'pill': '999px',
      },
      boxShadow: {
        'card': '0 1px 4px rgba(0,0,0,0.08)',
        'modal': '0 4px 20px rgba(0,0,0,0.14)',
      },
      screens: {
        'xs': '320px',
        'sm': '480px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    },
  },
  plugins: [],
}
