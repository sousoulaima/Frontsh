/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#3b82f6',
        'primary-blue-dark': '#1e40af',
        'primary-blue-darker': '#1e3a8a',
        'light-blue': '#e0f2fe',
        'accent-orange': '#f97316',
        'accent-purple': '#8b5cf6',
        'highlight-green': '#10b981',
        'text-dark': '#1e40af',
        'light-bg': '#f0f9ff',
        'light-border': '#bfdbfe',
      },
      animation: {
        'heartbeat': 'heartbeat 2s infinite ease-in-out',
        'fade-in': 'fade-in 1s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.8s ease-out forwards',
      },
      keyframes: {
        'heartbeat': {
          '0%': { transform: 'scale(1)' },
          '20%': { transform: 'scale(1.15)' },
          '40%': { transform: 'scale(1)' },
          '60%': { transform: 'scale(1.15)' },
          '80%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};