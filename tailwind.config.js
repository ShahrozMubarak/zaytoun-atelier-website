/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#F6F7F6',
          100: '#E7EAE6',
          200: '#CFD6CE',
          300: '#ABBAAA',
          400: '#7F937D',
          500: '#5C6E5A',
          600: '#485746',
          700: '#3A4638',
          800: '#2E372D',
          900: '#1F251E',
          DEFAULT: '#3A4638',
        },
        camel: {
          50: '#FAF6F0',
          100: '#F4ECE0',
          200: '#E9D9C3',
          300: '#DEC4A1',
          400: '#CCA372',
          500: '#BD9057',
          600: '#A47942',
          700: '#845D33',
          800: '#674727',
          900: '#51371E',
          DEFAULT: '#BD9057',
        },
        onyx: {
          50: '#F4F5F6',
          100: '#E5E7EB',
          200: '#D1D5DB',
          400: '#9CA3AF',
          600: '#4B5563',
          800: '#1F2429',
          900: '#111315',
          950: '#0A0B0D',
          DEFAULT: '#111315',
        },
        linen: {
          50: '#FFFFFF',
          100: '#FAF8F5',
          200: '#F3EFE7',
          300: '#E8E1D5',
          DEFAULT: '#FAF8F5',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
