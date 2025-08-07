/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#12173b',
        secondary: '#7546ed',
        accent: '#dc89ff',
        muted: '#b1a9e5',
        navy: '#032c7d',
      },
      keyframes: {
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-scale': 'fade-in-scale 0.6s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
};
