/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A1929',
        secondary: '#1E3A5F',
        accent: '#00D9FF',
        'accent-secondary': '#7B61FF',
        success: '#00FF88',
        warning: '#FFB800',
        error: '#FF3366',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0BEC5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 217, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(123, 97, 255, 0.5)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.5)',
        'glow-error': '0 0 20px rgba(255, 51, 102, 0.5)',
      },
      backdropBlur: {
        'glass': '10px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 217, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
