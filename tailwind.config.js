/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#effaf6',
          100: '#d7f2e6',
          200: '#b0e5cf',
          300: '#7bd3b3',
          400: '#44b893',
          500: '#1f9c7a',
          600: '#0d7c66',
          700: '#0b6453',
          800: '#0c5044',
          900: '#0b4239',
          950: '#04251f',
        },
        gold: {
          50: '#fdfaee',
          100: '#faf2d0',
          200: '#f4e29c',
          300: '#edcd60',
          400: '#e6c068',
          500: '#d9a93a',
          600: '#c08928',
          700: '#9a6622',
          800: '#7e5120',
          900: '#6c441f',
        },
        teal: {
          50: '#effefb',
          100: '#c8fff7',
          200: '#91ffef',
          300: '#52f8e3',
          400: '#1ce8d2',
          500: '#06cec0',
          600: '#01a49b',
          700: '#03807c',
          800: '#0a6462',
          900: '#0d5252',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'Scheherazade New', 'serif'],
        malayalam: ['"Noto Sans Malayalam"', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shake': {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-6px)' },
          '40%,80%': { transform: 'translateX(6px)' },
        },
        'success-pulse': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.06)', opacity: '0.9' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'pop-in': 'pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'shake': 'shake 0.4s ease-in-out',
        'success-pulse': 'success-pulse 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
