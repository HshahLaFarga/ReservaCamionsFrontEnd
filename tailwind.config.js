/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Redefinimos toda la gama de "blue" para que todas las clases bg-blue-*, text-blue-*, border-blue-*
        // apunten a la paleta corporativa Teal de LaFargaNet (#008c8c)
        blue: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#008c8c', // Color corporativo primario (Teal del sidebar)
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        brand: {
          teal: '#008c8c',
          rust: '#C45438'
        }
      }
    },
  },
  plugins: [],
};
