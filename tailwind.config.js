/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      spacing: {
        '20': '1rem',
      },
      colors: {
        // Paleta harmônica customizada
        dark: {
          bg: {
            primary: '#0F1419',    // Background principal - mais suave que preto
            secondary: '#1A1F2E',  // Surface/Cards
            elevated: '#242B3D',   // Cards elevados
            hover: '#2D3748',      // Hover states
          },
          border: {
            DEFAULT: '#2D3748',    // Bordas padrão
            light: '#374151',      // Bordas mais claras
            strong: '#4B5563',     // Bordas fortes
          },
          text: {
            primary: '#E2E8F0',    // Texto principal (off-white)
            secondary: '#A0AEC0',  // Texto secundário
            tertiary: '#718096',   // Texto terciário
          }
        },
        light: {
          bg: {
            primary: '#F8FAFC',    // Background principal - mais suave que branco
            secondary: '#FFFFFF',  // Surface/Cards
            elevated: '#FFFFFF',   // Cards elevados
            hover: '#F1F5F9',      // Hover states
          },
          border: {
            DEFAULT: '#E2E8F0',    // Bordas padrão
            light: '#F1F5F9',      // Bordas mais claras
            strong: '#CBD5E0',     // Bordas fortes
          },
          text: {
            primary: '#1A202C',    // Texto principal
            secondary: '#4A5568',  // Texto secundário
            tertiary: '#718096',   // Texto terciário
          }
        }
      },
    },
  },
  plugins: [],
};