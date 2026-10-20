import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7f2',
          100: '#d4ecde',
          200: '#a9d9bd',
          300: '#75bf97',
          400: '#4aa176',
          500: '#2f855a',
          600: '#226b48',
          700: '#1c553b',
          800: '#184430',
          900: '#143828',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 6px -1px rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config;
