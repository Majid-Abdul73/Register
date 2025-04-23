/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // sans: ['Inter', 'sans-serif'], 
        sans: ['"Inter Tight"', 'sans-serif'], // override default

      },
      colors: {
        'register-green': '#16A34A',
        'register-green-light': '#F0FDF4',
        'register-black': '#111827',
        'register-gray': '#6B7280',
        
        'register-red': '#FF4D32',
       'register-red-light': '#FEE2E2',
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

