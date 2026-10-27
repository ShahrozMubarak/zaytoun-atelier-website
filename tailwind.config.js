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
          50: '#F5F7F5',
          100: '#E5EAE4',
          200: '#CCD6CB',
          300: '#A6B9A4',
          400: '#7A9677',
          500: '#557052',
          600: '#425840',
          700: '#364634',
          800: '#2C382A',
          900: '#1F271E',
          DEFAULT: '#364634',
        },
        camel: {
          50: '#FAF6F0',
          100: '#F3EBDD',
          200: '#E7D6BD',
          300: '#D8BD98',
          400: '#C69F6F',
          500: '#B68953',
          600: '#996F40',
          700: '#7B5633',
          800: '#62442B',
          900: '#4D3523',
          DEFAULT: '#C69F6F',
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
