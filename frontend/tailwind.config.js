/** @type {import('tailwindcss').Config} */
export default {
  // Enable class-based dark mode — toggled by adding 'dark' class to <html>
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink:    '#f8a4c8',
          'pink-dark': '#e87ab0',
          purple:  '#b983d4',
          'purple-dark': '#9a5cbf',
          teal:    '#4ecdc4',
          'teal-dark': '#38b2aa',
          light:   '#fef6fb',
          dark:    '#1a1025',
          card:    '#ffffff',
          'card-dark': '#251535',
          muted:   '#6b7280',
          'muted-dark': '#9ca3af',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        xl:  '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
