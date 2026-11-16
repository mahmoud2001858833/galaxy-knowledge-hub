/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif'],
      },
      colors: {
        // لوحة ألوان مرجع يمان
        yaman: {
          primary: '#A87948',
          'primary-hover': '#946535',
          'primary-dark': '#784F25',
          accent: '#B38752',
          'bg-light': '#FAF7F0',
          'bg-card': '#FDFBF7',
          border: '#E4D7C3',
          'border-light': '#DCCAaf',
          'text-main': '#382C1E',
          'text-muted': '#665440',
          'text-light': '#7D5329',
          emerald: '#059669',
          'emerald-hover': '#047857',
          'emerald-light': '#ecfdf5',
          teal: '#0d9488',
          blue: '#2563eb',
          amber: '#f59e0b',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        }
      }
    },
  },
  plugins: [],
}
