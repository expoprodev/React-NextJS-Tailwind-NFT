const { join } = require('path')

module.exports = {
  content: [
    join(__dirname, './src/pages/**/*.{js,ts,jsx,tsx}'),
    join(__dirname, './src/components/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      fontFamily: {
        lato: ['Roboto', 'sans-serif'],
        'roboto-h': ['Roboto Black', 'sans-serif'],
        'roboto-b': ['Roboto Bold', 'sans-serif'],
        'roboto-m': ['RobotoM edium', 'sans-serif'],
        'roboto-r': ['Roboto Regular', 'sans-serif'],
        'roboto-l': ['Roboto Light', 'sans-serif'],
        'monument-r': ['Monument Extended Regular', 'sans-serif'],
        'monument-ub': ['Monument Extended Ultrabold', 'sans-serif'],
        VCR: ['VCR', 'sans-serif'],
      },
      animation: {
        blob: 'blob 7s infinite',
        tilt: 'tilt 10s infinite linear',
        border: 'border 10s infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate (0px, 0px) scale(1)',
          },
        },
        tilt: {
          '0%, 50%, 100%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(0.5deg)',
          },
          '75%': {
            transform: 'rotate(-0.5deg)',
          },
        },
        border: {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
      },
    },
  },
  plugins: [require('tailwind-scrollbar'), require("flowbite/plugin")],
  variants: {
    extend: { scrollbar: ['rounded'] },
  },
}
