/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0f0f0f',
          2: '#555555',
          3: '#999999',
        },
        surface: {
          DEFAULT: '#ffffff',
          2: '#f7f6f3',
          3: '#f0efe9',
        },
        border: {
          DEFAULT: '#e8e6e0',
          2: '#d4d2cb',
        },
        gold: {
          DEFAULT: '#b8860b',
          light: '#f5f0e0',
        },
        brand: {
          green: '#2d6a3f',
          'green-light': '#e8f5ed',
          red: '#c0392b',
          'red-light': '#fdf0ee',
        },
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
      },
    },
  },
  plugins: [],
}
