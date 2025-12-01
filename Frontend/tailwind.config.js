/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Tema estilo Uber
        uber: {
          black: '#000000',
          'dark-gray': '#1A1A1A',
          'medium-gray': '#545454',
          'light-gray': '#EEEEEE',
          'extra-light-gray': '#F6F6F6',
          green: '#00C853',
          'dark-green': '#00A843',
          'light-green': '#E8F5E9',
          white: '#FFFFFF',
          blue: '#1877F2',
          red: '#D32F2F',
          'light-red': '#FFEBEE',
          yellow: '#FFC107',
          'light-yellow': '#FFF9E6',
        },
        primary: {
          DEFAULT: '#000000',
          light: '#1A1A1A',
          dark: '#000000',
        },
        accent: {
          DEFAULT: '#00C853',
          light: '#00E865',
          dark: '#00A843',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'uber': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'uber-lg': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'uber-xl': '0 8px 24px rgba(0, 0, 0, 0.2)',
        'uber-card': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'uber-float': '0 10px 40px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'fade-out': 'fadeOut 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'dvh': '100dvh',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'dvh': '100dvh',
      },
      maxHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'dvh': '100dvh',
      },
      borderRadius: {
        'uber': '8px',
        'uber-lg': '12px',
        'uber-xl': '16px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};
