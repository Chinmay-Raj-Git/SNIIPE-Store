/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{html,js}', './components/**/*.{html,js}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  // ... other Tailwind configurations
}

tailwind.config = {
  content: ['./pages/**/*.{html,js}', './components/**/*.{html,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary-color": "var(--primary-color)",
        "secondary-color": "var(--secondary-color)"
      },
    }
  }
}