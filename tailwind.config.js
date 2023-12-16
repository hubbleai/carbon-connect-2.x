/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'cc-',
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        'google-blue': '#4285f4',
        'button-active-blue': '#1669F2',
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
    },
    screens: {
      xs: '320px',
      sm: '640px',
      // => @media (min-width: 640px) { ... }

      md: '768px',
      // => @media (min-width: 768px) { ... }

      lg: '1024px',
      // => @media (min-width: 1024px) { ... }

      xl: '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
  },
  plugins: [],
};
