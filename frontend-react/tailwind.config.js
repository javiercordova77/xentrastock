/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nueva paleta profesional XentraStock v3.1
        primary: {
          50: '#eff2ff',
          100: '#dde8ff',
          200: '#c1d5ff',
          300: '#9bb8ff',
          400: '#7290ff',
          500: '#5270ff',
          600: '#435FA6', // Color primario principal actualizado
          700: '#344894',
          800: '#1e2d54',
          900: '#142140',
        },
        secondary: {
          50: '#eff2ff',
          100: '#dfe8ff',
          200: '#c6d5ff',
          300: '#a3b7ff',
          400: '#8291ff',
          500: '#6672ff',
          600: '#4B69AE', // Color secundario principal
          700: '#3e5389',
          800: '#2f4167',
          900: '#203050',
        },
        success: {
          50: '#f2f8f3',
          100: '#e0f0e3',
          200: '#c3e0c9',
          300: '#96c8a0',
          400: '#6aa76f',
          500: '#59A45E', // Success
          600: '#4a8651',
          700: '#3d6b43',
          800: '#345538',
          900: '#2d4630',
        },
        warning: {
          50: '#fdf6f0',
          100: '#fae8d9',
          200: '#f4ccb3',
          300: '#eda782',
          400: '#e5794f',
          500: '#D26E37', // Warning
          600: '#b85a2c',
          700: '#954825',
          800: '#7a3c22',
          900: '#63331f',
        },
        error: {
          50: '#fdf2f6',
          100: '#fce7ed',
          200: '#f9d0dd',
          300: '#f4a8c0',
          400: '#ed7198',
          500: '#CA4784', // Error
          600: '#b03d72',
          700: '#923460',
          800: '#782c53',
          900: '#652747',
        },
        // Colores de superficie y texto profesionales
        surface: '#FFFFFF',
        'bg-primary': '#F1EFF6',
        'text-primary': '#1E1E1E',
        'text-secondary': '#666666',
        border: '#E6E6EB',
        disabled: '#CFCFD6',
      },
      backgroundColor: {
        'app': '#F1EFF6',
      },
      borderColor: {
        'app': '#E6E6EB',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}