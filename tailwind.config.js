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
        sand: {
          50: '#FAF8F3',
          100: '#F5EFE4',
          200: '#ECE2CE',
          300: '#E6D3B3',
          400: '#D9C19B',
          500: '#C9AC80',
          600: '#B09164',
          700: '#8F7149',
          800: '#695132',
          900: '#45341F',
          DEFAULT: '#E6D3B3',
        },
        olive: {
          50: '#FAF8F3',
          100: '#F5EFE4',
          200: '#ECE2CE',
          300: '#E6D3B3',
          400: '#D9C19B',
          500: '#C9AC80',
          600: '#B09164',
          700: '#8F7149',
          800: '#695132',
          900: '#45341F',
          DEFAULT: '#E6D3B3',
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
